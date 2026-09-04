# Podstawowe przebiegi

## Typ konta

Produkt ma trzy możliwe typy konta; na koncie aktywny jest jeden:

- **Odkryj** — porównanie pomysłów, nowych usług lub kierunków oraz zapis
  konkretnego testu. Jest stale dostępne, również dla aktywnej firmy.
- **Uruchom** — praca nad konkretnym biznesem: klient docelowy, oferta, podstawy
  cenowe i następne działania zmierzające do pierwszego klienta.
- **Prowadź** — wykonywanie codziennych zadań firmy i budowanie jej historii.

Nie ma wymuszonej kolejności, odblokowywania ani automatycznej oceny „poziomu”
użytkownika. Typ wybiera się przy rejestracji i zmienia wyłącznie w Ustawieniach.
Zmiana nie usuwa zatwierdzonych ustaleń. Kontekst osobisty
i kontekst organizacji pozostają rozdzielone; członek firmy nie uzyskuje przez
wspólne konto dostępu do danych, do których nie ma uprawnienia.

Abonament jest przypisany do konta lub organizacji, nie do typu. Zmiana typu konta
nie tworzy zakupu i nie resetuje okresu, planu ani zużycia limitu. Typ nie jest
codziennym przełącznikiem nawigacji ani parametrem URL zmieniającym istniejące konto.

Każda ścieżka korzysta z jednego asystenta SmartFach, ale prowadzi do własnych,
ustrukturyzowanych kart i następnych akcji. Nie budujemy trzech osobowości AI ani
generycznego czatu, który jedynie opowiada o pomysłach i prowadzeniu firmy.

Publiczny landing i rejestracja nie pokazują tej wewnętrznej struktury jako trzech
produktów. Klient wybiera tylko „Buduję od zera” albo „Mam pomysł lub firmę”.
Druga opcja obejmuje zarówno pierwszą ofertę, jak i codzienną obsługę zleceń.
Wewnętrzne rozdzielenie pozostaje po to, aby nie osłabić kontekstu AI i workflow.
Pierwsza sytuacja pokazuje Lite/Pro, a druga Pro/Firma. Zmiana sytuacji aktualizuje
wybór na tym samym ekranie; Pro jest wspólnym planem obu ofert.

## Pierwsza wartość

Konto → wybór sytuacji i pasującego planu → Stripe Checkout → jedna wiadomość do asystenta → pytanie tylko
o brak krytyczny → karta rezultatu → następna akcja. Pierwszą wartością jest:

- w Odkryj: zapisane porównanie lub konkretny test założenia;
- w Uruchom: wykonalny element oferty albo następny krok pozyskania klienta;
- w Prowadź: sprawdzony dokument lub wykonane zadanie operacyjne.

W Prowadź wstępne uzupełnienie klienta ani całego cennika nie blokuje rozmowy.
Brakująca cena pozostaje pusta i wymaga podania lub pozycji z cennika. Instalacja
PWA i rozbudowa katalogu nie blokują pierwszego dokumentu. Demo jest wyraźnie
odseparowane od prawdziwych danych i cen firmy.

## Odkryj i Uruchom

Odkryj pokazuje ograniczoną liczbę opcji wraz z założeniami, ryzykami, brakującymi
danymi i następnym sposobem weryfikacji. Użytkownik może zapisać rezultat, wrócić
  do niego tak długo, jak konto ma typ Odkryj.

Uruchom pracuje na jednym konkretnym biznesie lub usłudze. Rezultaty mają postać
kart: klient docelowy, propozycja oferty, założenia cenowe policzone przez kod oraz
lista następnych działań. Zatwierdzone elementy mogą zasilić firmę i cennik w Prowadź,
ale wyłącznie po świadomej akcji użytkownika.

Odkryj i Uruchom nie kończą się na wygenerowaniu dokumentu. Podstawowy cykl to:
ustal najbliższy krok → wykonaj go → wróć z wynikiem → zaktualizuj rekomendację,
ofertę albo następne działanie. Historia zatwierdzonych ustaleń pozwala kontynuować
pracę w kolejnych tygodniach bez zaczynania od zera.

Hasło „od pomysłu do pierwszego klienta” opisuje aspirację i zakres wsparcia.
SmartFach nie gwarantuje pozyskania klienta, przychodu ani rentowności.
W Odkryj można użyć celu „10 000 zł miesięcznego przychodu” wyłącznie jako
punktu wyjścia do policzenia ceny, kosztów, potrzebnej liczby klientów i działań.
Interfejs oraz reklama muszą wprost odróżniać cel użytkownika od gwarancji SmartFach.

## Wycena

1. Użytkownik podaje klienta, materiały, ilości, czas i dojazd.
2. AI wydobywa intencję i propozycję pozycji; ceny mają wskazane źródło.
3. Kod dopasowuje cennik w obrębie firmy. Niejednoznaczności są pytaniami do użytkownika.
4. Kod waliduje jednostki, stawki i dopuszczalne zmiany, następnie oblicza sumy.
5. Karta pokazuje pozycje, netto/VAT/brutto i — tylko przy znanym koszcie — marżę.
6. Użytkownik poprawia i zatwierdza wersję dokumentu.
7. PDF powstaje z zatwierdzonych danych. Przekazanie/wysłanie wymaga świadomej akcji.

Historia dokumentu przechowuje kopię użytych cen i zasad obliczeń. Późniejsza
zmiana cennika nie zmienia starej oferty.

Przypadki brzegowe: dwóch Kowalskich, brak stawki, kwota bez określenia netto/brutto,
nieznana jednostka, błędna transkrypcja liczby, ponowienie po przerwanym połączeniu.

## Protokół

Opis wykonanej pracy → szkic → sprawdzenie przez fachowca → przypisanie do klienta
→ PDF i zapis w historii. Nie zamieniaj „sprawdziłem ciśnienie” w konkretny wynik
pomiaru. Nie deklaruj zgodności, bezpieczeństwa ani odbioru, jeżeli tego nie potwierdzono.

## Otwarty asystent

Normalne pytania, redagowanie wiadomości, wyjaśnianie, skracanie, podsumowanie
historii, pytania o zdjęcie. Do odczytu historii korzysta z narzędzia autoryzowanego
przez serwer; nie uzyskuje dostępu do całej bazy. Przy aktualnych cenach rynkowych,
przepisach, danych producentów i informacjach lokalnych może sam uruchomić ograniczone
wyszukiwanie internetowe. Odpowiedź pokazuje źródła. Brak danych jest jawną odpowiedzią.

Internet służy do researchu i odpowiedzi, nie do automatycznego wypełniania cen
w dokumencie. Cena wyceny nadal pochodzi z cennika firmy albo jawnej kwoty użytkownika.

Rozmowa nie stanowi polecenia wysłania wiadomości ani trwałej zmiany danych.
Operacje biznesowe są wersjonowanymi szkicami, które użytkownik potwierdza.

## Limity użycia

Konto lub organizacja otrzymuje miesięczny limit wynikający z planu. Techniczny
przelicznik kosztu nie jest elementem codziennego UX. Użytkownik nie widzi stałego
licznika; po wykorzystaniu limitu może jednorazowo go zwiększyć albo zmienić plan.
Zmiana typu konta nie zwiększa dostępnej puli ani nie zeruje dotychczasowego użycia.
Obecna hipoteza: niewykorzystana pula planowa nie kumuluje się po odnowieniu;
dokładne limity, ceny i zasady ważności wymagają decyzji przed rozliczeniami.

Jedna operacja nie może pobrać kredytów drugi raz po ponowieniu żądania. Zakup
nie jest dostępny, dopóki billing, księga kredytowa i obsługa zdarzeń nie są
idempotentne. Kredyty są jednostką produktu, a nie obietnicą stałej liczby tokenów modelu.

## Aktualny przyrost — 2026-09-04

Publiczne landing page’e upraszczają komunikację do „Buduję od zera” oraz
„Mam pomysł lub firmę”. Rejestracja i logowanie Supabase oraz wewnętrzny typ konta
Odkryj, Uruchom lub Prowadź są wdrożone. Typ zmienia się wyłącznie w Ustawieniach.
Odkryj i Uruchom nie mają jeszcze własnych zapisywalnych kart rezultatów, dlatego są
szkieletem do testu rozmowy, a nie gotowym workflow. Blokada limitu działa w workspace.
Komunikat zwiększenia jest dostępny dopiero po wykorzystaniu planu; zakup zwiększeń nie działa.
Publiczne CTA komunikują docelową 3-dniową próbę z wymaganą kartą i automatycznym
przejściem na miesięczny abonament przy braku anulowania. Kod ma Stripe Checkout,
portal, wymaganą kartę i zweryfikowane webhooki; uruchomienie wymaga sekretów, cen
i endpointu webhooka. `/admin` pokazuje realne konta, triale, subskrypcje i koszt AI.
Przegląd nie pokazuje wiadomości; pełne rozmowy są w profilu użytkownika, a każde
otwarcie zapisuje audyt. Dostęp ma jedno konto foundera wskazane serwerowym UUID.

Home: jeden asystent przyjmujący tekst, zdjęcie albo nagranie, bez automatycznych
wiadomości, cen i dokumentów. To jedyne główne
miejsce rozpoczynania pracy. Skróty wpisują początek polecenia zamiast otwierać formularz.
Przycisk wysyłania nie działa bez jawnego skonfigurowania AI; tryb ręczny jest opisany
jako awaryjny. Czat ma normalne odpowiedzi oraz karty propozycji dokumentów. Nie udaje wysyłki.
Model konfiguruje wyłącznie founder po stronie serwera. Zdjęcie i głos są częścią
  bieżącego zapytania, ale ich pliki nie trafiają do historii.

Klient: automatyczna pamięć w tle, dodanie, edycja, wyszukanie i historia. Użytkownik
nie wybiera pamięci przed napisaniem wiadomości. Kod przeszukuje wszystkich klientów
firmy i utrzymuje ostatnie jednoznaczne dopasowanie z całej rozmowy; dopiero wtedy
dołącza właściwą historię. Nowa karta powstaje przy zapisie pierwszego dokumentu; karta
szkicu uprzedza o tym. Dwie osoby pasujące do nazwy wymagają doprecyzowania. Usunięcie klienta
mającego dokumenty jest zablokowane.

Cennik: własna nazwa, jednostka i cena sprzedaży netto; edycja/usuwanie. CSV ze
średnikiem, przecinkiem lub tabulatorem, wymagane kolumny nazwa/jednostka/cena_netto.
Podgląd przed zapisem; pozycje już istniejące nie są nadpisywane. Brak parsera XLSX.

Wycena: puste pola lub szkic AI, wybór cennika, ręczne pozycje, jawny wybór VAT,
walidacja, zapis, podgląd, ponowna edycja i PDF. Nieprawidłowe pola ukrywają sumę
i blokują zapis. Ceny są kopiowane, a nie odczytywane ponownie z późniejszego cennika.
VAT jest liczony osobno dla pozycji i sumowany. Brak kosztów własnych, marż,
rabatów, zwolnień, mieszanego VAT i minimalnej wartości zlecenia.

Protokół: klient, data, opis, wykonane czynności oraz opcjonalne pomiary i zalecenia.
Nie ma wymyślonych wyników ani automatycznej deklaracji bezpieczeństwa.

PDF: dokument z polskimi znakami i paginacją. Pobranie wymaga zaznaczenia
sprawdzenia treści. Każdy PDF przypomina o weryfikacji. Brak podpisu i wysyłki;
można skopiować wyłącznie tekst wiadomości, a plik dołączyć i wysłać samodzielnie.
Dane firmy pobierane są z aktualnych ustawień, bez niezmiennej wersji PDF.

Zapis i eksport: prywatny workspace JSONB w Supabase, numer rewizji i kopia JSON. Zapisane rekordy,
rozmowy i ostatnie szkice AI przetrwają odświeżenie. Ręczna, niezapisana korekta jest
stanem roboczym; odświeżenie może ją odrzucić. Błąd zapisu nie pokazuje sukcesu.
Usuwanie rekordów wymaga osobnego potwierdzenia i nie ma funkcji cofania.

To nie jest jeszcze gotowa płatna alfa: konfiguracja usług i migracja nie zostały
zastosowane, a zaproszenia pracowników, bezpieczny magazyn zdjęć/nagrań, pełny offline,
przywracanie kopii z UI i księga zwiększeń limitu nie są gotowe.
