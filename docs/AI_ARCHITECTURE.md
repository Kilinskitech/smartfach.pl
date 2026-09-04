# Architektura AI — projekt docelowy MVP

Status 2026-09-04: multimodalny adapter OpenRouter działa z autoryzowanym kontem Supabase.
Mały benchmark syntetyczny porównał trzy modele; nie przetwarzano realnych danych klientów.

## Adapter — faktyczny zakres

- `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` i `SMARTFACH_ENABLE_AI=true` wymagane
  łącznie po stronie serwera. Klucz nie trafia do UI ani Git. Konfiguracja nie
  dowodzi poprawności klucza czy dostępności modelu; błędy są pokazywane jawnie.
- OpenRouter Chat Completions, JSON Schema strict, ponowna walidacja Zod. Odpowiedź, szkic wyceny
  albo szkic protokołu. Brak frameworka agentowego, narzędzi wysyłki i autonomicznego zapisu dokumentów.
- Serwerowe narzędzie `openrouter:web_search` jest domyślnie udostępnione modelowi.
  Model decyduje, czy go użyć. Ustawienia ograniczają pojedyncze wyszukiwanie do 3 wyników,
  całe zapytanie do 5 wyników i małego kontekstu. `OPENROUTER_WEB_SEARCH=false` wyłącza
  funkcję. To funkcja beta OpenRoutera i osobny koszt ponad tokeny modelu.
- Cytowania `url_citation` są walidowane, ograniczane do HTTP(S), zapisywane z rozmową
  i pokazywane jako linki pod odpowiedzią. Treści stron pozostają niezaufanym wejściem.
- Odpowiedź strukturalna używa ścisłego schematu i pluginu `response-healing`, a lokalna
  warstwa odzyskiwania akceptuje poprawny JSON,
  pojedynczy blok `json` i JSON otoczony krótkim tekstem. Jeżeli model nadal zwróci
  zwykły tekst albo ukończone pole `reply` przed ucięciem JSON-u, otwarta rozmowa
  pokazuje go bez tworzenia dokumentu. Jawne polecenie
  wyceny lub protokołu pozostaje fail-closed i wymaga prawidłowego schematu.
- Odrzucenie formatu zapisuje wyłącznie metadane techniczne: identyfikator żądania,
  provider, model, przyczynę, długość i `finish_reason`. Surowa treść klienta ani
  odpowiedź modelu nie trafiają do logu diagnostycznego.
- Aplikacja używa jednego modelu ustawionego serwerowo przez `OPENROUTER_MODEL`.
  Nazwa modelu, jego wybór i dostawca nie są elementem interfejsu fachowca.
- Bieżące zapytanie może zawierać maksymalnie 3 zdjęcia/nagrania i 10 MB danych base64.
  Załączniki nie są zapisywane w historii; zostaje tylko tekstowa informacja o ich użyciu.
  Format nagrania zależy od przeglądarki i modelu, dlatego wymaga testów na fizycznych telefonach.
- Ceny z wybranych rekordów cennika albo dosłownych kwot użytkownika jawnie opisanych
  jako netto. Kwota z wiadomości nadal wymaga kontroli znaczenia (sprzedaż vs zakup,
  właściwa pozycja). Schemat i cytat nie gwarantują poprawnego dopasowania.
- Nieznana cena pozostaje pusta; VAT niewybrany. Kalkulator wykonuje obliczenia
  dopiero po prawidłowym uzupełnieniu. Szkic nie może trafić bezpośrednio do PDF.
- Stawka znaleziona w internecie może być opisana w zwykłej odpowiedzi jako orientacja
  rynkowa, ale nie może wypełnić `netPrice` szkicu. Wycena nadal używa tylko cennika
  firmy albo jawnej kwoty użytkownika.
- Automatyczna pamięć klienta: kod po stronie serwera przeszukuje wszystkich klientów
  firmy, skanując wiadomości użytkownika od najnowszej do najstarszej. Dzięki temu
  „Co robiliśmy u niego?” korzysta z klienta wskazanego wcześniej w tej rozmowie.
  Najnowsza niejednoznaczna wzmianka zatrzymuje dopasowanie, aby historia poprzedniej
  osoby nie została użyta przez pomyłkę.
- Kontekst modelu: nazwa firmy, same nazwy i identyfikatory pierwszych 100 klientów oraz
  pierwsze 100 pozycji cennika. Ostatnie 5 dokumentów (opis prac do 2000 znaków)
  dołączamy tylko dla klienta jednoznacznie rozpoznanego przez kod. Nie wysyłamy pełnych
  historii wszystkich klientów, telefonu, e-maila, adresu ani notatek. To ograniczona,
  bezpieczna pamięć operacyjna, nie pełny RAG.
- Ostatnich 12 wiadomości, maks. 6000 znaków wiadomości, 5000 tokenów wyjścia,
  minimalny poziom rozumowania bez zwracania jego treści,
  timeout 45 s, jedno zapytanie naraz na użytkownika, 20 prób/h w pamięci procesu. Restart resetuje
  limit; to nie produkcyjna kontrola kosztów ani gwarantowany limit wydatków.
- Router wymaga endpointu obsługującego wszystkie parametry, odmawia dostawcom deklarującym
  zbieranie danych i domyślnie wymusza ZDR. To nadal nie jest audyt prawny, DPA ani gwarancja
  przetwarzania w UE; politykę konkretnego endpointu trzeba sprawdzić przed realnymi danymi.
- Rozmowy i ostatni niezapisany szkic przechowujemy w prywatnym workspace organizacji w Supabase. Zapisany dokument
  otwieramy z aktualnej wersji, a nie ze starej propozycji modelu.
- Od 2026-09-04 prompt systemowy otrzymuje kontrolowany typ konta `Odkryj`, `Uruchom`
  albo `Prowadź` oraz zatwierdzone pole celu/kierunku. Typ zmienia priorytet pomocy,
  ale nie uprawnienia, reguły cen ani walidację dokumentów.
- Trasa asystenta sprawdza saldo zapisane w workspace organizacji przed zapytaniem i zwraca koszt produktu
  po odpowiedzi. To prototyp UX; produkcja wymaga atomowego obciążenia i księgi,
  żeby ponowienie żądania nie naliczało kosztu drugi raz.
- OpenRouter zwraca `usage` wraz z każdą odpowiedzią. Serwer zapisuje rzeczywisty
  koszt USD, tokeny, model, provider i identyfikator żądania w `usage_events`, przypisany
  do użytkownika, organizacji i rozmowy. Ten zapis jest źródłem kosztu per użytkownik;
  endpoint salda klucza OpenRouter służy później wyłącznie do uzgodnienia sum.
- Serwer przekazuje do OpenRouter identyfikator użytkownika ustalony z sesji, nigdy
  wartość przesłaną przez przeglądarkę. Ułatwia to atrybucję i kontrolę nadużyć.
- Testy dostawcy używają odpowiedzi kontrolowanych: odmowa, niepełny JSON, błąd
  dostawcy, błędny schemat, Markdown wokół JSON i bezpieczny fallback tekstowy.
  Mały benchmark syntetyczny dał 4/4 ukończone zadania dla Gemini 3.5 Flash, 3/4 dla
  Flash Lite i brak dostępnej trasy dla GPT-5.6 Luna przy obecnych filtrach. Jakość
  językowa, ekonomia i UX na realnych danych HVAC nadal wymagają właściwego benchmarku.

## Przepływ

Tekst / nagranie / zdjęcie → wejściowa walidacja i limity → opcjonalne STT/vision
→ rozpoznanie intencji → odpowiedź lub strukturalna propozycja operacji
→ walidacja serwerowa i autoryzacja → reguły biznesowe → karta szkicu
→ potwierdzenie użytkownika → zapis / PDF / wysyłka.

## Granice zaufania

- Wszystkie wejścia, zdjęcia, dokumenty, transkrypcje i wyniki modelu są niezaufane.
- Wyniki wyszukiwania i zawarte na stronach instrukcje są niezaufane; nie nadają modelowi
  nowych uprawnień i wymagają porównania źródeł przy decyzjach wysokiego ryzyka.
- Instrukcja ukryta w dokumencie nie nadaje modelowi uprawnień.
- Organizację i użytkownika ustala sesja na serwerze, nie pole wygenerowane przez LLM.
- Każde narzędzie sprawdza przynależność do firmy i uprawnienia do konkretnej operacji.
- Wyjście zgodne ze schematem nie oznacza poprawności merytorycznej.
- Nieznana cena nie ma wartości domyślnej. Zero jest dozwolone tylko jako świadoma,
  zgodna z polityką firmy decyzja, nie jako zastępstwo brakującej wartości.
- Ceny i sumy wylicza moduł domenowy; LLM ich nie oblicza ani nie zatwierdza.
- Wysyłanie, edycja cennika i operacje płatnicze nie są autonomiczne.

## Moduły

Małe interfejsy dla interpretacji, czatu, transkrypcji i vision. Modele konfigurowane
poza workflow. Nie budujemy wielu agentów ani własnego frameworka orkiestracji.
Schematy, limity, kontrola kosztów i zestaw ewaluacji należą do aplikacji.
Nie przesyłamy pełnej historii firmy do każdego zapytania.

## Dobór dostawcy

OpenRouter jest bramką do eksperymentów, nie zatwierdzonym dostawcą produkcyjnym. Startowa
wybór lokalnej alfy `google/gemini-3.5-flash` wynika z obsługi tekstu, obrazów, audio,
plików, narzędzi i structured outputs w jednym modelu oraz wyniku 4/4 w małym teście.
Flash Lite zostaje opcją kosztową do dalszych testów, ale uzyskał 3/4. GPT-5.6 Luna
nie może być jedynym modelem, gdy żądanie zawiera audio. Dla osobnego STT nadal porównaj OpenAI GPT-Transcribe, Deepgram Nova-3
i Google Speech-to-Text.
Sprawdź ceny, limity konta, regiony, umowy, retencję, użycie danych i opóźnienia.
Nie utożsamiaj bazy w UE z przetwarzaniem całego systemu wyłącznie w UE.

Benchmark: realne polskie nagrania HVAC, hałas/echo, nazwiska, producenci,
modele, ilości, czas, ceny i jednostki. Mierz poprawność całego zadania, koszt
ukończonego workflow, konieczne korekty i czas — nie tylko WER.

## Bezpieczeństwo i koszty

Limity wielkości wejść, czasu nagrań, tokenów, żądań i równoległości; limit na
organizację sprawdzany serwerowo przed wywołaniem. Rejestruj koszt i wynik
bez surowych danych klienta w logach. Obsłuż timeout, powtórzenia i awarię dostawcy.
Nagrania przechowuj tylko tak długo, jak wymaga określony cel i zatwierdzona polityka.

Techniczne odpowiedzi o ryzyku wymagają ostrożności. RAG z dokumentacją i źródłami
jest późniejszym etapem; obecny asystent nie może udawać zweryfikowanej bazy instrukcji.
