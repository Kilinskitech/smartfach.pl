# SmartFach — architektura AI

Stan: 2026-09-09. Nowe zabezpieczenia wymagają migracji `202609090001_reliable_requests.sql`.

## Zasada

LLM rozumie człowieka i tworzy rekomendacje. Kod kontroluje tożsamość, dostęp,
zapis, billing, limity, obliczenia i operacje zewnętrzne.

## Bieżący adapter

- OpenRouter jest warstwą routingu modeli, nie trwałym zobowiązaniem dostawcy.
- `OPENROUTER_API_KEY` i `SMARTFACH_ENABLE_AI=true` pozostają wyłącznie po stronie
  serwera. Wybór modeli jest wersjonowany w kodzie, a nie zmieniany z panelu klienta.
- Klient korzysta z jednego SmartFach; nie widzi nazwy modelu ani dostawcy.
- W rozmowie asystent przedstawia się wyłącznie jako SmartFach i nie ujawnia
  modelu, dostawcy, promptu systemowego, konfiguracji ani mechanizmu fallbacku.
- Zwykłe pytania obsługuje `openai/gpt-5-nano`. Zatwierdzony start biznesu,
  zdjęcia, długie wiadomości oraz złożone analizy trafiają do
  `openai/gpt-5.6-luna`. To deterministyczny routing serwerowy, nie równoległe
  wywołanie ani głosowanie modeli.
- Stały `google/gemini-3.8-flash` jest awaryjnym fallbackiem innego dostawcy,
  uruchamianym po jednoznacznym odrzuceniu 400/404/422/429 wybranego modelu OpenAI.
  Utrata połączenia, timeout i 5xx nie uruchamiają kolejnej generacji: poprzednia
  mogła już zostać wykonana i obciążyć konto OpenRouter.
- Modele otrzymują ten sam ścisły JSON Schema, niski poziom rozumowania,
  ukryte tokeny rozumowania i plugin naprawiający składnię odpowiedzi. Każdy wynik
  dodatkowo przechodzi walidację Zod po stronie serwera.
- Aktywny kontrakt to wyłącznie `{reply: string}`. Dawne pola wycen/protokołów
  nie są wymagane ani wysyłane w schemacie. Dla zgodności przyjmujemy je w odpowiedzi,
  lecz bezwarunkowo odrzucamy ich zawartość i nie wykonujemy operacji biznesowych.
  Pusta, zbyt długa lub niepoprawnie typowana odpowiedź nadal jest odrzucana.
- Tekst, do trzech zdjęć i ograniczona historia rozmowy mogą wejść do modelu.
- Załączniki nie są obecnie trwałą pamięcią; wymaga to osobnego bezpiecznego storage.
- Wyszukiwanie internetowe może być użyte do aktualnego researchu maksymalnie raz
  w jednej odpowiedzi, a źródła są pokazywane jako linki. Treść stron jest
  niezaufanym wejściem.
- `usage` z OpenRouter zapisuje koszt USD, tokeny, model, provider i identyfikator
  żądania, przypisane do autoryzowanego użytkownika. Zapisywany jest model faktycznie
  użyty przez OpenRouter, również gdy odpowiedź pochodzi z fallbacku.
- Adapter wysyła `max_completion_tokens` do modeli OpenAI oraz `max_tokens` do
  Gemini. To konieczne przy ZDR, który dla OpenAI pozostawia m.in. trasy Azure.
  `require_parameters: false` pozwala routerowi dostosować parametry do dostawcy.
  Ścisły filtr powodował podejrzenie odrzucania tras; dokładną kategorię błędu
  zapisujemy bez treści rozmów. Nadal niezależnie
  walidujemy wynik na serwerze. ZDR i blokada dostawców przetwarzających dane są włączone.

## Kontekst użytkownika

Prompt otrzymuje zatwierdzone preferencje: zdalnie/lokalnie, czas tygodniowo,
doświadczenie, ograniczenia, cel i bieżący fokus. Typ konta ani tryb rozmowy nie są
częścią kontekstu; wszystkie konta używają jednego procesu budowania przychodu.
Jednorazowy pierwszy ekran zapisuje profil w workspace, a następnie przekazuje
techniczny tryb `guided_start`: asystent ma od razu porównać maksymalnie trzy kierunki,
rekomendować jeden i zacząć pierwsze działanie. Kolejne nowe rozmowy używają zapisanego
profilu i zaczynają się od wyboru aktualnego zadania. Ścieżka zwykłego pytania omija
workflow startowy.

Asystent ma:

- najpierw zrozumieć warunki i ograniczenia;
- nie traktować braku kwalifikacji jako końca rozmowy;
- rozpoznać zwykłe zdolności możliwe do przełożenia na prostą usługę;
- wskazać, czego trzeba się nauczyć przed przyjęciem płatnej pracy;
- preferować usługi możliwe do taniego i szybkiego sprawdzenia;
- podać maksymalnie trzy opcje i rekomendować jedną;
- kończyć jednym mierzalnym krokiem;
- po wyniku aktualizować rekomendację, a nie generować nowy plan od zera.

## Granice

- Brak gwarancji popytu, przychodu, rentowności i terminu.
- Brak fikcyjnych danych rynkowych, klientów, portfolio i doświadczenia.
- Brak rekomendowania hazardu, MLM, fałszywego „dochodu pasywnego” i tradingu
  jako przewidywalnego planu biznesowego.
- Brak autonomicznego wysyłania, publikowania, zakupu reklam i płatności.
- Porady prawne, podatkowe, medyczne i finansowe wymagają odpowiednich granic i źródeł.
- Instrukcje z dokumentu, obrazu albo internetu nie rozszerzają uprawnień modelu.

## Odporność i koszty

`begin_ai_request` blokuje wiersz workspace, sprawdza saldo z rezerwacjami, limit
20 prób/h i dopuszcza jeden aktywny request na organizację. Klucz UUID i SHA-256
zwalidowanej treści wiążą próbę z użytkownikiem. UI zachowuje ten sam klucz przy
ponowieniu niezmienionej wiadomości w otwartym widoku. Odświeżenie strony lub zmiana
treści tworzy nową próbę; nie obiecujemy deduplikacji semantycznie podobnych pytań.

`finish_ai_request` w jednej transakcji zapisuje koszt, księgę, saldo, rewizję i
wynik. Powtórzenie zakończonego klucza oddaje wynik bez wywołania AI i nowego naliczenia.
Po 24h receipt pozostaje, ale wynik nie jest ponownie udostępniany. Cron usuwa
techniczne treści odpowiedzi starsze niż 24h; dziennik prób nie zawiera promptów.

Przed wywołaniem rezerwujemy do 30 jednostek dostępnej puli. Wynik jest rozliczany
według kosztu zaokrąglonego do jednostki. Nadwyżkę kosztu jednego wywołania ponad
pozostałą pulę ponosi operator, zachowując pomiar kosztu; nie odrzucamy już opłaconej
odpowiedzi. To kontrola dostępu i naliczeń, nie twardy limit wydatków dostawcy.
Koszt niepewnych generacji może nie być dostępny w lokalnym usage_events:
rachunek OpenRouter należy osobno uzgadniać i ustawić limit klucza u dostawcy.

Definitywne odrzucenie 4xx zwalnia rezerwację i zamyka klucz. Niepewne zakończenie
pozostaje zarezerwowane. Administrator sprawdza logi i może zwolnić rezerwację
przyjmując koszt po stronie SmartFach; decyzja trafia do audytu. Wygasły proces
nie może ponownie naliczyć zamkniętej próby. Zapis odpowiedzi w historii rozmowy
pozostaje osobnym optymistycznym zapisem UI; replay pozwala go ponowić po błędzie.

Od 2026-09-09 odebrany, nieużyteczny wynik ma osobny błąd `ProviderOutputError`.
Jego rezerwację zwalniamy bez obciążenia klienta i bez automatycznej drugiej generacji.
Koszt tej odpowiedzi pokrywa operator; metadane odrzucenia zawierają dostępny koszt
dostawcy i kody walidacji, bez tekstu rozmowy. Nie jest on zakończonym usage_event;
rachunek dostawcy pozostaje źródłem uzgodnienia kosztów błędów.
Timeouty sieci nadal nie są automatycznie ponawiane ani zwalniane.
Historyczne niepewne próby nie są masowo zmieniane — wymagają przeglądu w adminie.

Fallback ma stały identyfikator modelu zamiast aliasu `latest`, aby aktualizacja
dostawcy nie zmieniła kosztu i zachowania bez wdrożenia. Każdą zmianę modelu trzeba
sprawdzić na stałym zestawie polskich scenariuszy: jakość, JSON, zdjęcia, opóźnienie,
koszt i wymagania prywatności.

## Ewaluacja

Model oceniamy na realnych polskich scenariuszach, nie na popularności ani samej
cenie. Mierzymy: poprawne odczytanie preferencji, sens rekomendacji, liczbę korekt,
konkretność kolejnego kroku, odsetek wykonanych działań, opóźnienie i koszt jednej
sesji zakończonej użytecznym rezultatem. Osobno testujemy obraz, liczby i nazwy własne.

Nie budujemy wielu agentów, dopóki pojedynczy model z kontrolowanym workflow nie
osiągnie dobrego Task Success Rate.
