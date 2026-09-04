# SmartFach — MASTER PLAN

Stan: 2026-09-04. Źródło: instrukcja założycielska i ustalenia w tej rozmowie.
Dokument opisuje kierunek produktu, nie listę już wdrożonych funkcji.

## Misja i zasada nadrzędna

SmartFach — Twój Asystent AI do pracy w terenie.

SmartFach nie ma być AI, z którym fachowiec musi długo rozmawiać. Ma być AI,
któremu mówi jedno zdanie, a ono wykonuje za niego kilka minut pracy.

Wejście jest elastyczne: głos, tekst, zdjęcia. Działania biznesowe są kontrolowane:
LLM rozumie człowieka, kod kontroluje biznes. LLM nie wymyśla cen i nie jest
autorytetem w sprawie VAT, marży, rabatów, uprawnień ani sum.

## Dla kogo

Początek: polscy fachowcy i małe firmy HVAC, klimatyzacji i pomp ciepła.
Nie projektujemy jednocześnie trzech branż. Hydraulika i elektryka są możliwym
kolejnym krokiem, a nie zakresem pierwszej wersji.

Produkt ma dać się sprzedać, uruchomić bez długiej nauki, używać regularnie
i rozwijać małym zespołem. Liczy się czas zaoszczędzony przy rzeczywistej pracy.

## Trzy typy konta

SmartFach ma trzy typy konta. Użytkownik wybiera jeden z nich przy rejestracji,
a później zmienia go wyłącznie w Ustawieniach, gdy realnie zmienia się jego sytuacja:

- **Odkryj** — poznawanie pomysłów, kierunków, usług i możliwości. Nie jest to
  jednorazowy etap dla początkującego: konto może pozostać w Odkryj tak długo,
  jak ten sposób pracy daje użytkownikowi wartość.
- **Uruchom** — przełożenie konkretnego pomysłu na klienta docelowego, ofertę,
  podstawy cenowe i następne działania zmierzające do pierwszego klienta.
- **Prowadź** — codzienna praca istniejącej firmy: wyceny, protokoły, klienci,
  historia, cennik, asystent oraz zespół.

To nie jest obowiązkowy lejek ani ocena dojrzałości. Użytkownik może założyć konto
bezpośrednio w dowolnym typie. Typy nie są trzema osobnymi chatbotami ani planami
cenowymi i nie są codziennym przełącznikiem w nawigacji. Zmiana typu w Ustawieniach
nie usuwa zatwierdzonego kontekstu, historii ani limitu. Każdy typ ma dawać
ustrukturyzowany rezultat i następną akcję, a nie generyczną, niekończącą się rozmowę.

Kierunek komunikacji może być aspiracyjny: **„od pomysłu do pierwszego klienta”**.
SmartFach nie gwarantuje dochodu, liczby klientów, terminu pozyskania klienta ani sukcesu
firmy. Pomaga podjąć i wykonać pracę, ale wynik zależy również od użytkownika i rynku.
W Odkryj dopuszczamy konkretny cel użytkownika, np. **„Pracuj nad dojściem do
10 000 zł miesięcznego przychodu i aktualizuj kolejne działania na podstawie
wyników”**. Kwota jest celem do przeliczenia na ofertę, liczbę klientów i działania,
nigdy obietnicą rezultatu.
Publicznie nie używamy języka łatwego, pasywnego ani gwarantowanego dochodu.

Na potrzeby marketingu trzecia ścieżka może być opisywana jako **„Prowadź i rozwijaj”**,
ale nazwa kontekstu w produkcie pozostaje krótka: **Prowadź**. Dzięki temu oferta
obejmuje również osoby pracujące samodzielnie, a nie wyłącznie większe firmy.

## Przewaga

Firmowe dane + workflow + historia + narzędzia branżowe + AI jako interfejs.
Nie konkurujemy z ChatGPT jako modelem. Docelowo SmartFach jest pamięcią
operacyjną firmy: zna klientów, cennik, stawki, historię, urządzenia i zasady.
Wartość ma wynikać z użyteczności tej historii, nie z utrudniania eksportu danych.

## Sprzedaż i retencja — hipotezy

- Hak sprzedażowy: krótkie polecenie → sprawdzona wycena → PDF dla klienta.
  Głos pozostaje hipotezą do późniejszego benchmarku, nie warunkiem obecnego interfejsu.
- Retencja: zakończenie wizyty → protokół → historia klienta.
- Odkryj może budować długoterminowe użycie także po uruchomieniu firmy, a Uruchom
  może przekazywać zatwierdzone podstawy oferty i cen do Prowadź. To hipotezy do pomiaru,
  nie powód do wymuszania przejścia między ścieżkami.
- Start na realnym produkcie, pozyskiwanie klientów m.in. reklamą na Facebooku.
- Kierunek komercyjny: płatny dostęp poprzedzony 3 pełnymi dniami próby. Karta jest
  wymagana przed rozpoczęciem, a brak anulowania przed końcem próby uruchamia pierwszy
  miesięczny abonament. To hipoteza konwersji do pomiaru, nie gwarancja optymalnego okresu.
- Regularność protokołów, przewaga głosu i gotowość do płacenia nadal wymagają
  walidacji z prawdziwymi fachowcami. Szybkie generowanie kodu nie dowodzi popytu.

## UX

Aktualizacja D027: użytkownik rozpoczyna w Odkryj, Uruchom albo Prowadź;
interfejs nie przedstawia ich jako codziennych zakładek ani kroków 1–3.
Typ konta zmienia się tylko w Ustawieniach. W aktywnym typie jedno główne pole asystenta przyjmuje tekst, zdjęcie i nagranie,
a kontekst konta przenosi wyłącznie dane, do których użytkownik nadal ma uprawnienia.

W Prowadź Home pozostaje jedynym głównym miejscem rozpoczynania pracy. Szybkie akcje
nie otwierają modułów, tylko pomagają rozpocząć polecenie: wycena, zakończenie wizyty
albo wiadomość. AI przygotowuje rezultat, a użytkownik sprawdza i zapisuje kartę.
Tryb ręczny pozostaje awaryjny.

Wyceny, protokoły, klienci i cennik są „pamięcią firmy” w drugorzędnej nawigacji, nie osobnymi
punktami startu. Czat nie ma ręcznego przełącznika pamięci klienta. System przeszukuje
wszystkich klientów firmy i utrzymuje jednoznacznie rozpoznaną osobę w kontekście całej
rozmowy. Nowa karta klienta powstaje dopiero wraz z zatwierdzonym dokumentem;
przy niejednoznaczności asystent prosi o doprecyzowanie zamiast zgadywać. Bez automatycznie
pokazanych przykładów. Multimodalne wejścia są lokalnym eksperymentem i wymagają benchmarku.

Jedna ręka, duże cele dotykowe, krótkie odpowiedzi, minimum kroków. Wyniki
biznesowe są kartami z danymi i akcjami, nie ścianami tekstu. Otwarte pytania,
redagowanie wiadomości, wyjaśnienia i podsumowania pozostają częścią asystenta.
Przy pytaniach wymagających aktualności asystent może kontrolowanie wyszukać informacje
w internecie i pokazać źródła. Wynik rynkowy nie zastępuje firmowego cennika.

AI docelowo przygotowuje cały szkic wyceny, a fachowiec go sprawdza i dopracowuje.
Ręczne wypełnianie pozycji nie jest domyślnym początkiem workflow. Formularz jest
narzędziem korekty lub świadomym trybem ręcznym, nie głównym ekranem. Nie zmienia to zasad pochodzenia cen,
deterministycznych obliczeń ani zatwierdzenia przed wysyłką (D007).

Dystrybucja: PWA przez stronę internetową, bez sklepów Apple i Google na start.
Instalacja jest opcjonalna, nie może blokować pierwszej wartości. MVP online-first;
pełna synchronizacja offline jest poza zakresem. Utrata połączenia nie może
powodować fałszywej informacji „zapisano” ani cichej utraty rozpoczętej pracy.

## Zakres MVP

1. Jedno konto, jeden aktywny typ konta wybrany przy rejestracji i zmieniany
   później wyłącznie w Ustawieniach, bez obowiązkowej sekwencji.
2. Odkryj: wąskie, ustrukturyzowane porównanie kierunków i zapis następnego testu;
   możliwość powrotu także przez aktywnego operatora firmy.
3. Uruchom: konkretny klient docelowy, propozycja oferty, podstawy cenowe i karta
   następnych działań. Bez generatora kompletnego biznesu i bez obietnicy wyniku.
4. Prowadź: firma, logo, ustawienia, cennik i import CSV/Excel.
5. Podstawowa kartoteka klientów i historia.
6. Wycena: tekst/głos, interpretacja, dopasowanie cennika, obliczenia, edycja,
   zatwierdzenie, PDF i możliwość przekazania klientowi.
7. Protokół po wizycie: tekst/głos, podsumowanie, korekta, PDF i historia klienta.
8. Asystent wspierający wszystkie trzy ścieżki: tekst, głos i podstawowe pytania
   o zdjęcia, ale z rezultatami prowadzącymi do właściwych kart i workflow.
9. Podstawa planu Firma: organizacje, właściciel i członkowie, wspólne dane.
   Skomplikowana macierz uprawnień i wieloetapowe akceptacje nie należą do startu.

Aktualna implementacja ma publiczne landingi, rejestrację i logowanie Supabase,
jednoosobową organizację z RLS, prywatny workspace w PostgreSQL oraz wybór typu
konta przy rejestracji i później w Ustawieniach. Kod Stripe obejmuje Checkout,
wymaganą kartę, 3-dniowy trial, portal i idempotentne webhooki. Funkcje te staną się
operacyjne po utworzeniu projektów, zastosowaniu migracji i dodaniu sekretów/cen;
repozytorium nie zawiera prawdziwych kluczy. Stary plik lokalnych rozmów został usunięty,
a runtime aplikacji już go nie czyta. Prowadź obejmuje tekst/zdjęcie/nagranie przez OpenRouter,
klientów, cennik i CSV, wyceny/protokoły z PDF, historię, ustawienia i eksport.
Brakuje zaproszeń członków, transakcyjnej księgi zwiększeń limitu, ustrukturyzowanych kart
Odkryj/Uruchom, bezpiecznego magazynu załączników, XLSX i wysyłki.
Lokalny plan Firma ma działającą listę zespołu: dodawanie, edycję, usuwanie,
stanowiska oraz deterministyczne pokazanie ceny dodatkowych miejsc. Nie tworzy to
kont pracowników ani wspólnego dostępu z innych urządzeń.
Publiczna strona ma kontakt otwierający wiadomość e-mail, regulamin testu i politykę
prywatności. Dokumenty muszą zostać uzupełnione i sprawdzone przed płatną usługą.
Nie publikować tej wersji ani nie używać jej do realnych danych klientów. Szczegóły: `MVP_SPEC.md`.

## Onboarding cennika

Nie wymagamy ręcznego wpisywania setek pozycji. Użytkownik importuje tabelę
z podglądem i zatwierdzeniem mapowania albo ustawia kilka własnych stawek:
godzinową, dojazd, minimum zlecenia, podstawowe usługi i materiały.
Niejasne ceny netto/brutto, jednostki i duplikaty wymagają wyjaśnienia.
Podstawowe stawki wystarczają do pierwszej realnej wyceny; katalog rośnie z użyciem.

## AI, dokumentacja i bezpieczeństwo

Vision na start: odczyt tekstu/tabliczki, pomoc w rozpoznaniu elementu i opis
zdjęcia z jawną niepewnością. Pełna diagnostyka to osobny, późniejszy produktowy zakres.

Późniejszy RAG: odpowiedź + źródło, dokument i fragment/strona. Biblioteka
producentów wymaga osobnego researchu licencji, praw, aktualności i odpowiedzialności.
Nie uznajemy z góry indeksowania ani za legalne, ani za niedozwolone.

Odpowiedzi o gazie, elektryce i urządzeniach mogących spowodować szkodę wymagają
szczególnej ostrożności. AI nie potwierdza pomiaru lub testu, którego fachowiec
nie podał. Brak pewności nie może być ukrywany profesjonalnym brzmieniem protokołu.

## Ekonomia

Hipotezy cenowe: Lite 49 zł/mies., Pro 99 zł/mies., Firma 299 zł/mies., dodatkowy
członek 49,99 zł/mies. Szczegóły i niewyjaśnione zasady: `PRICING.md`.
Firma sprzedaje wspólne dane i kontrolę, a nie tylko kilka tańszych kont Pro.

Typ konta i plan są niezależne. Plan określa limit i liczbę osób, a typ konta
dopasowuje sposób pracy asystenta:

- Lite 49 zł i Pro 99 zł są planami dla jednej osoby, różniącymi się głównie
  miesięcznym limitem i intensywnością korzystania;
- Firma 299 zł jest planem zespołowym z właścicielem i trzema członkami w cenie;
- kolejny członek pozostaje hipotezą cenową 49,99 zł miesięcznie.

Zmiana typu konta w Ustawieniach mieści się w abonamencie. Nie zmienia ceny, terminu odnowienia ani
planu i nie zeruje wykorzystania limitu. Zatwierdzony
kontekst, zapisane
kwoty oraz historia pozostają przypisane do właściwego konta lub organizacji.
Landing może kierować do rejestracji z wstępnie wybranym typem i planem, ale nie
może zmienić tych wartości na istniejącym koncie samym parametrem adresu.

Każdy plan ma kontrolowany limit użycia odpowiedni do kosztu i wartości planu.
Techniczne jednostki rozliczenia pozostają w tle: codzienny interfejs nie pokazuje
licznika ani słowa „kredyty”. Dopiero po wykorzystaniu limitu użytkownik otrzymuje
prostą możliwość jednorazowego zwiększenia albo zmiany planu. Materialne zasady
limitu muszą być ujawnione przed zakupem, nawet jeśli nie eksponujemy ich na Home.
Płatne zwiększenie limitu wymaga idempotentnego billingu i księgi odpornej na ponowienia.

Panel właściciela produktu pokazuje zagregowane metryki kont, triali, subskrypcji,
zużycia, kosztów i błędów bez treści rozmów na Przeglądzie. Rozmowy znajdują się
wyłącznie w profilu konkretnego użytkownika. Dostęp ma jedno konto foundera wskazane
serwerowym UUID; nie budujemy panelu zarządzania rolami administratorów. Każde otwarcie
profilu zapisuje audyt. Użytkownik musi być jasno poinformowany o kontroli jakości,
a podstawa prawna, retencja i umowy muszą zostać zatwierdzone przed płatnym startem.

Nie zmieniamy cen na podstawie samej intuicji. Mierzymy aktywację, użycie,
CAC, ARPU, koszt AI, konwersję, churn i gotowość do płacenia. Limity AI i
przypisanie kosztów do firmy muszą być częścią implementacji płatnej alfy.

## Technologia i sposób pracy

Wybrany kierunek: Next.js / React / TypeScript, Supabase/PostgreSQL, Vercel.
Codex do pracy nad kodem, GitHub jako źródło wersji. Jeden modularny projekt,
bez mikroserwisów i rozbudowanego systemu agentów na start.

Model LLM i STT są wymienne. Istotny wybór wymaga aktualnej dokumentacji, cen,
limitów, dostępności w Polsce/UE, porównania 2–3 opcji i oceny zależności od dostawcy.
W głosie mierzymy skuteczność zadania, nie tylko poprawność transkrypcji.

Kod AI podlega testom, przeglądowi, walidacji i kontroli autoryzacji tak samo jak
każdy inny kod. Realne dane klientów wymagają gotowych zabezpieczeń.

## Metryki

Time to First Value i Activation Rate w każdej ścieżce; zapisane testy w Odkryj,
wykonane kroki i przejście do rzeczywistej pracy w Uruchom; wyceny/protokoły na użytkownika;
WAU/MAU, aktywne dni, D7/D30/M3, churn, konwersja na płatność, ARPU,
koszt AI na aktywnego użytkownika i rzeczywiście zaoszczędzony czas.
Rejestracja, pochwała czy liczba funkcji nie są dowodem sukcesu.

## Parking Lot i filtr decyzji

Magazyn, księgowość, rozbudowany CRM, kalendarz ekip, GPS/trasy, rozbudowane
dashboardy, katalog wszystkich urządzeń, duży RAG, pełna diagnostyka,
wielostopniowe akceptacje ofert, pełny offline, wiele branż naraz, generyczny generator
„każdego biznesu” oraz rozbudowana automatyzacja marketingu.

Każda funkcja musi wskazać problem, odbiorcę, częstotliwość, gotowość do
płacenia, wpływ na retencję, koszt i prostszą alternatywę. Bez związku ze
sprzedażą, aktywacją, użyciem, retencją lub ARPU trafia do Parking Lot.

Lepszy podstawowy workflow wygrywa z liczbą funkcji; realny problem
z imponującą technologią; niezawodność wyceny z efektem WOW.

## Zarządzanie zmianą

Zmiana fundamentu wymaga: co zmieniamy, dlaczego, jaki kompromis, czy zmienia
MASTER_PLAN i czy trafia do DECISIONS. Nie zmieniaj zaakceptowanych ustaleń po cichu.
