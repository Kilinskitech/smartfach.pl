# SmartFach — zasady pracy nad repozytorium

## Źródła prawdy

- Najpierw przeczytaj `docs/MASTER_PLAN.md`, `docs/MVP_SPEC.md`, `docs/DECISIONS.md` i dokument dotyczący zmienianego obszaru.
- Strategicznie nadrzędny jest `MASTER_PLAN.md`. Odróżniaj decyzje, propozycje i hipotezy.
- Nie zmieniaj fundamentów ani stosu technologicznego bez uzasadnienia i zgody właściciela.
- Aktualizuj dokumentację wraz z implementacją. Nie przedstawiaj planów jako gotowych funkcji.

## Zakres

- Początek: HVAC, klimatyzacja i pompy ciepła. Mobile-first, instalowalna aplikacja webowa.
- Obecny start: multimodalny asystent jako jedyne główne miejsce pracy; pamięć firmy w tle (D011/D012).
- Hak: krótkie polecenie → wycena → PDF. Retencja: protokół wizyty i historia klienta.
- Otwarty asystent należy do MVP; nie wolno zredukować produktu wyłącznie do formularza wyceny.
- Magazyn, księgowość, kalendarz ekip, GPS, pełna diagnostyka i duży RAG: Parking Lot.

## Zasady techniczne

- LLM interpretuje wypowiedź. Kod sprawdza uprawnienia, waliduje dane i liczy pieniądze.
- Brak ceny lub niejednoznaczna pozycja oznacza potrzebę potwierdzenia; nigdy nie zgaduj.
- Dane biznesowe należą do organizacji. Izolacja organizacji obowiązuje także dla plików i narzędzi AI.
- Nie przechowuj kluczy, haseł ani prawdziwych danych klientów w repozytorium, przykładach czy logach testów.
- Dane demonstracyjne muszą być wyraźnie oznaczone. Przycisk bez implementacji nie może sugerować sukcesu.
- Kwoty przechowuj w groszach lub kontrolowanym typie dziesiętnym; nie sumuj kwot jako zwykłych ułamków zmiennoprzecinkowych.
- Stosuj aktualne dokumentacje i stabilne, poprawione wersje bibliotek. Zachowaj npm i lockfile.
- Każda zmiana obliczeń wymaga testów. Autoryzacja wymaga testów negatywnych między organizacjami.
- Przed przekazaniem zmian uruchom `npm run check` i `npm run build`; jawnie zgłoś testy, których nie wykonano.
- Nie wdrażaj, nie wysyłaj wiadomości i nie wypychaj zmian do GitHub bez autoryzacji użytkownika.

## Aktualny etap

Runtime korzysta z Supabase Auth, organizacji, RLS i prywatnego workspace JSONB.
Lokalny profil oraz `.local/workspace.json` zostały usunięte; adapter plikowy pozostał
wyłącznie w testach regresji. Kod Stripe Checkout, 3-dniowej próby z kartą, Customer
Portal i zweryfikowanych webhooków jest przygotowany, ale realne działanie wymaga
projektów Supabase/Stripe, migracji i sekretów opisanych w `docs/SETUP_SUPABASE_STRIPE.md`.
Backend Supabase używa nowego klucza `SUPABASE_SECRET_KEY`, nie wycofywanego
legacy `service_role`.
Adapter OpenRouter wymaga klucza, modelu i jawnego włączenia. Nie udawaj odpowiedzi
bez konfiguracji. Zwykły użytkownik nie może zmieniać pól rozliczeniowych workspace.
Pełne rozmowy są dostępne wyłącznie jednemu administratorowi platformy wskazanemu
serwerowym UUID, w profilu konkretnego użytkownika; każde otwarcie zapisuje audyt.
Nie uruchamiaj płatnej alfy przed testem RLS dwóch organizacji, webhooków Stripe,
odtwarzania kopii i przeglądem prawnym/podatkowym.
Kalkulator nie obsługuje kosztów własnych, marż, rabatów, zwolnień ani mieszanego VAT.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
