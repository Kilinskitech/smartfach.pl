# Podłączenie Supabase i Stripe

Stan: 2026-09-06. Najpierw uruchom cały przepływ w trybie testowym. Nie wklejaj
sekretów do rozmowy ani GitHub. Używaj `.env.local`, który jest ignorowany przez Git.

## Środowisko alfy

Na etapie przed pierwszymi realnymi klientami jeden hostowany projekt Supabase i
jeden Stripe Sandbox obsługują Local, stałą gałąź Vercel `preview` oraz Production.
Nie uruchamiamy osobnego Supabase na komputerze. `.env.local` zawiera tylko połączenie
lokalnej aplikacji z tym samym backendem testowym.

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
- `STRIPE_SECRET_KEY` i trzy `STRIPE_PRICE_*`;
- wszystkie zmienne `OPENROUTER_*` oraz `SMARTFACH_ENABLE_AI`.

Wartość zależna od środowiska:

- Production: `NEXT_PUBLIC_APP_URL=https://smartfach.pl`;
- Preview: `NEXT_PUBLIC_APP_URL=https://preview.smartfach.pl`.

Na wspólnym Stripe Sandbox produkcyjny webhook może tymczasowo synchronizować tę
samą bazę dla obu aplikacji. `STRIPE_WEBHOOK_SECRET` musi jednak pozostać ustawiony
w obu środowiskach, ponieważ aplikacja używa go do sprawdzenia kompletności konfiguracji.
Jeżeli dodasz osobny webhook Preview, otrzyma on własny sekret podpisu.

### Dostęp Codex do chronionego Preview

Vercel Standard Protection domyślnie pokazuje na Preview ekran logowania. Pozostaw
ochronę włączoną. W Project → Settings → Deployment Protection utwórz **Protection
Bypass for Automation**, a jego sekret zapisz lokalnie jako
`VERCEL_AUTOMATION_BYPASS_SECRET`. Adres `https://preview.smartfach.pl` zapisz jako
`SMARTFACH_PREVIEW_URL`. Obie wartości zostają wyłącznie w `.env.local`; pozwalają
wykonywać testy HTTP bez ujawniania Preview publicznie i bez sterowania przeglądarką.

W Supabase Auth pozostaw Site URL `https://smartfach.pl` i dodaj do Redirect URLs:
`https://preview.smartfach.pl/auth/callback`.

## 1. Supabase

1. Utwórz projekt Supabase w regionie UE.
2. W SQL Editor uruchom migracje w kolejności nazw:
   - `supabase/migrations/202609040001_initial_saas.sql`;
   - `supabase/migrations/202609050001_sales_entry_plans.sql`;
   - `supabase/migrations/202609050002_fix_workspace_write.sql`.
3. W ustawieniach Auth ustaw Site URL na `NEXT_PUBLIC_APP_URL`.
4. Dodaj redirect URL: `NEXT_PUBLIC_APP_URL/auth/callback`.
5. Z Project Settings → API Keys skopiuj do `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`;
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`;
   - `SUPABASE_SECRET_KEY` — nowy klucz `sb_secret_`, wyłącznie po stronie serwera.

Nie używaj starszych kluczy JWT `anon` ani `service_role`. Supabase zapowiedział
ich wycofanie do końca 2026 roku.

Po restarcie aplikacji formularz `/logowanie` tworzy prawdziwego użytkownika,
profil, prywatną organizację, pusty workspace i nieaktywną subskrypcję. Jeżeli
potwierdzanie e-maila jest włączone, użytkownik nie czeka na link: od razu przechodzi
do Stripe, a adres potwierdza na ekranie po Checkout.

W Authentication → Email Templates ustaw polski szablon zgodnie z
`docs/SUPABASE_EMAILS.md`. Przed realnymi rejestracjami podłącz własny SMTP;
domyślna wysyłka Supabase służy wyłącznie do ograniczonych testów.

## 2. Stripe w trybie testowym

1. Utwórz trzy produkty lub trzy miesięczne ceny recurring:
   Lite 49 zł, Pro 99 zł i Firma 299 zł.
2. Wklej identyfikatory `price_...` do `STRIPE_PRICE_LITE`, `STRIPE_PRICE_PRO`
   i `STRIPE_PRICE_FIRMA`.
3. Wklej testowy secret key do `STRIPE_SECRET_KEY`.
4. W Customer Portal włącz anulowanie subskrypcji. Zmianę planu włącz tylko dla
   tych samych trzech miesięcznych cen.
5. Utwórz endpoint webhooka:
   `NEXT_PUBLIC_APP_URL/api/stripe/webhook`.
6. Subskrybuj zdarzenia:
   - `checkout.session.completed`;
   - `customer.subscription.created`;
   - `customer.subscription.updated`;
   - `customer.subscription.deleted`.
7. Secret podpisu endpointu wklej do `STRIPE_WEBHOOK_SECRET`.

Checkout zbiera kartę przed startem, tworzy 3-dniową próbę i po jej zakończeniu
przechodzi w miesięczną subskrypcję, jeżeli użytkownik wcześniej jej nie anuluje.
SmartFach przechowuje identyfikatory klienta/subskrypcji i stan metody płatności,
ale nie numer karty ani CVC.

## 3. Pierwsze konto i panel właściciela

1. Uruchom aplikację ponownie.
2. Załóż konto przez `/logowanie` i ukończ Stripe Checkout kartą testową.
3. W Supabase Auth skopiuj UUID tego użytkownika.
4. Wklej go do `PLATFORM_ADMIN_USER_ID` i ponownie uruchom serwer.
5. Po zalogowaniu to konto ma dostęp do `/admin`. Inni użytkownicy są przekierowani
   do `/app` i nie otrzymują dostępu administracyjnego.

Panel główny pokazuje agregaty i użytkowników. Pełna treść rozmów jest widoczna
dopiero po wejściu w profil konkretnego użytkownika, a każde takie otwarcie zapisuje
`admin_audit_events`.

## 4. OpenRouter

Uzupełnij `OPENROUTER_API_KEY`, wybierz `OPENROUTER_MODEL`, pozostaw
`OPENROUTER_REQUIRE_ZDR=true` i ustaw `SMARTFACH_ENABLE_AI=true` dopiero wtedy,
gdy chcesz wykonać płatne wywołania. Pole `usage` odpowiedzi zapisuje koszt, tokeny,
model, dostawcę i identyfikator żądania per użytkownik.

## 5. Test akceptacyjny przed live

- Rejestracja i potwierdzenie e-maila.
- Bezpośrednie przejście rejestracja → Stripe bez blokującego ekranu e-mail.
- Brak płatnego odnowienia, gdy adres nie został potwierdzony przed końcem trialu.
- Powrót z Checkout i status `trialing`.
- Brak dostępu do `/app` przed aktywną próbą.
- Zapis klienta, rozmowy, wyceny i PDF po odświeżeniu.
- Anulowanie oraz zmiana planu w portalu i poprawna synchronizacja webhooka.
- Ponowne wysłanie tego samego webhooka bez podwójnego skutku.
- Dwa konta w dwóch organizacjach: brak odczytu i zapisu danych drugiego konta.
- Administrator widzi rozmowę tylko w profilu użytkownika; audyt zapisuje otwarcie.
- Alerty dla błędów webhooka i przekroczeń kosztu AI.

## 6. Czego ten etap jeszcze nie uruchamia

- Dokupowania dodatkowego limitu.
- Loginów i zaproszeń pracowników.
- Automatycznego fakturowania zgodnego z polskimi obowiązkami.
- Produkcyjnej retencji, backupów i bezpiecznego magazynu załączników.

Przed pierwszą realną opłatą potrzebny jest przegląd prawny i księgowy, decyzja
czy publiczne ceny są brutto czy netto oraz konfiguracja wiadomości przed końcem próby.
