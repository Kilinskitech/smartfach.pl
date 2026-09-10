# Model danych SmartFach

Stan: 2026-09-06. Runtime korzysta z hostowanego Supabase. Migracje znajdują się
w `supabase/migrations` i nie wykonują się automatycznie z wdrożeniem Vercela.

## Dodatek 2026-09-09 — przygotowany, wymaga zastosowania w środowisku

Migracja `202609090001_reliable_requests.sql` jest addytywna i transakcyjna:

- `ai_requests`: rezerwacja, klucz, hash wejścia, status i krótko przechowywany wynik.
- `operation_leases`: wygasające blokady webhooków, checkoutów i synchronizacji;
  token jest sprawdzany przy zatwierdzaniu webhooka i całego snapshotu abonamentu.
- `checkout_attempts`: stabilny zakup na organizację; niepewnej próby starszej niż
  23h nie odtwarzamy automatycznie z kluczem mogącym już wygasnąć w Stripe.
- `organizations.trial_consumed_at`: jednorazowa próba, uzupełnienie z istniejących abonamentów.
- `subscriptions.stripe_created_at`: ochrona przed nadpisaniem nowszego abonamentu starym.
- `deployment_identity`: jawne przypisanie bazy do Preview albo Production.
- `product_events`: pierwsze etapy aktywacji na użytkownika, bez promptów i śledzenia reklamowego.
- `admin_usage_totals`: sumowanie pełnej historii kosztów w SQL zamiast pobierania pierwszych 1000 zdarzeń.

Nowe tabele mają RLS, nowe funkcje uprawnienia wyłącznie dla `service_role`.
Serwer autoryzuje użytkownika/admina przed ich wywołaniem. Klucz backendu nadal
pozostaje `sb_secret_`, nie udostępniamy legacy service key ani RPC przeglądarce.
Pełny test plików migracji używa PGlite/PostgreSQL i syntetycznego Auth; nie zastępuje
testu dwóch zalogowanych kont w rzeczywistym Supabase.

Kolejność publikacji, kontrola schematu i izolacja baz: `RELEASE_2026-09-09.md`.

## Wdrożona podstawa

- `user_profiles`: nazwa użytkownika i techniczne pole zgodności `account_type`.
  Pole ma jedyną dopuszczalną wartość `builder`, nie jest wybierane przez użytkownika
  i może zostać usunięte po aktualizacji wszystkich środowisk.
- `organizations`: prywatny kontener danych tworzony automatycznie dla konta.
- `memberships`: powiązanie właściciela z kontenerem. Obecnie jedno konto ma jednego
  właściciela; tabela nie oznacza dostępności planu zespołowego.
- `workspaces`: zweryfikowany JSONB z numerem rewizji. Aktywna aplikacja korzysta
  z profilu `journey`, rozmów i agregatu limitu. Historyczne puste pola firmowe są
  zachowane czasowo, aby migracja nie usuwała danych.
- `subscriptions`: plan Lite albo Pro, status, trial, identyfikatory Stripe i termin
  okresu. Pełny numer karty i CVC nie trafiają do SmartFach.
- `stripe_events`: idempotencja webhooków Stripe.
- `usage_events`: użytkownik, organizacja, rozmowa, model, tokeny, koszt USD oraz
  identyfikator żądania zwrócony przez OpenRouter.
- `usage_credit_charges`: niezmienna, idempotentna księga naliczeń limitu przez API AI.
- `usage_top_ups`: idempotentna księga opłaconych jednorazowych zwiększeń limitu.
- `admin_audit_events`: audyt wejścia administratora do rozmów konkretnego konta.

RLS ogranicza profil do właściciela, a organizację, workspace, subskrypcję i zużycie
do aktywnego członkostwa. Klucz serwisowy jest używany wyłącznie po stronie serwera.
Administrator platformy jest wskazany przez `PLATFORM_ADMIN_USER_ID`, awaryjnie przez
`PLATFORM_ADMIN_EMAIL`.

## Aktywny workspace

`journey` przechowuje wyłącznie zatwierdzone preferencje:

- `focus`: bieżąca usługa lub kierunek;
- `goal`: cel użytkownika;
- `workStyle`: `remote`, `local`, `hybrid` albo `open`;
- `weeklyHours`: dostępny czas;
- `experience`: doświadczenie i umiejętności;
- `constraints`: ograniczenia oraz rzeczy, których użytkownik nie chce robić.

`conversations` przechowuje tytuł, datę aktualizacji i maksymalnie 60 wiadomości.
Rozmowa nie ma typu ani trybu. Odpowiedź może zawierać źródła oraz metadane kosztu,
ale nazwa modelu nie jest pokazywana zwykłemu użytkownikowi.

`billing` w workspace jest pomocniczym widokiem planu i wykorzystania. Zmieniają go
wyłącznie serwerowe funkcje rozliczenia AI, zwiększenia limitu i synchronizacji
nowego okresu Stripe. Źródłem
prawdy o uprawnieniu do aplikacji jest `subscriptions` synchronizowane przez
zweryfikowane webhooki Stripe. Użytkownik nie może zmienić żadnego pola
rozliczeniowego przez zwykły zapis workspace. Przy odnowieniu okresu zużycie planu
wraca do zera, ale wykorzystana część dokupionego limitu nie odradza się.

## Migracja jednego profilu

`202609060003_single_builder_profile.sql`:

1. zmienia wszystkie profile na stałą wartość `builder`;
2. ogranicza plany do Lite/Pro i mapuje ewentualny historyczny plan na Pro;
3. usuwa `journey.mode` i `conversation.mode` z zapisanych workspace;
4. tworzy nowe konta bez typu wybieranego z formularza;
5. zachowuje sygnaturę `save_workspace`, aby starsze wdrożenie nie utraciło zapisu.

Migracja nie usuwa kont, rozmów ani subskrypcji.

## Następne encje dopiero po walidacji

Jeżeli test potwierdzi użycie abonamentowe, JSONB powinien być stopniowo zastąpiony
przez małe, mierzalne encje:

- `business_profiles`: zatwierdzona usługa, odbiorca, problem i aktualna propozycja;
- `offers`: kolejne wersje zakresu, ceny testowej, CTA i statusu;
- `experiments`: kanał, działanie, termin, oczekiwany sygnał oraz rzeczywisty wynik;
- `activity_events`: rozpoczęcie profilu, rekomendacja, oferta, działanie i powrót;
- pełna rezerwacja limitu przed kosztownym wywołaniem i rozliczenie różnicy po nim.

Nie tworzymy tych tabel tylko dlatego, że są łatwe do zbudowania. Pierwszeństwo ma
instrumentacja lejka i potwierdzenie, że użytkownik wraca z wynikiem działania.

## Niezmienniki

- Żaden parametr URL ani dane z przeglądarki nie wybierają typu konta.
- Plan może mieć wyłącznie wartość Lite albo Pro.
- Sesja nie może wybrać dowolnego `organization_id` bez kontroli członkostwa.
- Ponowienie tego samego webhooka lub rozliczenia AI nie tworzy drugiego skutku.
- Status trialu i subskrypcji pochodzi ze Stripe, nie z deklaracji klienta.
- Pełne rozmowy są dostępne administratorowi wyłącznie w profilu konkretnego
  użytkownika, a każde otwarcie zostawia ślad audytowy.
- Dane z obrazu, dokumentu i internetu są niezaufanym wejściem i nie rozszerzają
  uprawnień użytkownika ani modelu.

## Testy przed ruchem płatnym

- dwa konta nie mogą odczytać ani zapisać workspace drugiego konta;
- konflikt rewizji nie może nadpisać nowszych danych;
- rejestracja tworzy dokładnie jeden profil, kontener, członkostwo i subskrypcję;
- zapis po migracji usuwa stare pola trybu i nie traci rozmów;
- Checkout Lite/Pro, trial, anulowanie i ponowiony webhook zachowują poprawny stan;
- zakup zwiększenia, asynchroniczna płatność i ponowiony webhook nie dopisują limitu
  drugi raz;
- usunięcie konta koordynuje Stripe i Supabase;
- eksport, retencja, backup i odtworzenie są sprawdzone przed danymi realnych osób.
