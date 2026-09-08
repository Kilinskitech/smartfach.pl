# SmartFach — reguły UX

Stan: 2026-09-06.

- Jedna publiczna obietnica, jedna główna ścieżka i dwa plany. Bez wyboru branży,
  typu firmy ani etapu „Odkryj/Uruchom/Prowadź”.
- Landing najpierw wyjaśnia rezultat, potem sposób działania i dopiero cenę.
- Hero ma mówić o pierwszym kliencie, nie o samym „znalezieniu pomysłu”.
- Cel 10 000 zł pokazujemy jako liczbę do przeliczenia, nie gwarancję i nie termin.
- Wprost uwzględniamy: zdalnie/lokalnie, brak sprecyzowanych umiejętności, mało
  czasu, mały budżet oraz rzeczy, których użytkownik nie chce robić.
- Nie używamy „łatwe pieniądze”, „dochód pasywny”, sztucznej pilności, fikcyjnych
  opinii ani nieudowodnionych twierdzeń o skuteczności.
- Główne CTA brzmi jak rozpoczęcie pracy nad ofertą, nie zakup kursu.
- Pierwszy ekran aplikacji ma trzy krótkie grupy wyboru i jeden przycisk. Nie jest
  pustym czatem ani wielostronicowym formularzem.
- Asystent zadaje najwyżej trzy pytania naraz, pokazuje najwyżej trzy kierunki,
  rekomenduje jeden i kończy jednym działaniem.
- Tekst i zdjęcie prowadzą do tego samego asystenta. Głos pozostaje poza obecnym MVP.
- Odpowiedzi są krótkie, skanowalne i zorientowane na decyzję. Bez powitania typu
  „Oczywiście, chętnie pomogę” przed właściwą wartością.
- Odpowiedzi asystenta wyświetlamy jako bezpieczny Markdown: osobne akapity,
  listy i krótkie nagłówki, z gotową ofertą/wiadomością w cytacie. Kolumna tekstu
  ma maksymalnie 72ch. Proste pytanie nie wymaga nagłówków. Surowy HTML i obrazy
  wygenerowane w tekście są niedozwolone; wiadomości użytkownika pozostają tekstem.
- Na telefonie cele dotykowe mają co najmniej 48 × 48 CSS px, widoczny fokus i
  jednoznaczne etykiety. Najważniejsza akcja jest w zasięgu kciuka.
- Historia rozmów jest w panelu bocznym, a na telefonie otwierana z nagłówka.
- Pierwszy profil wypełnia się raz. Kolejna nowa rozmowa pokazuje zadania: klienci,
  oferta, plan, analiza wyniku lub własne pytanie — bez powtarzania onboardingu.
- Ustawienia opisujemy jako „Twój profil działania” i służą do edycji stałego
  kontekstu: czasu, doświadczenia, ograniczeń, celu i aktualnego fokusu. Nie
  powtarzamy tam preferencji zdalnie/lokalnie zbieranej przy rozpoczęciu pracy ani
  nie pokazujemy technicznych trybów konta.
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
