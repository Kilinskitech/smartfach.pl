# Podłączenie Supabase i Stripe

Stan: 2026-09-05. Najpierw uruchom cały przepływ w trybie testowym. Nie wklejaj
sekretów do rozmowy ani GitHub. Używaj `.env.local`, który jest ignorowany przez Git.

## 1. Supabase

1. Utwórz projekt Supabase w regionie UE.
2. W SQL Editor uruchom migracje w kolejności nazw:
   - `supabase/migrations/202609040001_initial_saas.sql`;
   - `supabase/migrations/202609050001_sales_entry_plans.sql`.
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
potwierdzanie e-maila jest włączone, użytkownik najpierw otwiera link z wiadomości.

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
