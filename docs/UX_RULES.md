# Reguły UX

- Projektuj najpierw dla telefonu obsługiwanego jedną ręką w terenie.
- Cele dotykowe co najmniej 48 × 48 CSS px, kontrast, widoczny fokus i etykiety pól.
- Publiczny landing i rejestracja pokazują dwie zrozumiałe sytuacje: „Buduję od
  zera” oraz „Mam pomysł lub firmę”. Nie wymagają poznania nazw Odkryj/Uruchom/Prowadź.
  Wewnętrzne typy pozostają kontekstem produktu, nie trzema ofertami ani krokami 1–3.
- W rejestracji zmiana sytuacji bez przeładowania pokazuje wyłącznie dwa właściwe
  plany: Lite/Pro dla „Buduję od zera” i Pro/Firma dla „Mam pomysł lub firmę”.
  Niedostępny wybór wraca do wspólnego planu Pro. Nie odsyłaj po zmianę planu na
  osobną stronę cennika.
- Użytkownik zmienia typ wyłącznie w Ustawieniach. Zmiana zachowuje zatwierdzony
  kontekst konta, plan i wykorzystanie limitu, ale nigdy nie rozszerza
  praw do danych organizacji. Nie kopiuj automatycznie ustaleń do firmy lub cennika.
- W każdej ścieżce główne wejście to jedno pole „Napisz, nagraj albo dodaj zdjęcie…”. Tekst,
  mikrofon i zdjęcie prowadzą do tego samego asystenta oraz tej samej karty wyniku.
- Nie twórz trzech chatbotów. Wybrana ścieżka zmienia kontekst, skróty i typ karty,
  nie nazwę, osobowość ani zasady bezpieczeństwa asystenta SmartFach.
- Home Prowadź zaczyna bez rozmów, przykładowych wycen, klientów i cen. To jedyne
  główne miejsce rozpoczynania pracy operacyjnej. Skróty Stwórz wycenę, Stwórz protokół z wizyty,
  Stwórz wiadomość do klienta oraz Marketing i rozwój firmy uzupełniają pole czatu;
  nie przenoszą użytkownika do formularza. Ostatni skrót rozpoczyna otwartą rozmowę,
  a nie osobny moduł marketingowy.
- Odkryj ma kończyć się kartą opcji/ryzyk/testu, a Uruchom kartą klienta docelowego,
  oferty lub kolejnych działań. Nie kończ tych przebiegów wyłącznie poradą w czacie.
- Wyceny, Protokoły, Klienci i Cennik to drugorzędna „pamięć firmy”. Formularze są korektą
  wyniku AI albo trybem awaryjnym, nie podstawowym przebiegiem.
- Czat nie pokazuje selektora „Pamięć klienta”. Asystent automatycznie pamięta ostatniego
  jednoznacznie rozpoznanego klienta w całej rozmowie. Karta AI pokazuje: dopasowany
  klient, nowy klient tworzony po zapisie albo brak/niejednoznaczność do wyjaśnienia.
  Przy dwóch pasujących osobach prosi o pełne imię lub nazwę; nigdy nie zgaduje.
- Lista rozmów nie zajmuje miejsca nad czatem. Na komputerze znajduje się w lewym
  panelu, a na telefonie otwiera się z przycisku w nagłówku.
- Najważniejszy wynik i kolejna akcja są od razu widoczne. Krótkie odpowiedzi AI.
- Jeżeli odpowiedź korzysta z internetu, pokaż pod nią krótką listę klikalnych źródeł.
  Nie ukrywaj orientacyjnego charakteru cen rynkowych ani daty aktualności.
- Wycena/protokół jako karta. Nie poprzedzaj wyniku akapitem „Oczywiście…”.
- Po poleceniu AI pokazuj przygotowany szkic, nie ścianę tekstu. Kwota brutto wysoko na karcie,
  pozycje i podsumowanie poniżej. „Edytuj” otwiera oddzielną korektę.
- Korekta ma własny roboczy stan. Anuluj/Escape/X nie zmieniają karty; po zamknięciu
  fokus wraca do przycisku edycji. W oknie korekty akcje i suma są zawsze dostępne.
- Pusta/błędna cena lub ilość usuwa sumę roboczą i blokuje zastosowanie zmian.
- Pokaż, skąd pochodzi cena i czego brakuje. Nigdy nie maskuj niepewności.
- Marża może być informacją właściciela; widoczność zależy od uprawnień.
- Netto i brutto muszą mieć jednoznaczne podpisy, również w PDF.
- Zmiana lub wysyłka dokumentu wymaga świadomej akcji, nie samej interpretacji AI.
- Oddziel „nagrywam”, „przetwarzam”, „szkic”, „zapisano” i „wysłano”.
- Błędy odzyskiwalne: zachowaj szkic, wyjaśnij problem, daj ponowienie i edycję.
- Brak połączenia nie jest sukcesem. Nie obiecuj pełnego offline w MVP.
- Instalację PWA proponuj po pierwszej wartości. Użytkownik może zostać w przeglądarce.
- Osobno sprawdź instrukcję instalacji na iOS oraz wejście z Facebooka.
- Demo i niepodłączone funkcje są oznaczone. Mikrofon nagrywa prawdziwy plik dopiero
  po zgodzie przeglądarki; bez skonfigurowanego AI nie symuluj rozpoznania.
- Nazwa modelu i dostawcy nie jest pokazywana fachowcowi. Użytkownik korzysta z jednego
  asystenta SmartFach, a konfiguracja techniczna pozostaje po stronie serwera.
- Nie pokazuj w codziennym interfejsie technicznego licznika ani słowa „kredyty”.
  Dopiero po wykorzystaniu limitu pokaż spokojny komunikat oraz możliwość jednorazowego
  zwiększenia lub zmiany planu; nie udawaj zakupu ani powodzenia operacji.
- Materialne zasady limitu i odnowienia muszą być czytelne przed zakupem planu.
  Ukrycie licznika na Home nie może oznaczać ukrycia warunków handlowych w checkout.
- „Od pomysłu do pierwszego klienta” może być hasłem aspiracyjnym. CTA i onboarding
  nie mogą obiecywać gwarantowanego klienta, dochodu, czasu ani wyniku biznesowego.
- Kwotowy cel, np. 10 000 zł miesięcznego przychodu, pokazuj jako sekwencję:
  cel → cena i koszty → potrzebna liczba klientów → działanie → wynik → aktualizacja
  następnego działania. Obok musi być jasne, że jest to regularny proces, nie
  jednorazowy dokument ani gwarancja wyniku. Nie używaj „pasywnego dochodu”,
  „łatwych pieniędzy”, „sprawdzonej recepty” ani nieudowodnionego „najskuteczniejszy”.
- Publicznie wyjaśniaj w jednym zdaniu: jeden abonament pomaga od pomysłu po
  codzienną pracę, a plan określa miesięczny zakres użycia i liczbę użytkowników.
- Pisz „zmienisz później w Ustawieniach bez zmiany abonamentu”, nie „przełączaj tryb”.
  Informuj, że plan, wykorzystanie limitu i zapisane dane pozostają.
- Nie umieszczaj globalnego przełącznika Odkryj/Uruchom/Prowadź w głównej ani dolnej
  nawigacji. To ustawienie konta, a nie narzędzie używane kilka razy dziennie.
- Animacje landingów mają wspierać hierarchię i wrażenie szybkości, nie odciągać od CTA.
  `prefers-reduced-motion` wyłącza ruch. Testuj z rzeczywistymi użytkownikami;
  futurystyczny wygląd nie zastępuje użyteczności.

## Kierunek wizualny — 2026-08-31

Granat #172b3a jako kolor marki i nawigacji, ciepła biel #f7f8f5 jako tło,
białe dokumenty i pomarańcz #ffab70 z ciemnym tekstem dla głównych akcji. Kolor
nie jest jedynym oznaczeniem statusu. Geometryczny znak F jest wspólny dla Home
i ikon instalowanej aplikacji. Ikony interfejsu pochodzą z istniejącego zestawu.
Krój systemowy, bez zależności od zewnętrznego pobierania fontów.

Na telefonie: jedna kolumna, dolna nawigacja i edycja w panelu od dołu. Na komputerze:
nawigacja po lewej, spokojny czat w centrum; wyceny i protokoły w osobnych widokach.
Nie dodajemy na potrzeby wyglądu fikcyjnych statystyk,
powiadomień, klientów ani kalendarza. Ten kierunek wymaga sprawdzenia z fachowcami
w realnym oświetleniu i na ich telefonach; nie został jeszcze zwalidowany.
