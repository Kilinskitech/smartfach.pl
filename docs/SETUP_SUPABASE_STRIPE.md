# Podłączenie Supabase i Stripe

Stan: 2026-09-06. Najpierw uruchom cały przepływ w trybie testowym. Nie wklejaj
sekretów do rozmowy ani GitHub. Konfiguruj je wyłącznie w środowiskach Vercela.

## Środowisko alfy

Na etapie przed pierwszymi realnymi klientami jeden hostowany projekt Supabase i
jeden Stripe Sandbox obsługują stałą gałąź Vercel `preview` oraz Production.
Nie uruchamiamy lokalnej aplikacji, lokalnego Supabase ani lokalnego Stripe.

W Vercel te same testowe wartości należy przypisać do **Production i Preview**,
z wyjątkiem wartości zależnych od adresu aplikacji oraz sekretu webhooka. Po zmianie
zmiennych trzeba wykonać nowe wdrożenie. Przed Stripe Live lub danymi realnych klientów
jest obowiązkowa osobna baza testowa i osobny zestaw kluczy produkcyjnych.

Zalecany stały adres Preview to `https://preview.smartfach.pl`, przypisany w Vercel
do gałęzi `preview`. Dzięki temu callback Supabase i powrót ze Stripe nie zmieniają
adresu po każdym wdrożeniu.

### Zmienne w Vercel

Te same testowe wartości przypisz do **Production i Preview**:

- `NEXT_PUBLIC_SUPABASE_URL`;
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`;
- `SUPABASE_SECRET_KEY`;
- `PLATFORM_ADMIN_USER_ID`;
- `PLATFORM_ADMIN_EMAIL` — opcjonalny adres administratora; UUID pozostaje
  zalecanym identyfikatorem;
- `STRIPE_SECRET_KEY`, `STRIPE_PRICE_LITE` i `STRIPE_PRICE_PRO`;
- wszystkie zmienne `OPENROUTER_*` oraz `SMARTFACH_ENABLE_AI`.

Wartość zależna od środowiska:

- Production: `NEXT_PUBLIC_APP_URL=https://smartfach.pl`;
- Preview: `NEXT_PUBLIC_APP_URL=https://preview.smartfach.pl`.

Na wspólnym Stripe Sandbox produkcyjny webhook może tymczasowo synchronizować tę
samą bazę dla obu aplikacji. `STRIPE_WEBHOOK_SECRET` musi jednak pozostać ustawiony
w obu środowiskach, ponieważ aplikacja używa go do sprawdzenia kompletności konfiguracji.
Jeżeli dodasz osobny webhook Preview, otrzyma on własny sekret podpisu.

### Dostęp do chronionego Preview

Vercel Standard Protection domyślnie pokazuje na Preview ekran logowania. Dostęp
uzyskujemy przez konto zespołu Vercel lub połączony Vercel CLI; nie przechowujemy
sekretu obejścia w projekcie. Jeżeli zewnętrzny test automatyczny będzie później
potrzebny, konfigurujemy Protection Bypass for Automation poza repozytorium.

W Supabase Auth pozostaw Site URL `https://smartfach.pl` i dodaj do Redirect URLs:
`https://preview.smartfach.pl/auth/callback`.

## 1. Supabase

1. Utwórz projekt Supabase w regionie UE.
2. W SQL Editor uruchom migracje w kolejności nazw:
   - `supabase/migrations/202609040001_initial_saas.sql`;
   - `supabase/migrations/202609050001_sales_entry_plans.sql`;
   - `supabase/migrations/202609050002_fix_workspace_write.sql`;
   - `supabase/migrations/202609060003_single_builder_profile.sql`;
   - `supabase/migrations/20260907120000_usage_top_ups.sql`.
   - `supabase/migrations/20260907180000_legal_purchases_operator.sql`;
   - `supabase/migrations/20260907190000_withdrawal_requests.sql`.
3. W ustawieniach Auth ustaw Site URL na `NEXT_PUBLIC_APP_URL`.
4. Dodaj redirect URL: `NEXT_PUBLIC_APP_URL/auth/callback`.
5. Z Project Settings → API Keys skopiuj do Vercel Environment Variables dla
   Preview i Production:
   - `NEXT_PUBLIC_SUPABASE_URL`;
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`;
   - `SUPABASE_SECRET_KEY` — nowy klucz `sb_secret_`, wyłącznie po stronie serwera.

Nie używaj starszych kluczy JWT `anon` ani `service_role`. Supabase zapowiedział
ich wycofanie do końca 2026 roku.

Po ponownym wdrożeniu Preview formularz `/logowanie` tworzy prawdziwego użytkownika,
profil, prywatną organizację, pusty workspace i nieaktywną subskrypcję. Jeżeli
potwierdzanie e-maila jest włączone, użytkownik nie czeka na link: od razu przechodzi
do Stripe, a adres potwierdza na ekranie po Checkout.

W Authentication → Email Templates ustaw polski szablon zgodnie z
`docs/SUPABASE_EMAILS.md`. Przed realnymi rejestracjami podłącz własny SMTP;
domyślna wysyłka Supabase służy wyłącznie do ograniczonych testów.

## 2. Stripe w trybie testowym

1. Utwórz dwa produkty lub dwie miesięczne ceny recurring:
   Lite 49 zł i Pro 99 zł.
2. Wklej identyfikatory `price_...` do `STRIPE_PRICE_LITE` i
   `STRIPE_PRICE_PRO`. Nie używaj identyfikatorów `prod_...`.
3. Wklej testowy secret key do `STRIPE_SECRET_KEY`.
4. W Customer Portal włącz anulowanie subskrypcji. Zmianę planu włącz tylko dla
   tych samych dwóch miesięcznych cen.
5. Utwórz endpoint webhooka:
   `NEXT_PUBLIC_APP_URL/api/stripe/webhook`.
6. Subskrybuj zdarzenia:
   - `checkout.session.completed`;
   - `checkout.session.async_payment_succeeded`;
   - `customer.subscription.created`;
   - `customer.subscription.updated`;
   - `customer.subscription.deleted`.
7. Secret podpisu endpointu wklej do `STRIPE_WEBHOOK_SECRET`.

### Potwierdzenia e-mail i timeout webhooka (2026-09-09)

Webhook zapisuje zakup i niezmienną umowę w `purchase_contracts`, a następnie
odpowiada Stripe bez czekania na SMTP. Pierwsza próba wysyłki działa po odpowiedzi.
W razie przerwania procesu chronione zadanie `/api/maintenance/contract-emails`
ponawia niewysłane potwierdzenia co 2 minuty w Production, do 5 równolegle na przebieg.
Wymagany jest `CRON_SECRET` w Vercelu (Secret, bez NEXT_PUBLIC_); używamy istniejącego
sekretu zadania czyszczenia. Nie trzeba zmieniać webhooka ani wykonywać migracji.

Sprawdź w Vercel Cron Jobs harmonogram i HTTP 200 pierwszego przebiegu. HTTP 503
oznacza problem konfiguracji/bazy albo co najmniej jedną nieudaną próbę SMTP;
kolejka pozostaje do ponowienia. W adminie licznik zaległych e-maili pokazuje
potwierdzenia niewysłane od ponad 10 minut. Wysyłka ma stały Message-ID i blokadę
współbieżności; sporadyczne ponowne dostarczenie kopii po awarii zapisu jest możliwe,
ale nie powoduje ponownego obciążenia lub zwiększenia limitu.

Test: ukończ Checkout, sprawdź 200 webhooka, zapis umowy oraz `email_sent_at`;
ponów ten sam event i sprawdź, że limit nie wzrasta drugi raz. Awaria SMTP nie
powinna zmienić wyniku webhooka na błąd, jeśli zapis zakupu i umowy się udał.

Checkout zbiera kartę przed startem, tworzy 3-dniową próbę i po jej zakończeniu
przechodzi w miesięczną subskrypcję, jeżeli użytkownik wcześniej jej nie anuluje.
SmartFach przechowuje identyfikatory klienta/subskrypcji i stan metody płatności,
ale nie numer karty ani CVC.

## 3. Pierwsze konto i panel właściciela

1. Wdróż ponownie gałąź `preview` po ustawieniu zmiennych.
2. Załóż konto na Preview przez `/logowanie` i ukończ Stripe Checkout kartą testową.
3. W Supabase Auth skopiuj UUID tego użytkownika.
4. Wklej go do `PLATFORM_ADMIN_USER_ID` w Vercelu i ponownie wdróż Preview.
   Alternatywnie ustaw `PLATFORM_ADMIN_EMAIL`; dla bezpieczeństwa produkcyjnego
   preferowany jest jednak niezmienny UUID użytkownika.
5. Po zalogowaniu to konto ma dostęp do `/admin`. Inni użytkownicy są przekierowani
   do `/app` i nie otrzymują dostępu administracyjnego.

Panel główny pokazuje agregaty i użytkowników. Pełna treść rozmów jest widoczna
dopiero po wejściu w profil konkretnego użytkownika, a każde takie otwarcie zapisuje
`admin_audit_events`.

## 4. OpenRouter

Uzupełnij `OPENROUTER_API_KEY`, pozostaw `OPENROUTER_REQUIRE_ZDR=true` i ustaw
`SMARTFACH_ENABLE_AI=true` dopiero wtedy, gdy chcesz wykonać płatne wywołania.
Modele są ustalone w kodzie: GPT-5 Nano do zwykłej rozmowy, GPT-5.6 Luna do
startu, obrazów i trudniejszych zadań oraz Gemini 3.8 Flash jako awaryjny fallback.
Stara zmienna Vercela `OPENROUTER_MODEL` może zostać usunięta i nie wpływa już na
działanie aplikacji. Pole `usage` odpowiedzi zapisuje koszt, tokeny,
faktycznie użyty model, dostawcę i identyfikator żądania per użytkownik.

## 5. Test akceptacyjny przed live

- Rejestracja i potwierdzenie e-maila.
- Odzyskiwanie i zmiana hasła z polską wiadomością Supabase.
- Wejście zalogowanego administratora na `/logowanie` przekierowuje do `/admin`.
- Bezpośrednie przejście rejestracja → Stripe bez blokującego ekranu e-mail.
- Brak płatnego odnowienia, gdy adres nie został potwierdzony przed końcem trialu.
- Powrót z Checkout i status `trialing`.
- Brak dostępu do `/app` przed aktywną próbą.
- Zapis profilu i rozmowy po odświeżeniu.
- Anulowanie oraz zmiana planu w portalu i poprawna synchronizacja webhooka.
- Ponowne wysłanie tego samego webhooka bez podwójnego skutku.
- Test SMTP z panelu administratora oraz potwierdzenie umowy po ukończonym Checkout.
- Zakup każdego zwiększenia limitu, anulowanie Checkout i idempotentny powrót.
- Odnowienie subskrypcji resetuje miesięczne użycie bez przywracania zużytego
  zwiększenia.
- Dwa konta w dwóch organizacjach: brak odczytu i zapisu danych drugiego konta.
- Administrator widzi rozmowę tylko w profilu użytkownika; audyt zapisuje otwarcie.
- Alerty dla błędów webhooka i przekroczeń kosztu AI.

## 6. Czego ten etap jeszcze nie uruchamia

- Kont pracowników i planu Firma.
- Automatycznego fakturowania zgodnego z polskimi obowiązkami.
- Produkcyjnej retencji, backupów i bezpiecznego magazynu załączników.

Publiczne ceny są całkowite: Lite 49 zł i Pro 99 zł miesięcznie, bez doliczania podatku
w Checkout. Kwoty Stripe muszą być identyczne. Przed pierwszą realną opłatą potrzebny
jest przegląd prawny i księgowy oraz konfiguracja wiadomości przed końcem próby.
Aktualną checklistę oraz SMTP potwierdzeń umów opisuje `docs/LAUNCH_CHECKLIST.md`.
