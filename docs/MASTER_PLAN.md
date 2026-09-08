# SmartFach — MASTER PLAN

Stan: 2026-09-06. Ten dokument jest nadrzędnym źródłem kierunku produktu.

## Teza produktu

SmartFach pomaga jednej osobie przejść od własnych warunków i ograniczeń do
pierwszej sprzedawalnej usługi, pierwszych rozmów z klientami i regularnej pracy
nad przychodem.

Główna obietnica:

> Nie potrzebujesz idealnego pomysłu. Potrzebujesz pierwszego klienta.

Użytkownik nie musi wiedzieć, jaki biznes wybrać, mieć wyjątkowych umiejętności,
pokazywać twarzy ani pracować zdalnie. SmartFach najpierw poznaje jego czas,
budżet, doświadczenie, preferencję pracy zdalnej lub lokalnej oraz rzeczy, których
nie chce robić. Następnie zawęża wybór, rekomenduje jedną realną usługę i prowadzi
do kolejnego działania.

SmartFach nie sprzedaje kursu ani jednorazowego planu. Jest asystentem działania:
użytkownik wykonuje krok, wraca z wynikiem, a system aktualizuje ofertę, wiadomości
i dalsze działania.

## Dla kogo zaczynamy

Pierwszy segment to osoby w Polsce, które chcą zbudować dodatkowy lub główny
przychód z prostej usługi:

- są zatrudnione, uczą się albo zaczynają od zera;
- mają ograniczony czas i budżet;
- nie wiedzą, co mogą sprzedać, albo mają pomysł, którego nie umieją uruchomić;
- preferują pracę zdalną, lokalną lub są otwarte na oba warianty;
- potrzebują konkretnego następnego kroku, nie kolejnej biblioteki wiedzy.

Na starcie preferujemy biznes usługowy. Jest szybszy i tańszy do zweryfikowania
niż sklep, aplikacja, marka konsumencka czy „dochód pasywny”. SmartFach może
rekomendować m.in. proste usługi cyfrowe, pomoc operacyjną, obsługę małych firm,
usługi lokalne i wykorzystanie AI do wykonania konkretnej pracy.

Nie rekomendujemy hazardu, tradingu jako planu zarobku, MLM, udawanej automatyzacji,
fikcyjnego doświadczenia ani usług wymagających uprawnień, których użytkownik nie ma.

## Pierwsza wartość

Pierwsze uruchomienie ma doprowadzić do wartości w jednej krótkiej sesji:

1. Użytkownik wskazuje: zdalnie/lokalnie, swoją sytuację i główne ograniczenie.
2. Asystent zadaje najwyżej trzy brakujące pytania.
3. Pokazuje najwyżej trzy realne kierunki i rekomenduje jeden.
4. Pomaga zbudować prostą, testowalną ofertę.
5. Kończy jednym zadaniem możliwym do wykonania dzisiaj.

Docelowy moment „wow” brzmi: „Nie wiedziałem, od czego zacząć, a teraz wiem,
co sprzedaję, komu i co mam zrobić dzisiaj”.

## Wartość abonamentu

Retencja nie może opierać się na jednorazowym wygenerowaniu planu. Pętla produktu:

**ustal krok → wykonaj → wróć z wynikiem → popraw ofertę lub sposób dotarcia →
wykonaj następny krok**.

SmartFach z czasem pamięta zatwierdzone informacje o użytkowniku, jego ofercie,
próbach sprzedaży i wynikach. Pomaga m.in.:

- wybrać i zawęzić usługę;
- opisać ofertę i ustalić cenę jako hipotezę do testu;
- znaleźć sposób dotarcia do pierwszych klientów;
- przygotować wiadomości, odpowiedzi i treści sprzedażowe;
- zaplanować tydzień przy ograniczonym czasie;
- analizować odpowiedzi rynku i poprawiać kolejne działania;
- przeliczać cel przychodowy na cenę, liczbę klientów i aktywności.

Cel 10 000 zł miesięcznego przychodu może być używany jako aspiracyjny punkt
odniesienia. Nie jest gwarancją produktu ani obietnicą terminu.

## Pozycjonowanie i komunikacja

Komunikujemy rezultat i dopasowanie do realnego życia:

- „Zbuduj usługę dopasowaną do Twoich warunków.”
- „Zdalnie albo lokalnie. Z doświadczeniem albo od zera.”
- „Nie chcesz dzwonić ani pokazywać twarzy? Uwzględnimy to.”
- „Od pierwszej oferty do pierwszych klientów — krok po kroku.”

Nie używamy obietnic gwarantowanego wyniku, „łatwych pieniędzy”, sztucznej presji,
fałszywych opinii ani sugerowania, że samo wykupienie abonamentu tworzy dochód.
Agresywna sprzedaż ma wynikać z konkretnej wartości i dobrego demo, nie z oszustwa.

## Produkt i UX

Publicznie istnieje jeden produkt i jedna ścieżka. Nie pokazujemy użytkownikowi
typów Odkryj/Uruchom/Prowadź ani segmentu Firma. Rejestracja wymaga wyłącznie wyboru
Lite lub Pro. Nowe konta zaczynają w kontekście budowania własnego przychodu.

Głównym miejscem pracy jest jeden asystent przyjmujący tekst i zdjęcia.
Tylko pierwsze uruchomienie pokazuje krótki profil z odpowiedziami wielokrotnego
wyboru i polem dodatkowych informacji. Zatwierdzenie zapisuje profil na koncie,
uruchamia rekomendację i pierwsze działanie bez kopiowania promptu do pola rozmowy.
Każda kolejna nowa rozmowa zaczyna się od wyboru aktualnego zadania: klienci, oferta,
plan działań, analiza wyniku albo własne pytanie. Ustawienia służą do późniejszej
edycji zapisanego profilu: stylu pracy, czasu, doświadczenia, ograniczeń, celu i fokusu.

Historyczne schematy workflow firm terenowych pozostają czasowo w modelu workspace,
aby nie usuwać danych. Nie mają wejścia w głównej aplikacji, rejestracji ani
płatnościach. Ich dalszy rozwój trafia do Parking Lot do czasu potwierdzenia nowej
tezy produktu.

## Ceny

- Lite: 49 zł miesięcznie;
- Pro: 99 zł miesięcznie;
- 3 pełne dni próby, karta wymagana, potem automatyczne miesięczne odnowienie;
- użytkownik może anulować przed pierwszym obciążeniem.

Plan Firma i dodatkowe miejsca zostały usunięte z bieżącego runtime oraz nowego
lejka. Ewentualne starsze rekordy są podczas migracji normalizowane do Pro.
Po wykorzystaniu limitu można zaproponować zwiększenie użycia lub zmianę planu;
codzienny interfejs nie używa słowa „kredyty”. Materialne zasady limitu muszą być
jasne przed płatnością.

## Technologia i zasady AI

OpenRouter pozostaje bramką modeli. Wersjonowany routing kieruje zwykłe pytania do
GPT-5.6 Luna, ważny start, zdjęcia i trudniejsze analizy do GPT-5.6 Terra, a stały
Gemini 3.5 Flash pozostaje awaryjnym fallbackiem innego dostawcy. Użytkownik nie widzi
tego podziału. AI rozumie sytuację, prowadzi rozmowę i tworzy szkice.
Kod odpowiada za autoryzację, zapis, billing, limity, obliczenia i operacje mogące
zmienić dane.

Nie budujemy rozbudowanego systemu agentowego. Najpierw mierzymy jakość ukończonego
zadania, czas do wartości, koszt jednej skutecznej sesji i wynik kolejnego działania.

## Metryki

Najważniejsze zdarzenia lejka:

- landing → rozpoczęcie rejestracji;
- rozpoczęcie → ukończenie Checkout;
- potwierdzenie konta i wejście do aplikacji;
- ukończenie krótkiego profilu startowego;
- czas do pierwszej rekomendowanej usługi;
- czas do pierwszej gotowej oferty;
- wykonanie pierwszego działania sprzedażowego;
- otrzymanie pierwszej odpowiedzi i pierwsza sprzedaż — deklarowane przez użytkownika;
- aktywność D7/D30, trial → paid, churn, zwroty i chargebacki;
- koszt AI na aktywnego i płacącego użytkownika.

Rejestracje i liczba wiadomości nie wystarczają do uznania produktu za dobry.

## Walidacja

Przed dalszym rozbudowywaniem funkcji pozyskujemy realnych użytkowników na obecny
produkt. Najpierw testujemy 3–5 kreacji i jeden spójny landing. Rozmawiamy z osobami,
które ukończyły onboarding, porzuciły Checkout i anulowały próbę. Po 30–50 płatnych
próbach podejmujemy decyzję na podstawie aktywacji, działań i retencji.

## Parking Lot

Plan Firma, konta pracowników, system dla HVAC, wyceny terenowe, protokoły,
magazyn, rozbudowany CRM, księgowość, kalendarz, GPS, duży RAG, pełna diagnostyka,
marketplace usług, gotowe leady i automatyczne wykonywanie pracy za użytkownika.

## Świadomy kompromis strategiczny

Nowy kierunek upraszcza produkt i marketing, ale traci część branżowego „moatu”
SmartFach i wchodzi w bezpośrednią konkurencję z generycznym AI, kursami i mentorami.
Dlatego jego przewagą musi być pamięć postępu, struktura działania, dopasowanie do
ograniczeń oraz mierzalne prowadzenie do kontaktu z rynkiem. Jeśli dane nie pokażą
wyraźnej aktywacji i retencji, wracamy do węższego workflow branżowego zamiast
rozbudowywać generycznego coacha.
