# Roadmapa

Stan: 2026-09-04. Kod integracji jest przygotowany; płatna alfa wymaga konfiguracji
usług i przejścia bramek bezpieczeństwa, jakości oraz prawa.

## Zrealizowane

- Nowoczesne landingi dla trzech sytuacji użytkownika i jedna linia planów
  Lite 49 zł, Pro 99 zł, Firma 299 zł.
- Jeden typ konta: Odkryj, Uruchom albo Prowadź. Wybór przy rejestracji, zmiana
  wyłącznie w Ustawieniach, bez zmiany abonamentu i bez sterowania parametrem URL.
- Chat-first: tekst, zdjęcie i nagranie, rozmowy w lewym panelu, krótkie akcje,
  pamięć klientów, szkice wycen i protokołów.
- Klienci, cennik/CSV, wyceny z deterministycznym obliczeniem, protokoły, historia,
  PDF i lista zespołu bez fikcyjnych loginów.
- Supabase Auth, profil, organizacja, członkostwo, prywatny workspace JSONB, RLS,
  kontrola rewizji i migracja tworząca puste konto bez przykładowych danych.
- Stripe Checkout z kartą i 3-dniową próbą, Customer Portal, synchronizacja planu
  oraz idempotentne webhooki.
- Panel jednego administratora: prawdziwe konta, triale, aktywne subskrypcje,
  podpięcie metody płatności i koszt OpenRouter. Rozmowy są dopiero w profilu
  użytkownika; otwarcie zapisuje audyt.
- Stary lokalny profil, rozmowy i plik danych zostały usunięte z runtime.

## Następny krok — uruchomienie środowiska testowego

1. Utworzyć projekt Supabase w regionie UE i zastosować migrację.
2. Utworzyć produkty oraz miesięczne ceny Stripe w trybie testowym.
3. Uzupełnić sekrety Preview w Vercelu, skonfigurować adresy Auth i webhook Stripe.
4. Założyć zwykłe konto przez formularz, ustawić jego UUID jako jedynego admina.
5. Przejść pełny scenariusz: rejestracja → karta testowa → trial → aplikacja →
   anulowanie/zmiana planu → webhook → panel.
6. Uruchomić negatywny test dwóch organizacji i sprawdzić brak dostępu krzyżowego.

Instrukcja: `docs/SETUP_SUPABASE_STRIPE.md`.

## Bramka przed pierwszym realnym użytkownikiem

- Backup Supabase i sprawdzona próba odtworzenia.
- Retencja danych, eksport/usunięcie konta i kontrola załączników.
- MFA lub równoważna ochrona konta administratora oraz przegląd audytów.
- Monitoring błędów webhooków, płatności i kosztu AI; limity wydatków dostawcy.
- Produkcyjna konfiguracja e-maili oraz przypomnienie przed pierwszą opłatą.
- Testy fizycznego telefonu: Facebook browser, mikrofon, zdjęcie, PDF, słaby zasięg.
- Przegląd regulaminu, prywatności, VAT/cen brutto-netto i dokumentów sprzedaży.
- Informacja przed rejestracją o analizie pełnej treści rozmów przez właściciela.

## Następnie

- Transakcyjna księga użycia i jednorazowe zwiększenia limitu; dopiero wtedy realny
  przycisk zakupu dodatkowego limitu.
- Zaproszenia członków, osobne loginy i uprawnienia planu Firma.
- Trwałe karty wyników Odkryj i Uruchom oraz świadome przekazywanie zatwierdzonych
  danych do kontekstu firmy.
- Storage załączników, import XLSX i kontrolowana wysyłka dokumentów.
- Ewaluacja modeli na realnych zadaniach i koszt jednego ukończonego zadania.

## Parking Lot

Magazyn, księgowość, rozbudowany CRM i kalendarz, GPS, duży RAG, katalog wszystkich
urządzeń, pełna diagnostyka, wiele branż naraz i generyczny generator biznesu.
