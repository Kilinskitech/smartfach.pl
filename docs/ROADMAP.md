# SmartFach — roadmapa

Stan: 2026-09-07.

## Teraz — Preview

- Jeden landing pod pierwszą sprzedawalną usługę i klienta.
- Plany Lite/Pro, uproszczona rejestracja i Stripe Sandbox.
- Profil startowy z preferencjami i ograniczeniami.
- Jeden asystent z tekstem, zdjęciami i historią.
- GPT-5 Nano jako model główny oraz Gemini Flash Latest jako automatyczny fallback.
- Zaktualizowane instrukcje AI oraz trwałe ustawienia użytkownika.
- Panel administratora, koszt OpenRouter, statusy kont i płatności.
- Procent wykorzystania i jednorazowe zwiększenie limitu przez Stripe.
- Testy statyczne, automatyczne i pełny przebieg na stałym Preview.

## Następny eksperyment

1. Sprawdzić rejestrację, trial, aktywację, anulowanie i ponowne logowanie.
2. Przetestować 10–20 realnych scenariuszy użytkowników o różnych ograniczeniach.
3. Uruchomić 3–5 kreacji reklamowych prowadzących do jednego landingu.
4. Mierzyć profil → rekomendacja → oferta → wykonane działanie → powrót z wynikiem.
5. Przeprowadzić rozmowy z osobami, które kupiły, porzuciły Checkout i anulowały.
6. Po 30–50 płatnych próbach zdecydować: zawężać segment, rozwijać czy wrócić do
   mocniejszego workflow branżowego.

## Kolejność wykonania

### Tydzień 1 — mierzalny produkt

- zakończyć test Preview: konto, Checkout, trial, rozmowa, zapis, portal i usunięcie;
- wdrożyć zdarzenia lejka od wejścia na landing do powrotu z wynikiem działania;
- dodać jedną trwałą kartę „Usługa / oferta / następny test”, bez kolejnych modułów;
- przygotować 15 scenariuszy jakości AI i mierzyć ukończenie zadania oraz koszt.
- potwierdzić w logach scenariusz błędu modelu głównego i użycia fallbacku.

### Tydzień 2 — test ręczny

- pozyskać 10 osób pasujących do segmentu bez płatnego skalowania;
- obserwować pierwszą sesję i skontaktować się po 24 godzinach;
- poprawić wyłącznie bariery blokujące rekomendację, ofertę lub pierwsze działanie;
- zebrać prawdziwe słowa użytkowników do reklam i FAQ, bez fikcyjnych opinii.

### Tydzień 3–4 — mały test reklam

- uruchomić jeden landing i 3–5 kreacji z różnymi problemami wejściowymi;
- ograniczyć pierwszy budżet do kwoty, której wynik pozwala zakończyć eksperyment;
- nie skalować na podstawie kliknięć: oceniać Checkout, aktywację, działanie i D7;
- zwiększać budżet dopiero po osiągnięciu z góry ustalonych progów jakości.

### Dni 31–90 — decyzja, nie katalog funkcji

- zawęzić komunikację do najlepiej aktywującego segmentu i przypadku użycia;
- poprawić onboarding oraz pętlę „działanie → wynik → następny krok”;
- policzyć CAC, koszt AI, trial → paid, D30 i zwroty;
- po 30–50 pełnych prób podjąć decyzję: skalowanie, pivot do węższej niszy albo stop.

## Dopiero po sygnale popytu

- trwałe karty: rekomendowana usługa, oferta, eksperyment i wynik;
- tygodniowy rytm działań i widoczny postęp;
- szablony wiadomości dopasowane do wybranego kanału;
- lepsza pamięć zatwierdzonych założeń, bez wysyłania całej historii do modelu;
- analityka lejka od reklamy do pierwszego działania i powrotu.

## Bramka Live

- osobne Supabase i Stripe dla Preview i Live;
- produkcyjny SMTP, webhooki, monitoring, backup i odtworzenie;
- fizyczne testy telefonu i przeglądarki Facebooka;
- prawny przegląd regulaminu, prywatności, reklam i dostępu administracyjnego;
- potwierdzona ekonomia trialu oraz limitów;
- test zakupu każdego zwiększenia i odnowienia miesięcznego limitu;
- brak błędów krytycznych w izolacji kont, płatnościach i usuwaniu danych.

## Parking Lot

Plan Firma, pracownicy, HVAC, klienci firmy, cennik, wyceny, protokoły, CRM,
magazyn, księgowość, kalendarz, GPS, duży RAG, marketplace, gotowe leady i
rozbudowana automatyzacja wieloagentowa.
