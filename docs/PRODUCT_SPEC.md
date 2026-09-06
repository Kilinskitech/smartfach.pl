# SmartFach — podstawowe przebiegi produktu

Stan: 2026-09-06.

## Jeden publiczny produkt

Użytkownik nie wybiera etapu biznesu ani branży. Wybiera Lite lub Pro, a SmartFach
poznaje jego sytuację w aplikacji. Stare typy kont pozostają wyłącznie warstwą
kompatybilności danych.

## Profil startowy

Pierwszy ekran pyta o trzy rzeczy:

1. Preferencja: zdalnie, lokalnie lub bez znaczenia.
2. Sytuacja: brak pomysłu, posiadane umiejętności albo istniejący pomysł.
3. Główne ograniczenie: np. telefon, kamera, duży wydatek albo brak pewności.

Kliknięcie „Ułóż mój pierwszy krok” zamienia wybory w wiadomość do asystenta.
Asystent może zadać najwyżej trzy dodatkowe pytania.

## Profil trwały

W Ustawieniach użytkownik zapisuje styl pracy, czas tygodniowo, doświadczenie,
ograniczenia, cel przychodowy i bieżący fokus. Pola można zmienić bez zmiany planu,
historii ani terminu odnowienia.

## Rozmowa prowadząca do działania

Odpowiedź ma tę kolejność:

- krótkie zrozumienie sytuacji;
- maksymalnie trzy realne możliwości;
- jedna rekomendacja z powodem i ryzykiem;
- informacja, czego trzeba się nauczyć lub sprawdzić;
- jedno działanie możliwe do wykonania dziś.

Następna rozmowa zaczyna się od wyniku działania. SmartFach aktualizuje założenia,
zamiast generować od początku nowy „plan biznesowy”.

## Oferta

Minimalna oferta zawiera: odbiorcę, problem, rezultat, zakres, czego nie obejmuje,
cenę testową albo sposób jej ustalenia, dowód/portfolio do zdobycia i jedno CTA.
Cena jest hipotezą do sprawdzenia, nie zapewnieniem popytu.

## Pozyskanie pierwszych klientów

SmartFach dopasowuje kanał do użytkownika. Jeżeli użytkownik nie chce dzwonić,
proponuje np. wiadomości, platformy, lokalne grupy lub partnerstwa. Jeżeli nie chce
pokazywać twarzy, nie uzależnia planu od rolek z marką osobistą. Rekomendacja musi
zawierać konkretną liczbę działań i termin powrotu z wynikiem.

## Narzędzia i autonomia

AI może rozumieć wiadomości, zdjęcia i nagrania, prowadzić research oraz tworzyć
szkice. Bez świadomego potwierdzenia nie wysyła wiadomości, nie publikuje treści,
nie kupuje reklam, nie zmienia płatności i nie usuwa danych.

## Limity

Plan określa miesięczny zakres użycia. Zwykły ekran nie pokazuje technicznych
„kredytów”. Po wykorzystaniu limitu użytkownik widzi możliwość zwiększenia użycia
lub przejścia na wyższy plan. Retry tego samego żądania nie może zużyć limitu drugi raz.

## Administrator

Jedno chronione konto administratora widzi użytkowników, statusy triali i
subskrypcji, zużycie, koszt oraz rozmowy przypisane do konkretnego użytkownika.
Dostęp do treści służy kontroli jakości, jest audytowany, ograniczony i musi być
opisany użytkownikowi. Administrator może bezpiecznie anulować subskrypcję lub
usunąć konto wraz z koordynacją Stripe i Supabase.
