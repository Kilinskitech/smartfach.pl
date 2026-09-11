# SmartFach — reguły UX

Stan: 2026-09-09.

- Jedna publiczna obietnica, jedna główna ścieżka i dwa plany. Bez wyboru branży,
  typu firmy ani etapu „Odkryj/Uruchom/Prowadź”.
- Landing najpierw wyjaśnia rezultat, potem sposób działania i dopiero cenę.
- Hero ma mówić o pierwszym kliencie, nie o samym „znalezieniu pomysłu”.
- Kolejne sekcje rozwijają motyw „nie zaczynasz od zera” przez umiejętności,
  doświadczenie, zainteresowania, kontakty, czas i ograniczenia użytkownika.
- Przykładowe drogi i ekrany muszą mieć widoczne oznaczenie scenariusza fikcyjnego;
  nie stylizujemy ich na opinię, historię klienta ani wynik osiągnięty z produktem.
- Cel 10 000 zł pokazujemy jako liczbę do przeliczenia, nie gwarancję i nie termin.
- Wprost uwzględniamy: zdalnie/lokalnie, brak sprecyzowanych umiejętności, mało
  czasu, mały budżet oraz rzeczy, których użytkownik nie chce robić.
- Nie używamy „łatwe pieniądze”, „dochód pasywny”, sztucznej pilności, fikcyjnych
  opinii ani nieudowodnionych twierdzeń o skuteczności.
- Główne CTA brzmi jak rozpoczęcie pracy nad ofertą, nie zakup kursu.
- Każdy nowy czat zaczyna krótka ankieta osobnego biznesu. Alternatywa „Chcę tylko
  zadać pytanie” jest pokazana raz, obok głównej akcji pod ankietą.
- Asystent zadaje najwyżej trzy pytania naraz, pokazuje najwyżej trzy kierunki,
  rekomenduje jeden i kończy jednym działaniem.
- Tekst i zdjęcie prowadzą do tego samego asystenta. Głos pozostaje poza obecnym MVP.
- Odpowiedzi są krótkie, skanowalne i zorientowane na decyzję. Bez powitania typu
  „Oczywiście, chętnie pomogę” ani przedstawiania się jako SmartFach przed właściwą
  wartością. Nazwa asystenta pojawia się w odpowiedzi tylko na pytanie o jego tożsamość.
- Odpowiedzi asystenta wyświetlamy jako bezpieczny Markdown: osobne akapity,
  listy i krótkie nagłówki, z gotową ofertą/wiadomością w cytacie. Kolumna tekstu
  ma maksymalnie 72ch. Proste pytanie nie wymaga nagłówków. Surowy HTML i obrazy
  wygenerowane w tekście są niedozwolone; wiadomości użytkownika pozostają tekstem.
  Ten sam bezpieczny renderer stosujemy do odpowiedzi widocznych administratorowi.
- Na telefonie cele dotykowe mają co najmniej 48 × 48 CSS px, widoczny fokus i
  jednoznaczne etykiety. Najważniejsza akcja jest w zasięgu kciuka. Treść rozmowy
  i pola tekstowe mają co najmniej 16 px, a etykiety oraz opcje ankiety nie mogą
  wymagać przybliżania ekranu.
- Historia rozmów jest w panelu bocznym, a na telefonie otwierana z nagłówka.
- Kontekst biznesu należy wyłącznie do danego czatu. Ustawienia zawierają jedno
  ogólne pole „Napisz coś o sobie”; nie kopiujemy do niego ankiety biznesu.
- Plan Lite/Pro można przełączyć w widoku rejestracji bez przeładowania.
- Trial pokazuje 0 zł dzisiaj, datę pierwszej opłaty, cenę po próbie i anulowanie.
- Nazwa modelu, OpenRouter, tokeny i „kredyty” nie są częścią interfejsu klienta.
- Po wykorzystaniu limitu komunikujemy „zwiększ miesięczny zakres” lub zmianę planu.
- Animacje podkreślają kolejność i szybkość. `prefers-reduced-motion` wyłącza ruch.
- Instalacja PWA używa natywnego okna przeglądarki jednym kliknięciem, gdy jest
  dostępne. Na iOS i w przeglądarkach wewnątrz social mediów pokazujemy krótką,
  dopasowaną do urządzenia instrukcję; nie obiecujemy niemożliwej automatycznej instalacji.
- Nie dodajemy fikcyjnych statystyk, klientów, zarobków ani powiadomień dla wyglądu.
- Błąd nie może usuwać wiadomości ani udawać zapisu. Użytkownik dostaje ponowienie.
- Każda operacja zewnętrzna lub nieodwracalna wymaga świadomego potwierdzenia.

Kierunek wizualny pozostaje: granat marki, ciepła biel, pomarańcz dla głównych akcji,
duża typografia i spokojne karty. Wygląd ma budować wiarygodność narzędzia do pracy,
nie estetykę „internetowego guru”.
