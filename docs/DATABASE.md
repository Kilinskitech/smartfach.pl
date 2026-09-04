# Model danych SmartFach

Stan: 2026-09-04. Pierwsza migracja znajduje się w `supabase/migrations`.
Do uruchomienia wymaga projektu Supabase i zastosowania migracji.

Poniższa lista rozróżnia wdrożoną podstawę od kolejnych encji MVP.

## Adapter lokalny — wyłączony z runtime

`src/server/local-repository.ts` pozostaje wyłącznie dla testów historycznego adaptera.
Plik `.local/workspace.json` wraz ze starymi rozmowami został usunięty, a runtime
aplikacji korzysta z Supabase.
Encje: firma, klienci, cennik, dokumenty, rozmowy i ostatni szkic. UI nie przechowuje
kartoteki w localStorage. Schematy są w `src/domain/workspace.ts`.

Zapis walidowany po obu stronach, numer rewizji zapobiega nadpisaniu starszą kartą,
kolejka w jednym procesie, tymczasowy plik i atomowa podmiana. Plik z błędem odczytu
nie jest zerowany. Uprawnienia pliku 0600. To nie szyfrowanie ani izolacja użytkowników
tego komputera. Nie uruchamiać wielu instancji serwera na tym samym pliku.

API działa tylko w development na adresie loopback, sprawdza rzeczywisty Host,
Origin przy zapisie i Sec-Fetch-Site; blokuje production. Maksymalnie 2 MB danych,
500 klientów, 1000 pozycji, 500 dokumentów, 30 rozmów po 60 wiadomości.
Klient z dokumentami nie może zostać usunięty. Usunięcie wpisu wymaga potwierdzenia.
Ceny na dokumencie są kopią — późniejsza zmiana/usunięcie cennika ich nie zmienia.
Dane firmy na PDF są aktualne w chwili eksportu; brak niezmiennych wersji i audytu PDF.

Eksport JSON działa; przywracanie kopii przez UI nie jest wdrożone. Ręczne formularze
niezapisane przed odświeżeniem mogą zostać utracone. Ten pomost nie jest już
źródłem danych uruchomionej aplikacji.
Przechowuje wybrany tryb `journey` oraz testowy agregat `billing` (plan, zużycie,
dokupiona pula i początek okresu). Nie zawiera zapisywalnych rezultatów Odkryj/Uruchom,
kont ani księgi kredytowej. Agregat lokalny nie jest projektem modelu płatności.
`billing` znajduje się ponad `journey`, dlatego zmiana trybu nie może modyfikować
planu, początku okresu, wykorzystania ani dodatkowej puli. Rozmowy zachowują własny
tryb i pozostają dostępne po powrocie; wspólne dane firmy nie są duplikowane per tryb.

## Wdrożona podstawa Supabase

- `user_profiles`: nazwa i jeden aktywny typ konta.
- `organizations` i `memberships`: prywatna organizacja tworzona dla nowego konta;
  podstawa pod późniejszy zespół.
- `workspaces`: obecny zweryfikowany model produktu jako JSONB organizacji, z rewizją
  i atomowym `save_workspace`. Pozwala migrować do relacyjnych tabel etapami.
- `subscriptions`: plan, status, trial, Stripe Customer/Subscription, termin okresu
  i informacja o metodzie płatności bez numeru karty.
- `stripe_events`: idempotencja webhooków.
- `usage_events`: użytkownik, organizacja, rozmowa, model, identyfikator żądania,
  tokeny i koszt USD zwrócony przez OpenRouter.
- `admin_audit_events`: każde otwarcie rozmów konkretnego użytkownika przez foundera.

RLS ogranicza profil do właściciela, a organizacje, workspace, subskrypcje i zużycie
do aktywnych członków. Service role pozostaje wyłącznie na serwerze dla webhooków
i panelu jednego administratora wskazanego przez `PLATFORM_ADMIN_USER_ID`.

## Kolejne encje MVP

- `user_profiles`: kontekst należący do konta, preferencje i wybrane kierunki;
  bez kopiowania danych klientów z organizacji.
- `explorations`: zapisane porównania, założenia, ryzyka i testy Odkryj. Mogą
  pozostawać aktywne równolegle z Uruchom/Prowadź; status nie jest poziomem dostępu.
- `launch_projects`: konkretny pomysł/usługa, klient docelowy, oferta i następne
  działania Uruchom; opcjonalne, jawne powiązanie z organizacją.
- `organizations`: firma, dane dokumentów, ustawienia.
- `memberships`: użytkownik, organizacja, rola i status; właściciel także jest członkiem.
- `clients`: kartoteka przypisana do organizacji.
- `price_items`: pozycja, kategoria, jednostka, cena sprzedaży, opcjonalny koszt,
  waluta i jawne zasady podatkowe. Brak kosztu to NULL, a nie 0.
- `quotes` i `quote_items`: klient, status, wersja, waluta, kopia cen i reguł,
  obliczone wartości, twórca i daty. Zmiana cennika nie modyfikuje historii.
- `visit_reports`: prace, pomiary podane przez użytkownika, szkic/akceptacja, klient.
- `attachments`: organizacja, powiązany dokument, prywatna ścieżka pliku,
  typ/rozmiar, właściciel i retencja.
- `conversations` i `messages`: jawny zakres `account` albo `organization`, autor,
  ścieżka i treść/odwołania do narzędzi. Rekord ma dokładnie jednego właściciela
  zakresu i nie nadaje praw do danych z drugiego zakresu.
- `subscriptions`: plan, status, `trial_started_at`, `trial_ends_at`, data anulowania,
  koniec bieżącego okresu, uprawnienia i identyfikatory klienta/subskrypcji u dostawcy.
- `payment_method_summaries`: identyfikator metody u dostawcy, marka i ostatnie cztery
  cyfry do bezpiecznej informacji w UI; nigdy pełny numer karty ani CVC.
- `usage_events`: typ funkcji, licznik i koszt; bez niepotrzebnych danych osobowych.
- `credit_wallets`: saldo widoczne dla konta lub organizacji i wersja zasad naliczania.
- `credit_grants`: przyznane pule z typem `plan` albo `purchased`, okresem, saldem
  i jawną datą ważności, jeżeli została ustalona.
- `credit_ledger`: niezmienny zapis przyznania, rezerwacji, obciążenia, zwolnienia
  lub korekty; powiązanie z operacją i unikalnym kluczem idempotencji.
- `billing_events`: unikalny identyfikator zdarzenia dostawcy, typ, status przetwarzania
  i bezpieczny skrót danych potrzebny do wykrywania konfliktów; bez sekretów.
- `audit_events`: istotne operacje, aktor, obiekt, czas; bez sekretów.
- rozszerzenie audytu o istotne operacje inne niż podgląd rozmów; bez sekretów.

## Niezmienniki

- Encje osobiste Odkryj/Uruchom należą do konta i nie stają się danymi firmy
  bez jawnej, autoryzowanej operacji użytkownika.
- Każda encja biznesowa należy do organizacji. Kontrola również w RLS.
- Powiązania dziecko–rodzic muszą należeć do tej samej organizacji; same UUID
  i zwykła relacja FK bez ograniczenia organizacji nie wystarczą.
- Prywatne pliki, krótkotrwałe podpisane adresy; uprawnienia weryfikowane przy wydaniu URL.
- Kwoty w kontrolowanych jednostkach, waluta jawna; ustalona skala ilości i zaokrągleń.
- Unikalność członkostw i kluczy idempotencji; transakcje dla dokumentów i pozycji.
- Sesja nie wybiera dowolnego `organization_id` bez kontroli członkostwa.
- Klucz administracyjny bazy wyłącznie po stronie serwera; nie jest skrótem do ominięcia uprawnień.
- Typ konta jest ustawieniem profilu, a nie rolą ani planem. Zmienia się wyłącznie
  w Ustawieniach, a nie przez codzienną nawigację lub parametr URL.
- Kontekst osobisty może zostać powiązany z organizacją wyłącznie jawną operacją;
  przełączenie do Odkryj lub Uruchom nie obchodzi RLS danych Prowadź.
- Obciążenie kredytów jest transakcyjne i idempotentne. Ponowienie tej samej operacji
  zwraca poprzedni wynik, a nie kolejny debit. Najpierw obciążana jest pula planowa,
  potem dokupiona; historia nie jest przepisywana przy odnowieniu.
- Hipoteza niekumulowania oznacza wygaśnięcie starego grantu planowego i utworzenie
  nowego, nie kasowanie wpisów księgi. Zasada musi być konfigurowalna do czasu decyzji.
- Zdarzenie płatnicze dostawcy i klucz idempotencji zakupu są unikalne. Dostęp lub
  saldo nie rosną drugi raz po ponowionym webhooku.
- Status próby, podpięcia metody płatności i abonamentu wynika wyłącznie ze
  zweryfikowanych zdarzeń Stripe przetwarzanych po stronie serwera, nie z deklaracji przeglądarki.
- Zwykły panel platformy odczytuje zagregowane metadane, koszty i błędy. Pełne prompty
  i odpowiedzi są dostępne wyłącznie w profilu konkretnego użytkownika dla jednego
  konta foundera. Każde otwarcie rozmów tworzy wpis audytowy; dostęp
  do załączników wymaga dodatkowego uprawnienia. Zakres, retencja i podstawa prawna
  muszą być zatwierdzone przed użyciem realnych danych.

## Testy przed użyciem realnych danych

Próby odczytu/zapisu/aktualizacji/usunięcia danych innej firmy, podszycie się pod
organizację, obcy klient w wycenie, usunięty członek, dostęp do załącznika przez
znany adres, podwójne zapisy po retry, eksport/usuwanie danych i odtworzenie backupu.
Osobno: próba odczytu kontekstu innego konta, dostęp do danych firmy przez Odkryj,
podwójne obciążenie kredytów, kolejność puli planowej i dokupionej, odnowienie bez
kumulacji, błąd po rezerwacji oraz wielokrotnie dostarczony webhook zakupu.
