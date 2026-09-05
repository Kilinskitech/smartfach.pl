# SmartFach

Asystent AI od pomysłu do codziennej pracy firmy — operacyjnie najpierw HVAC,
klimatyzacja i pompy ciepła.

> LLM rozumie człowieka. Kod kontroluje biznes.

## Stan projektu — 2026-09-05

Kod pierwszej alfy jest połączony z GitHubem i wdrażany na Vercelu pod
`smartfach.pl`. Hostowany Supabase oraz Stripe w trybie testowym są w trakcie
testów integracyjnych. To nie jest jeszcze gotowy produkt do kierowania płatnego
ruchu: przed sprzedażą trzeba przejść pełną bramkę alfy opisaną w `MVP_SPEC.md`.

Zaimplementowane:

- publiczne landingi, cennik, kontakt, regulamin i polityka prywatności;
- rejestracja i logowanie przez Supabase, profil, organizacja i jeden typ konta;
- prywatny workspace organizacji z RLS, walidacją i kontrolą rewizji;
- jeden asystent tekst/zdjęcie/nagranie, rozmowy i pamięć klientów;
- klienci, cennik/CSV, wyceny, protokoły, historia i PDF;
- Stripe Checkout dla Lite/Pro/Firma, karta przed 3-dniową próbą, Customer Portal
  i podpisane, idempotentne webhooki;
- panel właściciela oparty na realnych kontach, statusach subskrypcji i kosztach
  OpenRouter; treść rozmów znajduje się dopiero w profilu użytkownika;
- audyt otwarcia rozmów użytkownika przez jednego administratora platformy.

Niezaimplementowane lub niegotowe do sprzedaży:

- zaproszenia i loginy członków zespołu oraz egzekwowanie ich uprawnień;
- jednorazowy zakup zwiększenia limitu i transakcyjna księga zużycia;
- bezpieczny magazyn zdjęć/nagrań, XLSX, automatyczna wysyłka dokumentów i pełny offline;
- produkcyjna konfiguracja e-maili, backupów, monitoringu oraz rozliczeń podatkowych;
- test izolacji dwóch realnych kont w uruchomionym Supabase i testy Stripe end-to-end.

Stary lokalny profil i jego rozmowy zostały usunięte. `src/server/local-repository.ts`
pozostaje tylko po to, aby nie utracić testów regresji historycznego adaptera.

## Uruchomienie

Wymagany jest Node.js 24.x i npm:

```sh
npm ci
npm run dev -- --hostname 127.0.0.1
```

Bez konfiguracji Supabase landing działa, ale `/logowanie`, `/app`, `/platnosc`
i `/admin` nie udają prawdziwego konta. Pełna instrukcja połączenia usług:
[SETUP_SUPABASE_STRIPE](docs/SETUP_SUPABASE_STRIPE.md).

Sekrety zapisuj wyłącznie w ignorowanym przez Git `.env.local`, na podstawie
`.env.example`. Nie wklejaj ich do rozmowy, kodu frontendu ani publicznego repozytorium.

## Local, Preview i Production

- **Local** — kod uruchomiony na własnym komputerze. Służy do szybkiej pracy i
  testów przed wysłaniem zmian. Nie aktualizuje GitHuba ani `smartfach.pl`.
- **Preview** — stała gałąź `preview` wdrażana przez Vercel pod osobnym adresem.
  Służy do sprawdzenia zmiany na telefonie i przez zespół bez zmiany `smartfach.pl`.
- **Production** — wersja z gałęzi `main`, dostępna pod `smartfach.pl`.

Przebieg alfy: praca na gałęzi `preview` → szybki test lokalny → push → test adresu
Preview → akceptacja → merge `preview` do `main` → automatyczne wdrożenie Production.

Na obecnym, przedprodukcyjnym etapie Local, Preview i Production mogą tymczasowo
korzystać z jednego hostowanego projektu Supabase oraz jednego Stripe Sandbox.
Lokalna aplikacja łączy się z nimi przez prywatny `.env.local`; nie utrzymujemy
osobnej lokalnej bazy Supabase. Przed pierwszymi realnymi klientami lub włączeniem
Stripe Live rozdzielamy dane testowe od produkcyjnych.

Preview pozostaje chronione przez Vercel. Automatyczne testy używają prywatnego
`VERCEL_AUTOMATION_BYPASS_SECRET` z `.env.local`; sekret nie trafia do kodu ani GitHuba.

Migracje Supabase nie wykonują się automatycznie wraz z wdrożeniem Vercela. Nowy
plik z `supabase/migrations` trzeba najpierw sprawdzić na bazie testowej, a następnie
uruchomić w produkcyjnym projekcie Supabase w kontrolowanym oknie wdrożeniowym.

## AI

OpenRouter jest adapterem wymiennych modeli. Do uruchomienia potrzebne są
`OPENROUTER_API_KEY`, `OPENROUTER_MODEL` i `SMARTFACH_ENABLE_AI=true`.
Nazwa modelu nie jest pokazywana zwykłemu użytkownikowi. Koszt i tokeny z odpowiedzi
OpenRouter są zapisywane per użytkownik w `usage_events` i widoczne administratorowi.

Wyszukiwanie internetowe może być dostępne modelowi przez
`OPENROUTER_WEB_SEARCH=true`. Wynik z internetu jest odpowiedzią pomocniczą, a nie
automatycznym źródłem ceny w dokumencie firmy. Model nie został jeszcze zatwierdzony
produkcyjnie; trzeba mierzyć Task Success Rate na polskich nagraniach i realnych
scenariuszach HVAC.

## Weryfikacja

```sh
npm run check
npm run build
```

Testy jednostkowe nie wykonują płatnych wywołań AI ani Stripe. Test SQL w
`supabase/tests` wymaga uruchomionego środowiska Supabase i nadal musi zostać
rozszerzony o pełny scenariusz dwóch organizacji przed płatną alfą.

## Dokumentacja

- [MASTER_PLAN](docs/MASTER_PLAN.md) — fundament strategiczny.
- [MVP_SPEC](docs/MVP_SPEC.md) — zakres i kryteria gotowości.
- [PRODUCT_SPEC](docs/PRODUCT_SPEC.md) — przebiegi i stan funkcji.
- [UX_RULES](docs/UX_RULES.md) — zasady interfejsu.
- [AI_ARCHITECTURE](docs/AI_ARCHITECTURE.md) — adapter i granice AI.
- [TECH_STACK](docs/TECH_STACK.md) — stos i ograniczenia.
- [DATABASE](docs/DATABASE.md) — dane, RLS i migracja.
- [PRICING](docs/PRICING.md) — hipotezy cen i limitów.
- [ROADMAP](docs/ROADMAP.md) — wykonane i następne etapy.
- [DECISIONS](docs/DECISIONS.md) — rejestr decyzji.
- [RESEARCH](docs/RESEARCH.md) — źródła i pytania.
- [SETUP_SUPABASE_STRIPE](docs/SETUP_SUPABASE_STRIPE.md) — uruchomienie kont i płatności.
- [SUPABASE_EMAILS](docs/SUPABASE_EMAILS.md) — polski szablon i produkcyjna wysyłka e-mail.
