# Zakres pierwszej wersji

Stan: 2026-09-05. Ten dokument definiuje docelowy zakres, nie potwierdza jego wdrożenia.

## Obecny przyrost — integracje przygotowane, jeszcze nie uruchomione produkcyjnie

Chat-first, brak automatycznych przykładów. Interfejs przyjmuje tekst, zdjęcie
i nagranie. Działające ręcznie:
klienci/edycja/historia, cennik/edycja/import CSV z podglądem, wyceny z walidacją
i obliczeniami, protokoły, PDF z polskimi znakami, ustawienia firmy i eksport JSON.
Workspace Supabase ma kontrolę wersji danych, RLS i potwierdzenie usuwania.
Szkice AI i rozmowy mają strukturę trwałego zapisu; adapter OpenRouter wymaga konfiguracji.
Zdjęcia i głos są tylko wejściem bieżącego zapytania i nie mają jeszcze bezpiecznego
magazynu ani testów fizycznego telefonu. XLSX nie jest częścią przyrostu. Lista
zespołu pozwala dodawać, edytować i usuwać osoby, ustalać stanowisko oraz sprawdzać
cenę miejsc; nie tworzy loginów ani zaproszeń. Rejestracja, podstawowa organizacja,
RLS oraz kod Stripe Checkout/webhook/portal są wdrożone i czekają na zastosowanie
migracji oraz sekrety usług. Odrębne etapy: uruchomienie/ewaluacja AI, członkostwa online,
rozliczenia zwiększeń limitu, wysyłka
i testy fizycznych telefonów.
Publiczna rejestracja pokazuje dwa proste wejścia: „Buduję od zera” oraz
„Mam pomysł lub firmę”. Wewnętrzne konteksty Odkryj/Uruchom/Prowadź pozostają
w danych i mogą być zmieniane w Ustawieniach. Istnieje wewnętrzny
testowy przelicznik z blokadą po wykorzystaniu limitu. Zwykły interfejs nie pokazuje
salda; zwiększenie limitu pojawia się dopiero po jego wykorzystaniu. Nie ma jeszcze trwałych rezultatów Odkryj
i Uruchom ani prawdziwego zakupu zwiększeń limitu. Operacyjne workflow obecnego
warsztatu odpowiadają wyłącznie fragmentowi Prowadź.
Główne landingi mają kontekstowe FAQ odpowiadające na obiekcje dotyczące sposobu
działania, pochodzenia cen, celu 10 000 zł, planów oraz 3-dniowej próby. FAQ nie
przedstawia osobnych kont pracowników ani niegotowych rozliczeń zwiększeń limitu
jako dostępnych funkcji.
W rejestracji pierwszy wybór asynchronicznie zawęża ofertę: Buduję od zera do
Lite/Pro, a Mam pomysł lub firmę do Pro/Firma. Serwer ponownie sprawdza tę parę.
Po poprawnym utworzeniu konta użytkownik jest kierowany bezpośrednio do Stripe,
również gdy potwierdzanie e-maila w Supabase jest włączone. Po Checkout trafia na
ekran aktywacji i dopiero wtedy potwierdza adres. Niepotwierdzony trial ma zarządzaną
blokadę odnowienia, aby literówka w adresie nie spowodowała późniejszego obciążenia.

## Typy konta

Odkryj, Uruchom i Prowadź są wewnętrznymi typami konta, a nie trzema publicznymi
produktami ani krokami obowiązkowego onboardingu. Konto ma jeden aktywny typ.
Publiczna rejestracja upraszcza wybór do dwóch sytuacji, a wybór techniczny następuje przy rejestracji,
a zmiana wyłącznie w Ustawieniach; nie resetuje planu, okresu, historii ani limitu
i nie omija uprawnień organizacji. Publiczny landing może tylko wstępnie zaznaczyć
typ podczas rejestracji. Nie może zmienić istniejącego konta parametrem URL.

| Ścieżka | Minimum pierwszej wersji | Warunek powodzenia |
| --- | --- | --- |
| Odkryj | Ustrukturyzowane opcje, założenia, ryzyka i następny test do zapisania | Użytkownik otrzymuje konkretną decyzję lub test, nie ogólną rozmowę |
| Uruchom | Klient docelowy, oferta, podstawy cenowe i karta kolejnych działań | Powstaje wykonalny następny krok prowadzący ku pierwszemu klientowi |
| Prowadź | Wyceny, protokoły, klienci, historia, cennik i zespół | Rzeczywista praca firmy jest wykonana i zapisana bez zgadywania danych |

„Od pomysłu do pierwszego klienta” jest aspiracyjnym kierunkiem komunikacji.
Produkt nie obiecuje dochodu, klienta ani wyniku w określonym terminie.

## Fundament

- Rejestracja/logowanie, organizacja, podstawowe dane firmy, logo.
- Dwie podstawowe role: właściciel i członek; szczegółowe prawa do cen i marży
  wymagają specyfikacji przed uruchomieniem planu Firma.
- Izolacja danych między organizacjami, także przy dostępie do plików.
- Własne stawki oraz import CSV/XLSX: podgląd, mapowanie kolumn, walidacja,
  rozstrzyganie duplikatów i potwierdzenie zapisu.
- Konto przechowuje osobisty kontekst Odkryj/Uruchom oddzielnie od danych firmy.
  Kontekst Prowadź pozostaje objęty członkostwem i izolacją organizacji.

## Workflow

| Obszar    | Minimum                                                 | Warunek powodzenia                                       |
| --------- | ------------------------------------------------------- | -------------------------------------------------------- |
| Klienci   | Kartoteka i historia                                    | Dokument można odnaleźć po kliencie                      |
| Wycena    | Tekst/głos → cennik → obliczenia → edycja → PDF         | Brak zgadywanych cen; poprawne, sprawdzalne sumy         |
| Protokół  | Tekst/głos → szkic → korekta → PDF → historia           | Nie dopisuje wykonanych prac, testów i pomiarów          |
| Asystent  | Otwarte pytania oraz karty workflow; głos i podstawowe zdjęcia | Swobodne wejście nie kończy się generyczną poradą      |
| Firma     | Właściciel, członkowie, wspólne dane                    | Użytkownik widzi wyłącznie uprawnione dane firmy         |
| Płatności | Plany, uprawnienia, limity, obsługa zdarzeń płatniczych | Powtórzone zdarzenie nie nalicza dostępu/opłat drugi raz |
| Limity    | Pula planowa i oddzielna pula zwiększenia w tle          | Ponowienie operacji nie obciąża limitu drugi raz            |

## Kolejność realizacji

1. Dokumentacja, landing i lokalny ekran aplikacji, testowalna podstawa obliczeń.
2. Konto, organizacja/logowanie, RLS, jeden wybrany typ konta oraz prosty cennik i klienci.
3. Pełna wycena tekstowa na własnych stawkach z PDF i historią.
4. Uruchomienie i ewaluacja otwartego czatu, zdjęć i nagrań na prawdziwych modelach;
   osobny benchmark STT pozostaje alternatywą dla natywnego audio.
5. Protokół po wizycie i wspólna historia.
6. Minimalne, ustrukturyzowane rezultaty Odkryj i Uruchom, bez budowy generycznego
   doradcy biznesowego i bez osłabienia podstawowych workflow Prowadź.
7. Członkowie, transakcyjna księga zwiększeń limitu, analityka oraz przegląd
   przed płatną alfą. Podstawowy Stripe Checkout subskrypcji jest przygotowany;
   realny zakup zwiększeń dopiero po idempotentnej księdze. Lista zespołu istnieje, ale zaproszenia,
   logowanie pracowników i egzekwowanie uprawnień nadal należą do tego etapu.

Nie jest to harmonogram w dniach. Kolejne etapy zależą od jakości i wyników testów.
Interfejs demo bez podłączonych workflow nie jest gotowym produktem do sprzedaży.

## Bramka płatnej alfy

- Cały obiecywany zakres planu działa od początku do końca.
- Zatwierdzenie wyceny przed wysyłką; brak cichego zastępowania nieznanych pozycji.
- Zweryfikowane zasady netto/brutto, VAT, marży, rabatów i zaokrągleń.
- Testy autoryzacji, izolacji firm, powtórzeń zapisów i zdarzeń płatniczych.
- Sprawdzone fizyczne iOS/Android: instalacja, PDF, a jeśli obiecane — nagrywanie i uprawnienia,
  odświeżenie, słaby zasięg i przejście z przeglądarki Facebooka.
- Pomiar pierwszej wartości, powrotów i kosztów AI; alerty i ograniczenia kosztów.
- Audytowalne zużycie wewnętrznych jednostek. Pula planowa i dodatkowa nie są
  mieszane, a retry nie powoduje podwójnego obciążenia ani podwójnego zakupu.
- Test regresji zmiany typu konta w Ustawieniach: plan, wykorzystanie limitu, zatwierdzony kontekst,
  klienci, cennik, dokumenty i wcześniejsze rozmowy pozostają niezmienione.
- Uzgodnione przetwarzanie danych, dostawcy, regulamin i zasady rozliczania;
  przegląd prawnika/księgowego tam, gdzie jest potrzebny.
- Checkout przed zapisaniem karty pokazuje `0 zł dzisiaj`, dokładną datę pierwszej
  opłaty, miesięczną cenę i łatwy sposób anulowania 3-dniowej próby.
- Rejestracja nie zatrzymuje użytkownika przed Checkout komunikatem „sprawdź e-mail”.
  Po zakupie ekran aktywacji pozwala ponownie wysłać polską wiadomość. Brak
  potwierdzenia nie może przejść w płatne odnowienie.
- Trial, status metody płatności i dostęp wynikają ze zweryfikowanych webhooków
  przetwarzanych po stronie serwera; ponowienie zdarzenia nie dubluje uprawnień ani opłaty.
- Panel właściciela ma osobną autoryzację przez jedno serwerowo wskazane konto.
  Przegląd nie pokazuje wiadomości. Pełne rozmowy są dostępne w profilu użytkownika,
  ponieważ służą badaniu błędów AI i ciągłości kontekstu. Każde otwarcie jest audytowane,
  a użytkownik przed rejestracją otrzymuje jasną informację o tym przetwarzaniu.
- Kopie zapasowe z próbą odtworzenia, obsługa błędów i kontakt do wsparcia.

Brak integracji fakturowej nie może być ukrywany deklaracją, że samo Stripe
Billing rozwiązuje wszystkie obowiązki księgowe w Polsce.
Marketing nie może zamieniać hasła „od pomysłu do pierwszego klienta” w gwarancję
dochodu, klienta, tempa wzrostu ani powodzenia firmy.
