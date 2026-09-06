# SmartFach — zakres MVP

Stan: 2026-09-06. Ten dokument opisuje najbliższy testowalny produkt.

## Obietnica MVP

SmartFach poznaje warunki użytkownika, pomaga wybrać prostą usługę, zbudować
ofertę i wykonać kolejne działania prowadzące do pierwszych klientów.

## W zakresie

1. Publiczny landing z jednym kierunkiem i planami Lite/Pro.
2. Rejestracja, 3-dniowa próba z kartą, logowanie i zarządzanie abonamentem.
3. Krótki profil startowy: zdalnie/lokalnie, sytuacja, ograniczenie.
4. Ustawienia: czas tygodniowo, doświadczenie, ograniczenia, cel i bieżący fokus.
5. Jeden asystent z tekstem, zdjęciem i nagraniem.
6. Odpowiedź ograniczona do konkretnych opcji, rekomendacji i następnego kroku.
7. Historia rozmów oraz zapis zatwierdzonego profilu.
8. Kontrola wykorzystania, kosztu OpenRouter i limitu planu.
9. Panel jednego administratora z metrykami klientów, płatności i kosztów.
10. Kontakt, regulamin, polityka prywatności, SEO i wyłączenie indeksowania Preview.

## Pierwszy przebieg

Landing → wybór Lite/Pro → konto → Stripe Checkout → potwierdzenie adresu →
profil startowy → do trzech pytań → do trzech kierunków → jedna rekomendacja →
pierwsza oferta → jedno działanie do wykonania dzisiaj.

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
