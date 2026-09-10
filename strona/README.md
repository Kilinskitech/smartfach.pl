# SmartFach

Osobisty asystent budowania biznesu od zera — dla osoby, która ma już pomysł,
oraz dla tej, która dopiero go szuka. SmartFach wykorzystuje jej wiedzę,
umiejętności, doświadczenie i wskazane przez nią kontakty, aby pomóc zbudować
realne źródło przychodu i drogę do większej wolności finansowej.

> Nie potrzebujesz idealnego pomysłu. Potrzebujesz pierwszego klienta.

## Stan projektu — 2026-09-10

Kod pierwszej alfy jest połączony z GitHubem i wdrażany na Vercelu pod
`smartfach.pl`. Hostowany Supabase oraz Stripe w trybie testowym są w trakcie
testów integracyjnych. To nie jest jeszcze gotowy produkt do kierowania płatnego
ruchu: przed sprzedażą trzeba przejść pełną bramkę alfy opisaną w `MVP_SPEC.md`.

Zaimplementowane:

- publiczne landingi, cennik, kontakt, regulamin i polityka prywatności;
- rejestracja i logowanie przez Supabase oraz jeden spójny profil użytkownika;
- prywatny workspace organizacji z RLS, walidacją i kontrolą rewizji;
- jeden asystent tekst/zdjęcie, historia rozmów i trwałe preferencje;
- dopasowanie sposobu pracy, celu, czasu, doświadczenia i ograniczeń;
- Stripe Checkout dla Lite/Pro, karta przed 3-dniową próbą, Customer Portal
  i podpisane, idempotentne webhooki;
- panel właściciela oparty na realnych kontach, statusach subskrypcji i kosztach
  OpenRouter; treść rozmów znajduje się dopiero w profilu użytkownika;
- audyt otwarcia rozmów użytkownika przez jednego administratora platformy.
- jedna kanoniczna domena `smartfach.pl`, sitemap i indeksowanie publicznych stron
  wyłącznie na Live; przekierowanie technicznego aliasu jest zarządzane w Vercelu.

Niegotowe do sprzedaży:

- jednorazowy zakup zwiększenia limitu i transakcyjna księga zużycia;
- produkcyjna konfiguracja e-maili, backupów, monitoringu oraz rozliczeń podatkowych;
- test izolacji dwóch realnych kont w uruchomionym Supabase i testy Stripe end-to-end;
- analityka pełnego lejka, zgody pomiarowe oraz bramka prawna przed ruchem płatnym.

Formalne wyceny, protokoły, import cennika i pozostałe moduły dawnego kierunku
branżowego są w Parking Lot. Nie utrzymujemy ich jako pozornie aktywnych funkcji.

## Porządek aplikacji

- `src/` — działająca aplikacja i testy;
- `supabase/` — migracje oraz test izolacji danych;
- `docs/` — produkt, architektura, decyzje i instrukcje uruchomienia;
- `public/` — wyłącznie zasoby używane przez aplikację.

Strategia i materiały operacyjne marketingu są przechowywane poza repozytorium
strony. Nagrania, projekty Canvy, generacje AI i duże eksporty pozostają w
Google Drive. Do repozytorium nie trafiają sekrety ani dane osobowe.

## Preview i Live

- **Preview** — stała gałąź `preview` wdrażana przez Vercel pod osobnym adresem.
  Służy do sprawdzenia zmiany na telefonie i przez zespół bez zmiany `smartfach.pl`.
- **Live (Production)** — wersja z gałęzi `main`, dostępna pod `smartfach.pl`.

Przebieg alfy: zmiana kodu → kontrola statyczna → push na `preview` → test wdrożonej
aplikacji → akceptacja → merge `preview` do `main` → automatyczne wdrożenie Live.

Nie uruchamiamy lokalnej aplikacji ani lokalnych usług. Folder roboczy służy wyłącznie
do edycji kodu i kontroli przed wysłaniem. Wszystkie sekrety znajdują się w Vercelu;
`.env.example` jest jedynie katalogiem wymaganych nazw.

Na obecnym, przedprodukcyjnym etapie Preview i Live mogą tymczasowo korzystać z
jednego hostowanego Supabase oraz Stripe Sandbox. Przed pierwszymi realnymi klientami
lub włączeniem Stripe Live rozdzielamy dane testowe od produkcyjnych.

Pełna instrukcja konfiguracji: [SETUP_SUPABASE_STRIPE](docs/SETUP_SUPABASE_STRIPE.md).

Migracje Supabase nie wykonują się automatycznie wraz z wdrożeniem Vercela. Nowy
plik z `supabase/migrations` trzeba najpierw sprawdzić na bazie testowej, a następnie
uruchomić w produkcyjnym projekcie Supabase w kontrolowanym oknie wdrożeniowym.

## AI

OpenRouter kieruje cały czat do `google/gemini-3.1-flash-lite`, preferując niskie
opóźnienia standardowych tras Google, bez GPT i Azure. Do uruchomienia potrzebne są
`OPENROUTER_API_KEY` i `SMARTFACH_ENABLE_AI=true`. Model jest zapisany w kodzie.
Stara zmienna `OPENROUTER_MODEL` nie jest używana.
Nazwa faktycznie użytego modelu nie jest pokazywana zwykłemu użytkownikowi. Koszt,
tokeny i model z odpowiedzi OpenRouter są zapisywane per użytkownik w
`usage_events` i widoczne administratorowi.

Wyszukiwanie internetowe może być dostępne modelowi przez
`OPENROUTER_WEB_SEARCH=true`. Jedna odpowiedź może wykonać najwyżej jedno
wyszukanie. Wynik z internetu jest odpowiedzią pomocniczą, a nie automatycznym
źródłem ceny. Model nadal wymaga pomiaru Task Success Rate na polskich
rozmowach, zdjęciach i realnych scenariuszach wyboru usługi, tworzenia oferty i
pierwszego kontaktu z rynkiem.

## Weryfikacja

```sh
npm run check
npm run build
```

Testy jednostkowe nie wykonują płatnych wywołań AI ani Stripe. Test SQL w
`supabase/tests` wymaga uruchomionego środowiska Supabase i nadal musi zostać
rozszerzony o pełny scenariusz dwóch organizacji przed płatną alfą.

## Dokumentacja

- [Dokumentacja produktu i techniczna](docs/README.md) — źródła prawdy, specyfikacje i instrukcje.
