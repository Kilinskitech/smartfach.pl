# Research i otwarte pytania

Stan odniesienia: 2026-09-01. Źródła są punktem wyjścia, nie audytem prawnym
ani dowodem jakości w polskim HVAC. Parametry zależne od czasu sprawdzamy ponownie
przy integracji i zakupie. Nie przypisujemy benchmarków, których nie przeprowadzono.

## Oficjalne źródła

- [Instalacja PWA — MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)
- [Next.js](https://nextjs.org/docs) i [PWA](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [Nuxt](https://nuxt.com/blog/v4) i [SvelteKit](https://svelte.dev/docs/kit/introduction)
- [shadcn/ui](https://ui.shadcn.com/docs)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase SSR i weryfikacja sesji](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase — wybór pakietu serwerowego](https://supabase.com/docs/guides/auth/choosing-a-server-package)
- [Regiony Supabase](https://supabase.com/docs/guides/platform/regions)
- [Supabase — ceny](https://supabase.com/pricing), [Vercel — ceny](https://vercel.com/pricing)
- [Stripe — metody płatności](https://docs.stripe.com/payments/payment-methods/payment-method-support)
- [Stripe — trial w Checkout](https://docs.stripe.com/payments/checkout/free-trials)
- [Stripe — Customer Portal](https://docs.stripe.com/customer-management/integrate-customer-portal)
- [Stripe — webhooki subskrypcji](https://docs.stripe.com/billing/subscriptions/webhooks)
- [OpenAI — structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [OpenAI — przetwarzanie danych](https://developers.openai.com/api/docs/guides/your-data)
- [OpenAI GPT-Transcribe](https://developers.openai.com/api/docs/models/gpt-transcribe)
- [OpenRouter — multimodalne wejścia](https://openrouter.ai/docs/guides/overview/multimodal/overview)
- [OpenRouter — Structured Outputs](https://openrouter.ai/docs/guides/features/structured-outputs)
- [OpenRouter — routing i ZDR](https://openrouter.ai/docs/guides/routing/provider-selection)
- [OpenRouter — zbieranie danych](https://openrouter.ai/docs/guides/privacy/data-collection)
- [OpenRouter — Web Search Server Tool](https://openrouter.ai/docs/guides/features/server-tools/web-search)
- [OpenRouter — Response Healing](https://openrouter.ai/docs/guides/features/plugins/response-healing)
- [OpenRouter — rozliczanie usage](https://openrouter.ai/docs/cookbook/administration/usage-accounting)
- [OpenRouter — atrybucja użytkownika](https://openrouter.ai/docs/cookbook/get-started/enterprise-quickstart)
- [Gemini 3.5 Flash w OpenRouter](https://openrouter.ai/google/gemini-3.5-flash)
- [Gemini 3.5 Flash Lite w OpenRouter](https://openrouter.ai/google/gemini-3.5-flash-lite)
- [GPT-5.6 Luna w OpenRouter](https://openrouter.ai/openai/gpt-5.6-luna-20260709)
- [Deepgram — modele/języki](https://developers.deepgram.com/docs/models-languages-overview/)
- [Google Speech-to-Text — ceny](https://cloud.google.com/speech-to-text/pricing)
- [PostHog](https://posthog.com/)
- [ChatGPT Work](https://learn.chatgpt.com/docs/get-started-with-work)

## Walidacja z fachowcami

- Jak dziś powstaje wycena i co rzeczywiście zajmuje najwięcej czasu?
- Czy ceny materiału są kosztem zakupu, ceną sprzedaży netto czy kwotą brutto?
- Czy użytkownik ma cennik i w jakim formacie/jak często go aktualizuje?
- Czy protokół powstaje po każdej wizycie? Jakie pola i załączniki są konieczne?
- Gdzie głos jest praktyczny, a gdzie przeszkadza hałas, prywatność lub brak zasięgu?
- Czy plan Firma daje właścicielowi wartość większą niż suma kont pojedynczych?

## Zadania przed decyzjami produkcyjnymi

1. Zestaw nagrań polskiego HVAC i porównanie 2–3 STT według skuteczności zadania.
2. Porównanie LLM na ekstrakcji pozycji, dopasowaniu i otwartym czacie: jakość,
   koszt ukończonego zadania, opóźnienie, limity i regiony.
3. Zasady cenowe: VAT, netto/brutto, skala ilości, marża vs narzut, rabaty,
   minimalna wartość, zaokrąglenia. Osobny przegląd księgowy/podatkowy.
4. Model danych i testy izolacji firm z Supabase.
5. DPA, retencja, transfery danych, dokumenty użytkownika i procedura usuwania.
6. Metody subskrypcji w Polsce, fakturowanie i obowiązki formalne przed pobraniem opłaty.
7. Fizyczne iOS/Android, instalacja, mikrofon, PDF i wejście z Facebooka.
8. Dopiero przed biblioteką instrukcji: licencje, prawa indeksowania, odpowiedzialność
   i procedura aktualizacji dokumentów producentów.

## Utrzymanie zależności

Instalacja zakończyła się wynikiem audytu npm bez zgłoszonych podatności, co nie
jest pełnym audytem bezpieczeństwa. npm zgłosił zakończenie wsparcia ESLint
9.39.5; przed wersją produkcyjną sprawdzić zgodny zestaw ESLint 10+ i wtyczek
Next.js. Nie aktualizować samych głównych wersji z pominięciem testów zgodności.

## Integracja lokalna — 2026-08-31

- Sprawdzono lokalne instrukcje Next 16: komponenty klienckie, route handlers,
  CLI i metadane. Istniejący stos zachowany.
- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs):
  adapter używa `text.format`, schematu ścisłego i obsługi odmowy/niepełnego wyniku.
  Nie jest to benchmark modelu ani rekomendacja cenowa.
- [pdf-lib](https://pdf-lib.js.org/): lokalny generator z osadzonym fontem.
- [Noto Sans](https://github.com/notofonts/noto-fonts): font TTF i dołączona licencja OFL.
- Kontrola UI, 142 testy, PDF i build opisana w ROADMAP; testy automatyczne nie wysyłają
  płatnych zapytań AI. Osobna jednorazowa diagnostyka bez danych firmy potwierdziła
  prawdziwe wyszukiwanie, ale nie dowodzi jakości w polskim HVAC.

## OpenRouter i multimodalność — 2026-09-01

- OpenRouter ujednolica tekst, obrazy, audio i pliki, ale kompatybilność jest zależna
  od modelu i endpointu. `require_parameters` ma blokować trasę bez Structured Outputs.
- Startowa hipoteza `google/gemini-3.5-flash`: tekst, obraz, audio, PDF, tools i JSON Schema.
  Nie jest wyborem produkcyjnym ani dowodem skuteczności na polskich nagraniach HVAC.
- OpenRouter deklaruje brak zapisu promptów/odpowiedzi domyślnie, lecz dane przechodzą
  także do dostawcy modelu. Adapter wymusza `data_collection: deny` i ZDR. Regionalny
  routing UE jest ofertą enterprise; przed realnymi danymi potrzebna jest osobna ocena DPA i transferów.

## Wyszukiwanie internetowe — 2026-09-01

- Aktualna dokumentacja OpenRouter oznacza dawny plugin `web` i wariant `:online` jako
  przestarzałe. Implementacja używa serwerowego narzędzia `openrouter:web_search`.
- Model może wykonać 0–N wyszukiwań, dlatego limitujemy liczbę wyników i kontekst zamiast
  uruchamiać wyszukiwanie przy każdej wiadomości. Funkcja jest beta i może się zmienić.
- Wyszukiwanie ma osobny koszt zależny od silnika/dostawcy, dodatkowo dochodzą tokeny
  treści wyników. Przed płatną alfą trzeba mierzyć koszt wyszukiwania na aktywnego użytkownika.
- Kontrolowana próba Gemini 3.5 Flash wykonała 2 wyszukania i kosztowała około 0,044 USD.
  Zwróciła poprawny JSON, więc wcześniejszy błąd formatu był przejściowy, a nie stałą
  niezgodnością narzędzia z modelem. Sam pojedynczy wynik nie mierzy niezawodności.

## Mały benchmark modeli — 2026-09-01

- Zestaw obejmował cztery syntetyczne zadania bez danych klientów: brakujące dane
  wyceny, stawkę rynkową z internetem, kompletną wycenę z jawną ceną netto i protokół
  bez pomiarów. To test integracyjny, nie pełna ewaluacja jakości HVAC.
- Gemini 3.5 Flash: 4/4 ukończone zadania; około 9–11,5 s na odpowiedź. Łączny koszt
  czterech prób około 0,089 USD, w tym wyszukiwanie około 0,042 USD.
- Gemini 3.5 Flash Lite: 3/4; około 0,8–2,8 s i około 0,030 USD łącznie. Nie utworzył
  żądanego protokołu, mimo prawidłowego formatu odpowiedzi. Niska cena nie rekompensuje
  niższego Task Success Rate w głównym workflow.
- GPT-5.6 Luna: 0/4 z powodu braku dostępnej trasy przy `data_collection: deny`, ZDR
  i wymaganych parametrach. Publiczny katalog wskazuje tekst, obraz i pliki, ale nie audio,
  więc model nie spełnia wymogu jednego wejścia tekst/zdjęcie/głos.
- Po poprawkach finalny test scenariusza posadzki zwrócił odpowiedź z pięcioma źródłami,
  `quote: null` i bez wpisania internetowej stawki do dokumentu.
- Wniosek lokalnej alfy: domyślny Gemini 3.5 Flash z minimalnym rozumowaniem,
  `response-healing` i większym limitem odpowiedzi. Kolejny benchmark musi objąć
  polski hałas, nagrania HVAC, nazwy urządzeń i serię powtarzanych prób, nie pojedyncze trafienia.
