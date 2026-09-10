# SmartFach — zakres MVP

Stan: 2026-09-10. Ten dokument opisuje najbliższy testowalny produkt.

## Obietnica MVP

SmartFach pomaga budować biznes od zera osobie z pomysłem lub bez pomysłu.
Wykorzystuje jej wiedzę, umiejętności, doświadczenie, wskazane przez nią kontakty
i warunki, aby wybrać realny kierunek, zbudować pierwsze źródło przychodu i
prowadzić przez kolejne działania w stronę większej wolności finansowej.

## W zakresie

1. Publiczny landing z jednym kierunkiem i planami Lite/Pro.
2. Rejestracja, 3-dniowa próba z kartą, logowanie i zarządzanie abonamentem.
3. Ankieta osobnego biznesu na początku każdego czatu albo zwykłe pytanie bez ankiety.
4. Ustawienia: jedno ogólne pole „Napisz coś o sobie”, bez celu konkretnego biznesu.
5. Jeden asystent z tekstem i zdjęciami.
6. Odpowiedź ograniczona do konkretnych opcji, rekomendacji i następnego kroku.
7. Historia i usuwanie rozmów; odrębny kontekst biznesu przy każdym czacie.
8. Kontrola wykorzystania, kosztu OpenRouter i limitu planu.
9. Panel jednego administratora z metrykami klientów, płatności i kosztów.
10. Kontakt, regulamin, polityka prywatności, SEO i wyłączenie indeksowania Preview.
11. Instalacja PWA na telefonie; publiczny ekran braku sieci, bez offline AI.
12. Kopie warunków zakupu, e-mail potwierdzenia umowy i formularz odstąpienia.
    Dane sprzedawcy i obsługa zgłoszeń w panelu właściciela. Konfiguracja i bramki
    sprzedaży: `LAUNCH_CHECKLIST.md`.

## Pierwszy przebieg

Landing → wybór Lite/Pro → konto → Stripe Checkout → potwierdzenie adresu →
ankieta pierwszego biznesu albo zwykłe pytanie → do trzech pytań → do trzech
kierunków → jedna rekomendacja → pierwsza oferta → jedno działanie do wykonania dzisiaj.

Każda nowa rozmowa umożliwia rozpoczęcie innego biznesu przez ankietę lub zadanie
pytania bez ankiety. Nie aktualizuje wspólnego profilu i nie dziedziczy innego biznesu.

## Kryterium jakości odpowiedzi

Asystent:

- uwzględnia pracę zdalną/lokalną, czas, budżet, umiejętności i rzeczy niechciane;
- nie zatrzymuje się na stwierdzeniu „brak umiejętności”;
- nie podaje długiej listy przypadkowych pomysłów;
- nie wymaga telefonu, kamery, marki osobistej ani inwestycji bez powodu;
- jawnie wskazuje potrzebną naukę i ograniczenia;
- nie obiecuje wyniku finansowego;
- kończy jednym możliwym do sprawdzenia działaniem.

## Nie w zakresie obecnego MVP

- publiczny plan Firma i konta pracowników;
- kompleksowy CRM, wyceny i protokoły jako obietnica marketingowa;
- gotowe leady albo gwarancja klientów;
- wykonywanie telefonów, wysyłanie wiadomości i wydawanie pieniędzy bez zgody;
- kurs wideo, społeczność, marketplace i rozbudowany system agentowy;
- księgowość, inwestycje, porady prawne i regulowane usługi zawodowe;
- „dochód pasywny”, trading, MLM i automatyczny biznes bez pracy.

Historyczne pola modułów firmowych pozostają czasowo w danych dla kompatybilności,
ale główna aplikacja nie pokazuje ich nowym ani obecnym kontom.

## Bramka przed ruchem płatnym

- pełny test rejestracja → Checkout → aktywacja → aplikacja → anulowanie;
- serwer blokuje aplikację, workspace i AI do czasu potwierdzenia e-maila oraz
  aktywnego trialu/subskrypcji z podpiętą metodą płatności;
- polskie wiadomości e-mail i sprawdzony SMTP;
- jasna cena, data pierwszej opłaty i sposób anulowania;
- izolacja kont, RLS, autoryzacja administratora i audyt dostępu;
- monitoring błędów, webhooków i kosztów AI;
- fizyczny test iOS/Android, także w przeglądarce Facebooka;
- eksport i usunięcie danych oraz zatwierdzona retencja rozmów;
- prawny przegląd regulaminu, prywatności i komunikatów reklamowych;
- rozdzielenie Preview i Live przed prawdziwymi danymi lub Stripe Live.

## Kryteria decyzji po pierwszym teście

Nie rozwijamy kolejnych funkcji tylko dlatego, że są łatwe do zbudowania. Dalsza
inwestycja wymaga sygnału, że użytkownicy kończą profil, tworzą ofertę, wykonują
działanie sprzedażowe i wracają z jego wynikiem. Jeśli otrzymują tylko „fajny plan”
i nie wracają, hipoteza abonamentu jest odrzucona lub wymaga węższego segmentu.
