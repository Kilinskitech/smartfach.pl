# SmartFach — roadmapa

Stan: 2026-09-06.

## Teraz — Preview

- Jeden landing pod pierwszą sprzedawalną usługę i klienta.
- Plany Lite/Pro, uproszczona rejestracja i Stripe Sandbox.
- Profil startowy z preferencjami i ograniczeniami.
- Jeden asystent z tekstem, zdjęciem, nagraniem i historią.
- Zaktualizowane instrukcje AI oraz trwałe ustawienia użytkownika.
- Panel administratora, koszt OpenRouter, statusy kont i płatności.
- Testy statyczne, automatyczne i pełny przebieg na stałym Preview.

## Następny eksperyment

1. Sprawdzić rejestrację, trial, aktywację, anulowanie i ponowne logowanie.
2. Przetestować 10–20 realnych scenariuszy użytkowników o różnych ograniczeniach.
3. Uruchomić 3–5 kreacji reklamowych prowadzących do jednego landingu.
4. Mierzyć profil → rekomendacja → oferta → wykonane działanie → powrót z wynikiem.
5. Przeprowadzić rozmowy z osobami, które kupiły, porzuciły Checkout i anulowały.
6. Po 30–50 płatnych próbach zdecydować: zawężać segment, rozwijać czy wrócić do
   mocniejszego workflow branżowego.

## Dopiero po sygnale popytu

- trwałe karty: rekomendowana usługa, oferta, eksperyment i wynik;
- tygodniowy rytm działań i widoczny postęp;
- szablony wiadomości dopasowane do wybranego kanału;
- lepsza pamięć zatwierdzonych założeń, bez wysyłania całej historii do modelu;
- transakcyjna księga limitów i prawdziwe zwiększenie użycia;
- analityka lejka od reklamy do pierwszego działania i powrotu.

## Bramka Live

- osobne Supabase i Stripe dla Preview i Live;
- produkcyjny SMTP, webhooki, monitoring, backup i odtworzenie;
- fizyczne testy telefonu i przeglądarki Facebooka;
- prawny przegląd regulaminu, prywatności, reklam i dostępu administracyjnego;
- potwierdzona ekonomia trialu oraz limitów;
- brak błędów krytycznych w izolacji kont, płatnościach i usuwaniu danych.

## Parking Lot

Plan Firma, pracownicy, HVAC, klienci firmy, cennik, wyceny, protokoły, CRM,
magazyn, księgowość, kalendarz, GPS, duży RAG, marketplace, gotowe leady i
rozbudowana automatyzacja wieloagentowa.
