# SmartFach — architektura AI

Stan: 2026-09-07.

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
- Główny model to `openai/gpt-5-nano`. Po błędzie, limicie dostawcy albo braku
  odpowiedzi OpenRouter automatycznie próbuje `~google/gemini-flash-latest`.
- Oba modele otrzymują ten sam ścisły JSON Schema, minimalny poziom rozumowania,
  ukryte tokeny rozumowania i plugin naprawiający składnię odpowiedzi. Każdy wynik
  dodatkowo przechodzi walidację Zod po stronie serwera.
- Tekst, do trzech zdjęć i ograniczona historia rozmowy mogą wejść do modelu.
- Załączniki nie są obecnie trwałą pamięcią; wymaga to osobnego bezpiecznego storage.
- Wyszukiwanie internetowe może być użyte do aktualnego researchu maksymalnie raz
  w jednej odpowiedzi, a źródła są pokazywane jako linki. Treść stron jest
  niezaufanym wejściem.
- `usage` z OpenRouter zapisuje koszt USD, tokeny, model, provider i identyfikator
  żądania, przypisane do autoryzowanego użytkownika. Zapisywany jest model faktycznie
  użyty przez OpenRouter, również gdy odpowiedź pochodzi z fallbacku.

## Kontekst użytkownika

Prompt otrzymuje zatwierdzone preferencje: zdalnie/lokalnie, czas tygodniowo,
doświadczenie, ograniczenia, cel i bieżący fokus. Typ konta ani tryb rozmowy nie są
częścią kontekstu; wszystkie konta używają jednego procesu budowania przychodu.

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

Timeout, błędny JSON, odmowa, ucięta odpowiedź i błąd providera mają zachować
wiadomość użytkownika i dać bezpieczne ponowienie. Jedno żądanie nie może zostać
rozliczone dwa razy przez retry. Limity procesu są prototypem; płatna wersja wymaga
atomowego obciążenia i audytowalnej księgi.

Alias `~google/gemini-flash-latest` może w przyszłości wskazać nowszy model bez
wdrożenia kodu. Jest używany wyłącznie awaryjnie, ale po każdej zmianie wskazania
trzeba sprawdzić koszt, JSON, zdjęcia, język polski i wymagania prywatności.

## Ewaluacja

Model oceniamy na realnych polskich scenariuszach, nie na popularności ani samej
cenie. Mierzymy: poprawne odczytanie preferencji, sens rekomendacji, liczbę korekt,
konkretność kolejnego kroku, odsetek wykonanych działań, opóźnienie i koszt jednej
sesji zakończonej użytecznym rezultatem. Osobno testujemy obraz, liczby i nazwy własne.

Nie budujemy wielu agentów, dopóki pojedynczy model z kontrolowanym workflow nie
osiągnie dobrego Task Success Rate.
