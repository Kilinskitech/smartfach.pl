# Stos technologiczny

Stan: 2026-09-10. Aplikacja jest publikowana przez Vercel pod `smartfach.pl`.
Supabase i Stripe w trybie testowym są podłączane i wymagają jeszcze pełnych
testów end-to-end przed rozpoczęciem sprzedaży.

| Warstwa          | Wybór                                           | Stan                                                       |
| ---------------- | ----------------------------------------------- | ---------------------------------------------------------- |
| Środowisko pracy | Codex + GitHub + Vercel Preview                 | Kod lokalnie, aplikacja uruchamiana wyłącznie na Vercelu   |
| Wersje kodu      | GitHub                                          | Repozytorium połączone z Vercel; `main` wdraża Production |
| Aplikacja        | Next.js App Router, React, TypeScript strict    | Alfa korzystająca z kont Supabase                          |
| UI               | Tailwind; shadcn/ui przy złożonych komponentach | Tailwind w szkielecie; shadcn jeszcze niedodane            |
| Dane             | Supabase/PostgreSQL, Auth, RLS                   | Projekt działa; migracje i zapis wymagają testu E2E        |
| Region bazy      | Region UE                                       | Potwierdzić ustawienie przed danymi realnych klientów      |
| Hosting          | Vercel                                          | Production działa pod `smartfach.pl`; Preview do procesu pracy |
| AI               | OpenRouter; standardowe trasy Google, streaming | Przypięty Gemini 3.1 Flash-Lite, minimalne rozumowanie (D059) |
| Rozliczenia      | Stripe Checkout + Billing                       | Sandbox podłączany; checkout/trial/portal/webhook wymagają E2E |
| Analityka        | PostHog EU                                      | Plan, brak integracji                                      |
| Testy            | Vitest, lint, typy, testy przeglądarkowe        | Schematy, AI, rozliczenia, zapis i ochrona API             |

Runtime używa prywatnego workspace JSONB w Supabase jako pomostu do stopniowej
normalizacji danych. Historyczne pola dawnego workflow pozostają w schemacie dla
zgodności danych, lecz nie mają aktywnego wejścia w aplikacji. Import cennika CSV
oraz generator PDF zostały usunięte z kodu aktywnego produktu. Zod waliduje dane.
`google/gemini-3.1-flash-lite` obsługuje rozmowy, start biznesu i obrazy. OpenRouter
może przełączyć dostawcę tego samego modelu; brak drugiej generacji lub fallbacku
do GPT w aplikacji. Rzeczywisty model oraz koszt odpowiedzi są zapisywane do analizy.

Node.js: 24.x. Menedżer pakietów: npm. Wersje aplikacji są zapisane w
`package.json` i `package-lock.json`; instalacja powtarzalna przez `npm ci`.
Nie przechodź automatycznie na wersje beta/canary ani nie aktualizuj zależności
bez testów. Przed wdrożeniem sprawdź aktualne poprawki bezpieczeństwa.

## Architektura

Jeden modularny projekt. UI i endpointy w Next.js, czysta logika domenowa
niezależna od frameworka. Bez osobnego backendu, kolejki i mikroserwisów,
dopóki konkretne wymaganie nie uzasadni ich kosztu.

Aplikacja webowa działa responsywnie bez instalacji. Nie utrzymujemy manifestu PWA,
service workera, ekranu offline ani interfejsu instalacji. Zwykła ikona karty
przeglądarki pozostaje elementem identyfikacji serwisu, nie infrastruktury PWA.

## Alternatywy i zależności

Rozważone frameworki: Next.js, Nuxt, SvelteKit. Wybór Next.js ujednolica React,
TypeScript, publiczne strony i część serwerową. To wybór dla projektu, nie ranking absolutny.
PostgreSQL pasuje do relacji konto–subskrypcja–rozmowy–zdarzenia–wyniki. Techniczna
organizacja nadal wyznacza granicę RLS jednego użytkownika i nie jest typem konta
widocznym w produkcie. Firebase i własny backend są alternatywami, ale nie
wprowadzamy ich równolegle.

Next.js można hostować poza Vercel. PostgreSQL ułatwia przeniesienie danych,
ale Auth/Storage Supabase i Stripe Billing nadal tworzą zależności integracyjne.
Nie zakładaj bezkosztowej migracji. Migrations, dokumenty i kopie danych muszą
pozostawać eksportowalne. Unikaj pośredników API, jeśli nie wnoszą mierzalnej wartości.

## Koszty

W researchu z 2026-08-30: Vercel Pro od 20 USD/mies., Supabase Pro od 25 USD/mies.
To nie jest pełny budżet: osobno użycie ponad limity, AI/STT, płatności, e-mail,
domena i narzędzia pracy. Aktualne warunki sprawdzamy ponownie przed zakupem.
Ustawienia regionów i umowy dostawców wymagają weryfikacji przed realnymi danymi.

## Środowiska wdrożenia

Production działa z gałęzi `main`, a stała gałąź `preview` służy jako środowisko
akceptacyjne. Nie utrzymujemy lokalnego runtime ani lokalnych sekretów aplikacji;
folder roboczy służy do edycji i kontroli statycznej. Podczas alfy Preview i
Production mogą korzystać z jednego hostowanego projektu Supabase oraz Stripe Sandbox.

To uproszczenie obowiązuje tylko przed realnymi klientami. Przed Stripe Live i
wprowadzeniem danych klientów trzeba rozdzielić testowy Supabase/Stripe od usług
produkcyjnych oraz nadać Preview stabilny adres dla callbacków i webhooka.

Migracje Supabase nie są wykonywane przez sam deploy Vercela. Każdą migrację trzeba
uruchomić i zweryfikować osobno. Nie przekazywać haseł ani tokenów w rozmowie i nie
umieszczać ich w repozytorium.
