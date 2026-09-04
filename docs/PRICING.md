# Ceny — hipotezy startowe

Stan: 2026-09-05. Nie traktować jako opublikowanej oferty handlowej.

| Plan                    | Cena miesięczna | Kierunek wartości                         |
| ----------------------- | --------------- | ----------------------------------------- |
| Lite                    | 49 zł           | Jeden fachowiec, niższe limity AI         |
| Pro                     | 99 zł           | Jeden fachowiec, wyższe limity AI         |
| Firma                   | 299 zł          | Wspólne dane, członkowie i kontrola firmy |
| Dodatkowy członek Firma | 49,99 zł        | Rozbudowa zespołu                         |

Hipoteza liczby miejsc Firma: właściciel + 3 pracowników. To przykład z pierwotnej
instrukcji — wymaga ostatecznego potwierdzenia przed konfiguracją rozliczeń.

## Okres próbny — wdrożony w kodzie, czeka na konfigurację Stripe

- 3 pełne dni bez opłat, liczone po stronie systemu płatności;
- metoda płatności jest wymagana w Stripe Checkout przed rozpoczęciem próby;
- przed potwierdzeniem użytkownik widzi: `0 zł dzisiaj`, dokładną datę końca próby,
  miesięczną cenę wybranego planu i jasną informację o możliwości anulowania;
- bez anulowania przed końcem próby system podejmuje pierwszą opłatę i rozpoczyna
  miesięczne odnowienia;
- anulowanie podczas próby pozostawia dostęp do jej końca i zapobiega pierwszej opłacie;
- jedna próba przypada na uprawnione konto lub organizację; SmartFach nie przechowuje
  pełnych danych karty ani CVC;
- wymagane są wiadomość startowa, łatwy dostęp do anulowania oraz przypomnienie
  przed pierwszą opłatą.

Trzy dni są hipotezą biznesową o wysokim ryzyku: fachowiec może nie mieć w tym czasie
odpowiedniej wizyty i nie osiągnąć pierwszej wartości. Mierzymy rozpoczęcie checkoutu,
podpięcie karty, pierwszą wycenę/protokół, rezygnację w próbie i trial → paid.
Pierwszym wariantem porównawczym jest 7 dni z kartą, a nie bezterminowy darmowy plan.

Odkryj, Uruchom i Prowadź są wewnętrznymi typami konta, nie osobnymi planami.
Publiczna rejestracja pokazuje dwie sytuacje: „Buduję od zera” oraz „Mam pomysł
lub firmę”. Zmiana kontekstu nie wymaga dodatkowego zakupu.

Plan jest przypisany do konta lub organizacji. Zmiana typu konta w Ustawieniach:

- nie tworzy dodatkowej płatności;
- nie zmienia ceny ani daty odnowienia;
- nie resetuje ani nie zwiększa miesięcznego limitu;
- nie usuwa zatwierdzonych informacji, kwot, historii ani rozmów;
- nie rozszerza praw użytkownika do danych organizacji.

## Prezentacja planów na landingach

Na zapleczu i publicznie pozostają trzy nazwy: Lite, Pro i Firma. „Jednoosobowa”
oraz „z pracownikami” opisują odbiorcę, a nie kolejne plany. Wejście „Buduję od
zera” pozwala wybrać Lite/Pro. Wejście „Mam pomysł lub firmę” oraz landing zespołowy
pozwalają wybrać Pro/Firma. Pro jest wspólnym planem obu punktów startu. Pełny
cennik nadal przedstawia jedną linię Lite/Pro/Firma, ale prowadzi do poprawnie
wstępnie wybranej sytuacji.

Zmiana sytuacji na ekranie rejestracji natychmiast aktualizuje dwa dostępne plany
bez nawigowania na inny adres. Niedozwolony wybór zmienia się na Pro i jest również
odrzucany przez serwer oraz normalizowany przy tworzeniu nowego konta w bazie.
To hipoteza merchandisingowa do pomiaru, a nie techniczne rozdzielenie produktu.

Na obecnym etapie realne różnice, które można komunikować bez nadmiarowych obietnic:

- Lite: jedna osoba i niższy limit planu, wspólny dla trybów;
- Pro: jedna osoba i wyższy limit planu, wspólny dla trybów;
- Firma: właściciel + 3 członków, wspólna przestrzeń danych i limit zespołu;
- dodatkowy członek Firma: 49,99 zł według niezwalidowanej hipotezy.

Nie przypisuj Pro „dokładniejszego AI” ani osobnych funkcji bez decyzji produktowej
i implementacji. Funkcji zespołowych nie wolno sprzedawać jako dostępnych, dopóki
zarządzanie kontami i izolacja danych nie przejdą bramki alfy.

## Limity użycia

Przyjęty kierunek modelu limitów:

- techniczny przelicznik działa w tle i nie jest pokazywany w zwykłym interfejsie;
- każdy plan zawiera miesięczny limit użycia odpowiedni do planu;
- zużycie we wszystkich trzech ścieżkach obciąża właściwą pulę uprawnionego
  konta lub organizacji; szczegółowa granica puli Firma pozostaje otwarta;
- kredyty dokupione są rejestrowane oddzielnie i zużywane dopiero po wyczerpaniu
  bieżącej puli miesięcznej;
- zakup i obciążenie wymagają kluczy idempotencji oraz audytowalnej księgi operacji.

**Aktualna hipoteza, nie zamknięta decyzja:** niewykorzystana część puli zawartej
w planie wygasa przy odnowieniu i nie kumuluje się. Ważność kredytów dokupionych,
sposób rozliczenia anulowania i zwroty wymagają osobnej decyzji.

Podstawowy abonament używa Stripe Checkout, serwerowych kluczy idempotencji i
zweryfikowanych webhooków. Jednorazowego zakupu zwiększeń limitu nie udostępniamy,
dopóki nie ma transakcyjnej księgi grantów i obciążeń.

### Wewnętrzna hipoteza lokalnego prototypu

| Plan  | Miesięczna pula testowa |
| ----- | ----------------------- |
| Lite  | 150 kredytów            |
| Pro   | 500 kredytów            |
| Firma | 1600 kredytów           |

Hipotetyczne pakiety pojawiają się wyłącznie po wykorzystaniu planu. Wewnętrznie odpowiadają
100 jednostkom za 19,99 zł, 300 za 49,99 zł oraz 1000 za 129,99 zł. Przycisk zakupu
pozostaje celowo nieaktywny. Przelicznik prototypu:
odpowiedź tekstowa 1, zdjęcie +2, nagranie +4, wykorzystane wyszukiwanie internetowe +2.
Są to liczby do badania z użytkownikami i porównania z rzeczywistym kosztem dostawcy,
nie zatwierdzona publiczna oferta. Limit lokalny blokuje następne żądanie po wyczerpaniu,
ale nie zastępuje przyszłej transakcyjnej księgi serwerowej.

## Otwarte decyzje — nie implementuj opłat na domysłach

- Czy ceny są netto czy brutto, zasady podatkowe i sposób przedstawienia ich klientowi.
- Zatwierdzenie lub zmiana testowych pul, cen pakietów i przelicznika operacji;
  pula Firma wspólna czy dodatkowe limity na osobę.
- Kiedy zaczyna się naliczanie dodatkowego miejsca: zaproszenie czy aktywacja.
- Przeliczenie opłat w środku miesiąca, usuwanie członka, anulowanie i zaległe płatności.
- Zwroty, podatki, dokument sprzedaży i sposób rozliczania usług w Polsce.
- Różnica Lite/Pro poza limitem, jeżeli dane pokażą taką potrzebę.
- Czy i na jakich zasadach kredyty są zwracane po błędzie lub anulowaniu operacji.

Propozycja, nie decyzja: rozliczać dodatkowe aktywne miejsca, nie same oczekujące
zaproszenia; odejście członka nie usuwa historii firmy. Wymaga akceptacji foundera.

## Ekonomia i pomiar

Mierz przychód bez podatków należnych, koszty AI/STT, infrastruktury, obsługi
płatności i wsparcia. Nie utożsamiaj liczby wiadomości z kosztem użycia.
Zmiana ceny wymaga danych: aktywacja, konwersja, churn, ARPU, CAC, koszt i willingness to pay.
Firma nie jest pakietem kilku Pro taniej — wspólne zasady i historia muszą dawać dodatkową wartość.

Stripe wymaga osobnego sprawdzenia metod obsługujących automatyczne odnowienia;
nie zakładaj, że każda metoda płatności jednorazowej obsługuje subskrypcje.
Kredyt produktu nie jest tokenem modelu ani jednostką pieniężną. Przed publikacją
trzeba opisać, ile kredytów pobierają typowe operacje i jak zmiana kosztu dostawcy
wpływa na ten przelicznik.
