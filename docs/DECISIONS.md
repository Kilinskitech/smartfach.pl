# Rejestr decyzji

Data zapisania ustaleń: 2026-08-30. Nie sugeruje wcześniejszej daty ich podjęcia.

## D001 — MVP HVAC i kontrolowane workflow

- Status: fundament wskazany przez foundera.
- Decyzja: HVAC jako pierwsza branża; wycena, protokół, klienci/cennik i otwarty asystent.
- Powód: krótka droga do wartości, mały zespół, możliwość regularnego użycia.
- Odrzucono: równoległy CRM/ERP/magazyn/GPS/duży RAG i wiele branż.

## D002 — LLM interpretuje, kod rozstrzyga biznes

- Status: fundament wskazany przez foundera.
- Decyzja: ceny i obliczenia z kodu i zatwierdzonych danych, nie z wygenerowanego tekstu.
- Powód: niezawodność wyceny, audyt i kontrola firmy.
- Odrzucono: swobodne generowanie kompletnych cen/sum oraz autonomiczne wysyłanie ofert.

## D003 — Dystrybucja przez stronę, PWA

- Status: kierunek wskazany przez foundera; PWA zaproponowane jako realizacja.
- Decyzja: wspólna aplikacja webowa, instalacja opcjonalna, bez sklepów na start.
- Powód: jeden produkt, szybkie iteracje i wejście z reklamy.
- Kompromis: instalacja i zachowanie w tle różnią się między przeglądarkami;
  pełny offline jest poza pierwszym zakresem.
- Odrzucono na start: osobne aplikacje natywne i wymuszona instalacja przed użyciem.

## D004 — Kierunek technologiczny i miejsce pracy

- Status: rekomendacja przyjęta jako kierunek dalszego przygotowania repozytorium.
- Decyzja: Next.js/React/TypeScript, Supabase/PostgreSQL, Vercel; praca w obecnym
  środowisku, kod w osobnym podkatalogu `smartfach`, GitHub jako repozytorium.
- Powód: spójny projekt dla jednego foundera, mniejsza liczba elementów do utrzymania.
- Rozważone alternatywy: Nuxt, SvelteKit, Firebase, osobny backend, obowiązkowy Cursor.
- Kompromis: zależności integracyjne Supabase/Vercel; nie są uznane za bezkosztowo wymienne.
- Użytkownik potwierdził, że nazwa projektu nadrzędnego „wedkarskibox.pl” może zostać.
- Repozytorium podane przez użytkownika: https://github.com/Kilinskitech/smartfach.pl.

## D005 — Ceny jako testowalne hipotezy

- Status: kwoty podane przez foundera, nie ostateczny cennik opublikowany.
- Decyzja: 49 / 99 / 299 zł miesięcznie oraz dodatkowy członek 49,99 zł.
- Powód: prosta segmentacja indywidualny użytkownik / firma.
- Otwarte: netto/brutto, dokładna liczba miejsc w bazie, limity, pro rata i trial.
- Odrzucono: zmiana cen wyłącznie z intuicji; uznawanie Firma za kilka tańszych Pro.
- Aktualizacja 2026-09-04: kwoty pozostają bez zmian. Model kredytowy opisuje D019;
  Odkryj, Uruchom i Prowadź nie są osobnymi planami cenowymi.

## D006 — Minimalny demonstrator nie udaje alfy

- Status: decyzja implementacyjna etapu 0, nie zmiana zakresu MVP.
- Decyzja: lokalne przykładowe obliczenia bez AI, zapisu, PDF i płatności;
  niegotowe funkcje są opisane i niedostępne.
- Powód: przetestować fundament obliczeń przed integracjami, bez prawdziwych danych.
- Odrzucono: fikcyjne komunikaty „zapisano”, „wysłano”, „AI rozpoznało”.
- Granica: żaden produkt nie może być sprzedawany na podstawie tego demonstratora.
- Aktualizacja 2026-08-31: ograniczony etap demonstracyjny zastąpił lokalny warsztat
  z realnym zapisem i PDF (D009). Zasada niewprowadzania w błąd pozostaje.

## D007 — Gotowy szkic przed formularzem

- Data: 2026-08-31.
- Status: doprecyzowanie UX zgodne z prośbą foundera, nie zmiana zasad finansowych.
- Decyzja: AI docelowo przygotowuje kompletny szkic z wypowiedzi i danych firmy;
  użytkownik najpierw widzi kartę z kwotą i pozycjami. Ręczna korekta jest osobnym widokiem.
- Powód: ograniczyć wpisywanie i pokazać rezultat pracy, nie sam kalkulator.
- Odrzucono: domyślnie otwarty formularz wymagający uzupełnienia całej wyceny;
  utożsamienie „AI przygotowuje 100% szkicu” ze swobodnym wymyślaniem cen i sum.
- Kompromis: jedno dodatkowe naciśnięcie dla ręcznej korekty; mniej pól na Home.
- MASTER_PLAN: doprecyzowano regułę UX. D002 pozostaje bez zmian.
- Implementacja w chwili D007, zastąpiona przez D008/D009: oznaczony przykład bez AI, karta oraz edycja lokalnego szkicu
  (klient, opis, nazwy, ceny, ilości, jednostki, dodawanie/usuwanie pozycji, VAT).
  Anulowanie nie zmienia karty; zastosowanie nie oznacza zapisu na serwerze.
- Kierunek wizualny: granat, ciepła biel, pomarańczowy akcent i geometryczny znak F.
  Jest hipotezą projektową, nie wynikiem badań klientów ani weryfikacji znaku towarowego.

## D008 — Czat jako ekran startowy, bez danych przykładowych

- Data: 2026-08-31. Status: wyraźna prośba foundera.
- Decyzja: zwykły czat tekstowy na Home, brak mikrofonu, gotowej przykładowej wyceny
  i automatycznych wiadomości. Szybkie akcje prowadzą do własnych dokumentów.
- Powód: prostsze wejście i samodzielna praca na własnym zadaniu.
- Odrzucono: narzucony przykład, dominujący mikrofon, formularz jako Home.
- Kompromis: głos/vision później; bez podłączonego AI czat jawnie niedostępny,
  ale narzędzia ręczne działają. Karta szkicu i kontrola biznesowa nadal obowiązują.
- MASTER_PLAN i UX_RULES: zaktualizowane. D002 nie zmienia się.

## D009 — Funkcjonalny warsztat lokalny przed usługami zewnętrznymi

- Data: 2026-08-31. Status: decyzja implementacyjna dla lokalnego testu.
- Decyzja: trwały lokalny zapis przez endpointy Next, własne dane zamiast seedów,
  CSV, dokumenty/PDF i historia. UI używa kodu domenowego do obliczeń.
- Powód: domknąć testowalne przebiegi bez wymyślania konfiguracji Supabase i kont.
- Kompromis: pojedynczy komputer/proces, nie SaaS. API blokuje produkcję i zewnętrzne
  pochodzenie; tylko dane testowe. Plik nie jest bezpieczną chmurą ani szyfrowaną bazą.
- Odrzucono: pozorny zapis, przeglądarkowy magazyn jako docelowa baza, publikacja
  wersji bez logowania, zmiana uzgodnionego stosu na inną platformę.
- PDF: lokalny pdf-lib + osadzony Noto Sans na licencji OFL; dane nie trafiają do
  serwisu konwersji. Każdy PDF tego etapu jest oznaczony jako dokument testowy.
- MASTER_PLAN: stan przyrostu; docelowy Supabase/PostgreSQL bez zmian.

## D010 — Adapter AI, nie wybór produkcyjnego modelu

- Data: 2026-08-31. Status: przygotowanie integracji do testów, domyślnie wyłączona.
- Decyzja: mały adapter Responses API z wymuszonym schematem i walidacją, zmienna
  modelu zamiast wpisanego na stałe modelu; brak klucza blokuje wysyłanie.
- Powód: normalne pytania i propozycje wycen/protokołów w jednym czacie, bez agentowego frameworka.
- Kompromis: jakość i rzeczywiste koszty niezweryfikowane bez konfiguracji; konieczny
  benchmark 2–3 opcji, kontrola konta/regionu/retencji przed wyborem produkcyjnym.
- Odrzucono: udawane odpowiedzi, sekrety w frontendzie, automatyczne zatwierdzenia
  cen, zapisy dokumentów lub wysyłka przez model.
- MASTER_PLAN: zasada biznesowa bez zmian; szczegóły w AI_ARCHITECTURE.
- Aktualizacja 2026-09-01: bezpośredni adapter jednego dostawcy zastąpił OpenRouter (D012).
  Walidacja schematu i kontrola działań biznesowych pozostają bez zmian.

## D011 — Asystent jako główne miejsce pracy

- Data: 2026-09-01. Status: kierunek wskazany przez foundera i wdrożony w lokalnym warsztacie.
- Decyzja: użytkownik zaczyna wycenę, protokół albo zwykłe zadanie jedną wiadomością
  do asystenta. Dokumenty, klienci i cennik są pamięcią firmy w tle, a tryb ręczny
  pozostaje awaryjną ścieżką, nie równorzędnym początkiem pracy.
- Klienci: użytkownik nie musi zakładać karty przed pierwszą wartością. System może
  dopasować istniejącego klienta wyłącznie jednoznacznie; nową kartę tworzy dopiero
  przy zapisie sprawdzonego dokumentu. D013 usuwa ręczny wybór przed rozmową;
  przy niejednoznaczności asystent prosi o doprecyzowanie osoby.
- Kontrola: AI przygotowuje szkic i prezentuje kartę do sprawdzenia. Nie zapisuje,
  nie wysyła i nie zatwierdza ceny samodzielnie. Obliczenia pozostają deterministyczne.
- Powód: mniej decyzji i kroków oraz bezpośrednia realizacja obietnicy „jedno zdanie
  zamiast kilku minut pracy”, bez wymagania od fachowca poznania struktury programu.
- Kompromis: aktywacja mocniej zależy od jakości i dostępności AI. Zachowujemy więc
  tryb awaryjny oraz wymagamy jawnego potwierdzenia działania biznesowego.
- Prywatność kontekstu lokalnego adaptera: model otrzymuje same nazwy i identyfikatory
  klientów, maksymalnie 100 pozycji cennika oraz historię tylko klienta wskazanego
  jawnie lub jednoznacznie. Nie wysyłamy telefonu, e-maila, adresu ani notatek klienta.
- Odrzucono: pięć równorzędnych modułów na starcie, automatyczny zapis/wysyłkę bez
  kontroli oraz obowiązkowe tworzenie klienta przed uzyskaniem pierwszej wartości.
- Zaktualizowano: MASTER_PLAN, PRODUCT_SPEC, UX_RULES i AI_ARCHITECTURE.

## D012 — OpenRouter i jeden multimodalny interfejs

- Data: 2026-09-01. Status: decyzja eksperymentalna dla lokalnych testów, nie wybór produkcyjny.
- Decyzja: OpenRouter zastępuje bezpośredni adapter pojedynczego dostawcy. Founder może
  przełączać wyłącznie modele z serwerowej listy, a fachowiec zawsze widzi jednego asystenta.
- Startowa hipoteza: `google/gemini-3.5-flash`, ponieważ przez OpenRouter obsługuje tekst,
  obrazy, audio, pliki, narzędzia i structured outputs. GPT-5.6 Luna pozostaje modelem
  porównawczym dla tekstu/vision, ale nie jest pełnym modelem głosowym.
- Interfejs: jedna wiadomość może zawierać tekst, maksymalnie trzy zdjęcia/nagrania
  i 10 MB danych base64. Załączniki nie są zapisywane w lokalnym pliku warsztatu.
- Prywatność: żądania ustawiają `require_parameters`, `data_collection: deny` i domyślnie
  ZDR. Nie zastępuje to DPA, oceny dostawcy końcowego ani regionalnego przetwarzania w UE.
- Powód: szybkie porównanie Task Success Rate, kosztu i opóźnień bez przepisywania produktu;
  jeden prosty interfejs dla użytkownika bez eksponowania mu technologii.
- Kompromis: dodatkowy procesor danych, zależność od zgodności endpointów i formatów audio,
  brak gwarancji identycznego schematu między modelami oraz trudniejsza analiza odpowiedzialności.
- Odrzucono: jeden model na siłę mimo braku wymaganej modalności, wybór modelu przez fachowca
  i trwałe przechowywanie niechronionych zdjęć/nagrań w lokalnym pliku JSON.
- Aktualizujemy: MASTER_PLAN, MVP_SPEC, PRODUCT_SPEC, UX_RULES, AI_ARCHITECTURE i RESEARCH.

## D013 — Automatyczna pamięć klienta bez selektora

- Data: 2026-09-01. Status: przyjęta dla obecnego warsztatu i docelowego UX.
- Decyzja: usuwamy z czatu ręczne pole „Pamięć klienta”. Kod przeszukuje wszystkich
  klientów firmy i rozpoznaje klienta z całej bieżącej rozmowy, nie tylko z ostatniej
  wiadomości. Kolejne zdanie może więc odwołać się do wcześniej wskazanej osoby.
- Granica bezpieczeństwa: pełna historia jest dołączana tylko dla jednego jednoznacznego
  dopasowania. Najnowsza niejednoznaczna wzmianka zatrzymuje użycie wcześniejszego
  kontekstu; asystent prosi wtedy o pełne imię lub nazwę zamiast zgadywać.
- Prywatność i koszt: „pamięta wszystkich” oznacza wyszukiwanie w pamięci firmy, a nie
  wysyłanie do modelu kompletnych danych i historii wszystkich klientów przy każdym pytaniu.
- Powód: fachowiec nie powinien zarządzać stanem asystenta. Ma powiedzieć jedno zdanie,
  a SmartFach ma sam odnaleźć właściwy kontekst.
- Kompromis: automatyczne rozpoznawanie nazw wymaga testów na realnych danych, odmianach
  polskich nazwisk, firmach o podobnych nazwach i zmianie klienta w trakcie rozmowy.
- Odrzucono: stały selektor klienta pod polem wiadomości oraz bezwarunkowe użycie
  poprzedniego klienta po niejednoznacznej wzmiance.
- Zaktualizowano: MASTER_PLAN, PRODUCT_SPEC, UX_RULES, AI_ARCHITECTURE, ROADMAP i README.

## D014 — Kontrolowany dostęp asystenta do internetu

- Data: 2026-09-01. Status: przyjęta do lokalnych testów; dostawca i ekonomia wymagają benchmarku.
- Decyzja: SmartFach udostępnia modelowi serwerowe narzędzie OpenRouter
  `openrouter:web_search`. Model sam uruchamia je przy pytaniach wymagających aktualnych
  informacji. Nie używamy przestarzałego pluginu `web` ani wariantu `:online`.
- Kontrola kosztu: maksymalnie 3 wyniki na wyszukiwanie, 5 łącznie w jednym zapytaniu
  i mały kontekst. Funkcję można wyłączyć przez `OPENROUTER_WEB_SEARCH=false`.
- UX: zweryfikowane adresy HTTP(S) z adnotacji dostawcy są zapisywane z wiadomością
  i pokazywane jako klikalne źródła. Asystent nie powinien już ogólnie twierdzić,
  że nie ma internetu, gdy narzędzie jest dostępne.
- Granica biznesowa: znalezione ceny są orientacją rynkową w odpowiedzi. Nie mogą
  automatycznie wypełnić ceny wyceny; dokument nadal korzysta wyłącznie z firmowego
  cennika albo jawnej kwoty podanej przez użytkownika.
- Bezpieczeństwo: treści stron są niezaufane i nie nadają modelowi uprawnień. Odpowiedzi
  wysokiego ryzyka nadal wymagają ostrożności i weryfikacji w źródłach.
- Kompromis: dodatkowy koszt, opóźnienie, kolejny procesor danych oraz zależność od
  funkcji beta OpenRoutera. Skuteczność i koszt trzeba zmierzyć na pytaniach HVAC.
- Zaktualizowano: MASTER_PLAN, PRODUCT_SPEC, UX_RULES, AI_ARCHITECTURE, ROADMAP,
  RESEARCH, README i `.env.example`.

## D015 — Odzyskiwanie zwykłej odpowiedzi bez osłabiania dokumentów

- Data: 2026-09-01. Status: wdrożona po błędzie prawdziwego czatu.
- Problem: model może sporadycznie zwrócić zwykły tekst albo dodać Markdown wokół JSON-u,
  mimo żądania Structured Outputs. Dotychczas każda taka odpowiedź kończyła rozmowę
  komunikatem „AI zwróciło nieprawidłową odpowiedź”.
- Decyzja: lokalny parser odzyskuje poprawny JSON z pojedynczego bloku `json` albo
  z odpowiedzi otoczonej tekstem. Jeśli struktury nadal nie ma, zwykła rozmowa może
  bezpiecznie pokazać tekst z `quote: null` i `report: null`.
- Granica bezpieczeństwa: jawne polecenie stworzenia wyceny, oferty, kosztorysu albo
  protokołu nie korzysta z fallbacku tekstowego. Dokument powstaje wyłącznie po pełnej
  walidacji schematu; błędny wynik nie jest zapisywany ani przeliczany.
- Diagnostyka: zapisujemy tylko identyfikator żądania, provider, model, `finish_reason`,
  przyczynę, długość odpowiedzi i informację, czy oczekiwano dokumentu. Bez surowych
  wiadomości i danych klienta.
- Powód: zwykły czat powinien być odporny na kosmetyczny błąd formatu, ale niezawodność
  wyceny i protokołu ma pierwszeństwo przed pozornym sukcesem.
- Kompromis: heurystyka rozpoznawania polecenia dokumentu wymaga dalszych testów polskich
  sformułowań i literówek. Fallback nigdy nie wykonuje operacji biznesowej.
- Zaktualizowano: AI_ARCHITECTURE, ROADMAP, RESEARCH i README.

## D016 — Gemini 3.5 Flash jako model lokalnej alfy i odporniejszy format

- Data: 2026-09-01. Status: przyjęta dla lokalnej alfy; nie jest ostatecznym wyborem produkcyjnym.
- Decyzja: pozostawiamy `google/gemini-3.5-flash` jako domyślny model. Ustawiamy
  minimalny poziom rozumowania, limit 5000 tokenów, niewracające do klienta rozumowanie
  oraz plugin OpenRouter `response-healing`. Flash Lite pozostaje wyłącznie opcją testową.
- Dowód: na czterech identycznych syntetycznych zadaniach Flash poprawnie wykonał
  zwykłą odpowiedź, wyszukiwanie ze źródłami, wycenę i protokół (4/4). Flash Lite
  poprawnie obsłużył 3/4, ale nie utworzył żądanego protokołu. GPT-5.6 Luna zwrócił
  brak dostępnej trasy przy obecnych filtrach, a według katalogu nie przyjmuje audio.
- Odporność: przy uszkodzonym JSON-ie zwykły czat może odzyskać zakończone pole
  `reply`, nawet jeśli późniejsza część została ucięta. Wycena i protokół nadal
  działają fail-closed i wymagają pełnej walidacji.
- Diagnostyka: metadane odrzuconej odpowiedzi są zapisywane jako pojedynczy rekord
  JSON bez surowej treści. Dzięki temu lokalny log zachowuje rzeczywistą przyczynę,
  długość oraz `finish_reason`.
- Powód: błąd wynikał z granicy odpowiedzi i formatu, nie z braku wiedzy modelu.
  Sama zmiana dostawcy nie usuwałaby tej klasy awarii.
- Kompromis: Flash jest znacznie droższy i wolniejszy od Lite. Wyszukiwanie stanowi
  duży udział kosztu; przed płatną alfą potrzebne są limity i szerszy benchmark HVAC.
- MASTER_PLAN: bez zmiany fundamentu. Zaktualizowano AI_ARCHITECTURE, TECH_STACK,
  ROADMAP i RESEARCH.

## D017 — Jeden asystent w UI oraz osobne Wyceny i Protokoły

- Data: 2026-09-02. Status: wdrożona w lokalnym warsztacie.
- Decyzja: użytkownik nie widzi nazwy ani selektora modelu. SmartFach używa jednego
  modelu ustawionego na serwerze przez `OPENROUTER_MODEL`; usunięto
  `OPENROUTER_TEST_MODELS` z konfiguracji aplikacji i ustawień.
- Nawigacja: ogólną zakładkę „Dokumenty” rozdzielono na bezpośrednie „Wyceny” oraz
  „Protokoły”. Każdy widok ma własną listę, wyszukiwarkę, pusty stan i licznik.
  Wspólny model danych dokumentów pozostaje bez zmian, dzięki czemu historia klienta
  nadal łączy oba typy.
- Rozmowy: usunięto selektor „Historia rozmów” znad czatu. Pełna lista „Rozmowy”
  znajduje się w lewym panelu i wskazuje aktywną pozycję. Na telefonie otwiera ją
  mały przycisk w nagłówku, ponieważ stały lewy panel jest wtedy ukryty.
- Powód: fachowiec wybiera zadanie biznesowe, a nie technologię. „Dokumenty” wymagały
  dodatkowej decyzji i filtra, podczas gdy wycena oraz protokół są odrębnymi celami.
- Kompromis: dolna nawigacja telefonu ma pięć pozycji zamiast czterech i wymaga testu
  na fizycznych urządzeniach. Nie rozdzielamy tabel ani historii klienta.
- Zaktualizowano: MASTER_PLAN, UX_RULES, AI_ARCHITECTURE, ROADMAP i README.

## D018 — Trzy niezależne ścieżki pod jednym kontem

- Data: 2026-09-04. Status: decyzja produktowa przyjęta przez foundera; landing,
  selektor i kontekst AI wdrożone lokalnie, ustrukturyzowane rezultaty pozostają otwarte.
- Decyzja: SmartFach ma trzy niezależne ścieżki: Odkryj, Uruchom i Prowadź.
  Użytkownik może wejść bezpośrednio do dowolnej z nich i przełączać się bez
  wymuszonego przechodzenia etapów. Konto i zatwierdzony kontekst są wspólne,
  z zachowaniem oddzielenia kontekstu osobistego od danych organizacji.
- Odkryj: nie kończy się po wyborze pomysłu. Pozostaje dostępne stale, również
  dla osoby korzystającej z Uruchom lub prowadzącej aktywną firmę.
- Uruchom: wspiera konkretny biznes od ustalenia klienta, oferty i podstaw cenowych
  do działań zmierzających do pierwszego klienta.
- Prowadź: pozostaje operacyjnym rdzeniem SmartFach i obejmuje kontrolowane workflow
  firmy. Obecny lokalny warsztat realizuje wyłącznie fragment tej ścieżki.
- UX: to nie trzy chatboty ani trzy plany. Każda ścieżka ma kończyć się kartą,
  zapisem lub następną akcją, aby produkt nie stał się generycznym czatem.
- Marketing: dopuszczamy aspiracyjne hasło „od pomysłu do pierwszego klienta”.
  Zakazane są gwarancje dochodu, pozyskania klienta, czasu lub sukcesu biznesu.
- Powód: różne intencje użytkownika mogą współistnieć, a odkrywanie nowych
  kierunków nie znika po uruchomieniu firmy.
- Kompromis: szersza obietnica zwiększa ryzyko scope creep. Minimalne Odkryj/Uruchom
  nie mogą opóźnić niezawodności wyceny, protokołu i historii w Prowadź.
- Odrzucono: liniowy onboarding Odkryj → Uruchom → Prowadź, blokady etapów,
  oddzielne konta i automatyczne kopiowanie danych osobistych do firmy.
- Zaktualizowano: MASTER_PLAN, MVP_SPEC, PRODUCT_SPEC, UX_RULES, PRICING, DATABASE,
  ROADMAP i DECISIONS.

## D019 — Widoczne kredyty i rozdzielenie puli planowej od dokupionej

- Data: 2026-09-04. Status: kierunek rozliczeń przyjęty; widok i lokalna blokada
  wdrożone z testowymi wielkościami pul. Płatności i księga nie są wdrożone.
- Decyzja: zużycie i pozostałe kredyty są widoczne. Każdy plan otrzymuje miesięczną
  pulę, a dokupione kredyty są osobnym grantem i zużywają się dopiero po puli planowej.
- Hipoteza do potwierdzenia: niewykorzystana pula miesięczna odnawia się bez
  kumulacji. Ważność kredytów dokupionych oraz zwroty za błędne operacje są otwarte.
- Billing: realny zakup może zostać uruchomiony dopiero po wdrożeniu idempotentnego
  checkoutu/webhooków i niezmiennej księgi kredytowej. Retry nie może naliczyć
  drugiego zakupu ani dwukrotnie obciążyć tej samej operacji.
- Zakres: kredyty obowiązują w Odkryj, Uruchom i Prowadź w ramach uprawnionego konta
  lub organizacji. Szczegółowy podział puli Firma pozostaje otwarty.
- Powód: użytkownik ma rozumieć limit, a produkt kontrolować koszt AI bez ukrytych
  ograniczeń i niespójnego naliczania.
- Kompromis: kredyty dodają pojęcie do UX i wymagają transakcyjnego modelu danych,
  korekt oraz obsługi sporów; nie wolno udawać prostego licznika w interfejsie.
- Odrzucono: niewidoczne limity, wspólne saldo bez informacji o pochodzeniu, zużywanie
  dokupionych kredytów przed planowymi i wdrożenie zakupu bez idempotencji.
- Zaktualizowano: MASTER_PLAN, MVP_SPEC, PRODUCT_SPEC, UX_RULES, PRICING, DATABASE,
  ROADMAP i DECISIONS.

## D020 — Landing rozdzielony od aplikacji i testowe wielkości kredytów

- Data: 2026-09-04. Status: wdrożone lokalnie jako hipoteza do walidacji.
- Decyzja: `/` jest stroną sprzedażową, a warsztat działa pod `/app`. Osobne landing
  page’e odpowiadają intencjom Odkryj, Uruchom i Prowadź; cennik ma własny adres.
- Kredyty prototypu: Lite 150, Pro 500, Firma 1600 miesięcznie. Pakiety pokazane bez
  aktywnego checkoutu: 100/19,99 zł, 300/49,99 zł, 1000/129,99 zł. Tekst kosztuje od
  1 kredytu, zdjęcie +2, głos +4, faktycznie użyty internet +2.
- Powód: reklama powinna prowadzić do obietnicy dopasowanej do intencji, a użytkownik
  ma rozumieć limit przed jego osiągnięciem. Liczby pozwalają testować komunikację.
- Kompromis: nie mamy jeszcze danych o rozkładzie użycia ani willingness to pay.
  Liczb nie wolno przedstawiać jako zwalidowanych; należy je zmienić po pomiarze kosztu
  i rozmowach z klientami. Lokalny licznik nie jest bezpiecznym systemem finansowym.
- Odrzucono: jeden landing dla wszystkich reklam, ukryty limit oraz fikcyjne zwiększenie
  salda po kliknięciu niepodłączonego przycisku zakupu.
- Zaktualizowano: MASTER_PLAN, MVP_SPEC, PRODUCT_SPEC, AI_ARCHITECTURE, DATABASE,
  PRICING, ROADMAP i README.

## D021 — Techniczne jednostki ukryte, zwiększenie limitu dopiero po wyczerpaniu

- Data: 2026-09-04. Status: wdrożone w lokalnym interfejsie; zastępuje publiczną
  prezentację licznika z D019–D020, nie zmienia mechanizmu kosztowego w tle.
- Decyzja: landing, cennik, nagłówek i boczny panel nie pokazują słowa „kredyty”,
  salda ani pakietów dodatkowych. Po wykorzystaniu limitu asystent pokazuje spokojny
  komunikat „Zwiększ limit”; dopiero wtedy dostępne są jednorazowe opcje.
- Transparentność: dokładne, materialne warunki limitu nadal muszą być przedstawione
  przed płatnością. Brak codziennego licznika nie zezwala na zaskakiwanie klienta
  warunkami ukrytymi wyłącznie w regulaminie.
- Warstwa techniczna: dotychczasowy przelicznik i rozdzielenie puli planowej od
  dodatkowej pozostają wewnętrzne. Produkcja nadal wymaga księgi i idempotencji.
- Design: landingi otrzymują nowy hero, animowane elementy podglądu, karty z ruchem
  przy interakcji i osobny wygląd trybów; ograniczenie ruchu systemu jest respektowane.
- Powód: użytkownik ma myśleć o wykonywanej pracy, nie o ekonomii tokenów modelu.
- Kompromis: bez stałego licznika moment blokady może zaskakiwać. Przed płatną alfą
  trzeba przetestować miękkie ostrzeżenie blisko limitu, napisane bez języka technicznego.

## D022 — Kontekstowe plany i uczciwy cel 10 000 zł

- Data: 2026-09-04. Status: część dotycząca celu 10 000 zł pozostaje aktualna;
  merchandising planów i jednorazowe pozycjonowanie „Zbuduj plan” zostały
  zastąpione przez D023.
- Decyzja: Odkryj i Uruchom prezentują wyłącznie plany Lite 49 zł oraz Pro 99 zł.
  Prowadź i rozwijaj prezentuje wariant Jednoosobowa 99 zł, mapowany na Pro, oraz
  Z pracownikami 299 zł, mapowany na Firma. Kolejny członek pozostaje hipotezą
  cenową 49,99 zł miesięcznie.
- Architektura: na zapleczu nadal istnieją trzy plany Lite/Pro/Firma. Nazwy
  Jednoosobowa/Z pracownikami są warstwą merchandisingu i zawsze występują obok
  bazowej nazwy, aby checkout, rachunek i ustawienia były spójne.
- Komunikacja: w Odkryj dopuszczono zdanie „Zbuduj plan dojścia do 10 000 zł
  miesięcznego przychodu i realizuj go krok po kroku”. Kwota oznacza cel użytkownika.
  Landing pokazuje mechanizm cel → cena i koszty → liczba klientów → działania oraz
  jasno informuje, że SmartFach nie gwarantuje wyniku.
- Pozycjonowanie: zamiast atakować „scamowych mentorów” używamy profesjonalnego
  kontrastu „Bez magicznych metod. Z planem opartym na liczbach”. Zakazane pozostają
  obietnice pasywnego lub łatwego dochodu i nieudowodnione superlatywy.
- Nazewnictwo: marketing może używać „Prowadź i rozwijaj”, ale kontekst aplikacji
  pozostaje „Prowadź”, aby etykieta była krótka i obejmowała także firmę jednoosobową.
- Powód: ta sama cena wymaga innej prezentacji wartości na różnych etapach, ale
  mnożenie produktów tworzyłoby zamieszanie i niepotrzebną złożoność billingu.
- Kompromis: konkretna kwota może zwiększać konwersję, lecz przyciąga też odbiorców
  oczekujących gwarancji. Trzeba osobno mierzyć jakość leadów, zwroty, support,
  aktywację i retencję, a nie tylko CTR reklamy.
- Odrzucono: gwarancja 10 000 zł, „dochód pasywny”, wspólna lista trzech planów na
  każdym landingu oraz sześć niezależnych produktów w systemie rozliczeń.
- Zaktualizowano: MASTER_PLAN, PRODUCT_SPEC, UX_RULES, PRICING, ROADMAP, MVP_SPEC
  i DECISIONS.

## D023 — Jeden abonament obejmuje wszystkie tryby

- Data: 2026-09-04. Status: zastępuje część merchandisingową D022; model danych,
  landingi i przełączanie wdrożone lokalnie.
- Decyzja: tryb określa rodzaj wykonywanej pracy, a plan cenę, miesięczny limit
  i liczbę użytkowników. Lite, Pro i Firma obejmują Odkryj, Uruchom oraz Prowadź.
- Rozliczenie: zmiana trybu mieści się w abonamencie, nie zmienia ceny ani terminu
  odnowienia i nie resetuje wykorzystania jednego limitu planu wspólnego dla
  trybów. Zakupione
  zwiększenie również pozostaje przy koncie lub organizacji, nie przy trybie.
- Dane: zatwierdzony kontekst, klienci, kwoty, dokumenty i rozmowy pozostają zapisane.
  Powrót do trybu może wznowić jego ostatnią rozmowę. Zachowanie danych nadal podlega
  prawom organizacji — zmiana trybu nie daje dodatkowych uprawnień.
- Plany: Lite 49 zł i Pro 99 zł są dla jednej osoby i różnią się głównie limitem.
  Firma 299 zł obejmuje właściciela i według hipotezy trzech członków; dodatkowy
  członek kosztuje 49,99 zł. „Jednoosobowa” i „z pracownikami” są opisem odbiorcy,
  nie nazwami kolejnych produktów.
- Marketing: wartość abonamentu to cykl planuj → działaj → zapisz wynik → aktualizuj,
  a nie jednorazowe wygenerowanie biznesplanu. Odkryj i Uruchom eksponują Lite/Pro,
  Prowadź oraz pełny cennik pokazują jedną linię Lite/Pro/Firma.
- UX: desktopowy przełącznik informuje o ciągłości planu i danych. Na telefonie
  dodano dostęp do wszystkich trybów również wtedy, gdy dolny pasek Prowadź służy
  do wycen, protokołów, klientów i cennika.
- Powód: osobne produkty lub opłaty za etap obniżałyby wartość subskrypcji i tworzyły
  niejasność. Jedna linia planów buduje retencję na pamięci, historii i regularnych
  powrotach, a nie na sztucznej blokadzie przejścia.
- Kompromis: wspólny limit ułatwia rozumienie ceny, lecz intensywny research w Odkryj
  może zużyć pulę potrzebną do pracy operacyjnej. Przed płatną alfą trzeba zmierzyć
  koszt według trybu i zaprojektować uczciwe ostrzeżenie blisko limitu.
- Odrzucono: opłatę za przejście trybu, reset limitu po zmianie, osobny abonament
  dla każdego etapu, ukrycie Lite w Prowadź oraz nazwanie „Jednoosobowa” czwartym planem.
- Zaktualizowano: MASTER_PLAN, PRODUCT_SPEC, UX_RULES, PRICING, MVP_SPEC, DATABASE,
  ROADMAP i DECISIONS.

## D024 — Nawigacja korzyściami, kontakt i lokalny moduł zespołu

- Data: 2026-09-04. Status: wdrożone w publicznej stronie i lokalnym warsztacie.
- Decyzja marketingowa: publiczne menu nie używa skrótowych nazw trybów jako głównych
  obietnic. Linki brzmią „Znajdź pomysł”, „Uruchom firmę” i „Prowadź firmę”, a
  wewnątrz produktu krótkie nazwy Odkryj/Uruchom/Prowadź pozostają bez zmian.
- Kontakt: formularz przygotowuje wiadomość do `kontakt@smartfach.pl` w programie
  pocztowym użytkownika. Nie udaje wysyłki i nie zapisuje wiadomości na serwerze.
- Dokumenty: dodano regulamin wersji testowej i politykę prywatności z danymi
  KILIŃSKI TECH Szymon Kiliński, NIP 9151830069, REGON 528527069. To nie są jeszcze
  warunki sprzedaży subskrypcji; wymagają aktualizacji i przeglądu przed płatnym startem.
- Zespół: plan Firma ma lokalny moduł dodawania, edycji i usuwania członków,
  stanowiska oraz obliczenie ceny po przekroczeniu trzech miejsc w cenie. Usunięto
  ogólną etykietę „w przygotowaniu”.
- Granica bezpieczeństwa: lista zespołu nie jest kontem użytkownika. Zaproszenia,
  logowanie, RLS, synchronizacja i egzekwowanie ról wymagają docelowej warstwy
  organizacji; lokalny interfejs informuje o tej granicy.
- Powód: język publiczny ma od razu wyjaśniać rezultat, a widoczna funkcja planu
  Firma powinna dać się przetestować bez stwarzania pozoru gotowej autoryzacji.
- Kompromis: `mailto:` nie gwarantuje dostarczenia wiadomości bez skonfigurowanej
  skrzynki i programu pocztowego. Docelowy formularz serwerowy wymaga dostawcy,
  ochrony przed spamem i uzupełnienia polityki prywatności.
- Zaktualizowano: MASTER_PLAN, MVP_SPEC, README i DECISIONS.

### Aktualizacja D024 — publiczna marka bez eksponowania danych osobistych

- Data: 2026-09-04.
- Decyzja: strona Kontakt eksponuje markę SmartFach i adres e-mail. Pełna nazwa
  jednoosobowej działalności oraz adres nie są elementem promocyjnego hero; pozostają
  bezpośrednio dostępne w Regulaminie i Polityce prywatności przez linki w tej samej karcie
  i stopce.
- Powód: wymagane dane identyfikują operatora, ale nie muszą dominować komunikacji marki.
  SmartFach pozostaje nazwą produktu, a KILIŃSKI TECH Szymon Kiliński — podmiotem prawnym.

## D025 — Trial z kartą i panel właściciela bez dostępu do prywatnych rozmów

- Data: 2026-09-04. Status: komunikacja i panel lokalny wdrożone; płatności oraz
  produkcyjne dane wymagają Supabase i Stripe.
- Decyzja komercyjna: wszystkie płatne plany rozpoczynają się 3 pełnymi dniami
  próby. Metoda płatności jest wymagana przed startem, a brak anulowania przed końcem
  próby uruchamia pierwszy miesięczny abonament.
- Marketing: usunięto CTA „Zobacz jak działa” i „Otwórz wersję testową”. Publiczny
  interfejs komunikuje próbę, obowiązek karty, `0 zł` w okresie próbnym, automatyczne
  przejście na płatny plan i możliwość anulowania przed pierwszą opłatą.
- Panel: `/admin` pokazuje zagregowane metryki użytkowników, triali, metod płatności,
  płacących kont i zużycia. Obecny wariant lokalny korzysta tylko z realnych danych
  warsztatu i pokazuje zero tam, gdzie integracja jeszcze nie istnieje.
- Prywatność: właściciel produktu nie widzi surowych promptów, odpowiedzi, zdjęć ani
  danych klientów domyślnie. Przyszły dostęp serwisowy musi wymagać zgody klienta,
  konkretnego powodu, ograniczenia czasowego i niezmiennego audytu.
- Bezpieczeństwo: lokalny panel działa wyłącznie w development na loopback. Wersja
  produkcyjna wymaga osobnej roli administratora platformy, bezpiecznej sesji,
  zweryfikowanych webhooków i minimalizacji danych; zalecane jest MFA.
- Powód: trial z kartą ogranicza koszt ciekawskich użytkowników i pozwala mierzyć
  gotowość do płacenia. Panel ma ułatwiać zarządzanie ekonomią bez tworzenia
  niepotrzebnego ryzyka prywatności.
- Ryzyko: 3 dni może nie objąć żadnej realnej wizyty fachowca i obniżyć aktywację.
  Mierzymy checkout → karta → pierwsza wartość → trial paid oraz porównujemy wariant
  7 dni z kartą przed uznaniem trzech dni za optymalny okres.
- Docelowa implementacja: Stripe Checkout i Customer Portal, jasna data pierwszej
  opłaty, wiadomości przed obciążeniem, idempotentne webhooki i statusy w Supabase.
- Zaktualizowano: MASTER_PLAN, PRICING, PRODUCT_SPEC, MVP_SPEC, DATABASE, ROADMAP,
  README i DECISIONS.

## D026 — Pełne rozmowy w kontroli jakości realnego produktu

- Data: 2026-09-04. Status: widok lokalny wdrożony; produkcyjne zabezpieczenia są
  bramką przed dopuszczeniem realnych użytkowników.
- Decyzja: właściciel SmartFach potrzebuje wglądu w pełne prompty i odpowiedzi
  realnych użytkowników, aby oceniać błędy AI, utratę kontekstu, działanie wyszukiwania
  i poprawność workflow. D025 zostaje zastąpione w zakresie zakazu domyślnego podglądu.
- UX panelu: odrębna sekcja „Kontrola jakości” pokazuje rozmowy, kolejność wiadomości,
  tryb produktu, model, źródła i informację o szkicu dokumentu. Nie miesza się jej
  z obsługą subskrypcji ani zwykłym widokiem użytkownika.
- Transparentność: przed rejestracją użytkownik musi otrzymać jednoznaczną informację,
  że upoważniony zespół SmartFach może analizować pełną treść rozmów w celu kontroli
  i ulepszania jakości produktu. Nie przedstawiamy tego jako danych anonimowych.
- Granica użycia: treści nie wolno wykorzystywać do marketingu, sprzedaży danych ani
  trenowania zewnętrznych modeli bez odrębnej decyzji, podstawy i informacji.
- Bezpieczeństwo produkcyjne: osobna rola QA, MFA, zasada najmniejszych uprawnień,
  audyt każdego wyszukania i otwarcia, ograniczony dostęp do załączników, retencja
  oraz procedura obsługi żądań usunięcia/eksportu.
- Warunek prawny: przed startem trzeba ustalić role administratora i podmiotu
  przetwarzającego, podstawę każdego celu, umowę powierzenia dla firm i treść
  obowiązku informacyjnego. Dobre intencje foundera nie zastępują tych wymagań.
- Kompromis: pełny podgląd przyspiesza diagnozę jakości, ale zwiększa ryzyko naruszenia
  poufności i może utrudnić sprzedaż B2B. Po osiągnięciu stabilności porównujemy go
  z automatyczną klasyfikacją błędów i próbkowaniem rozmów.
- Zaktualizowano: MASTER_PLAN, PRODUCT_SPEC, MVP_SPEC, DATABASE, ROADMAP, README
  i DECISIONS.

## D027 — Jeden aktywny typ konta i rozmowy w profilu użytkownika

- Data: 2026-09-04. Status: wdrożone w interfejsie i modelu danych.
- Decyzja: Odkryj, Uruchom i Prowadź są trzema możliwymi typami jednego konta.
  Użytkownik wybiera typ przy rejestracji i zmienia go wyłącznie w Ustawieniach.
  Nie ma codziennego przełącznika ani zmiany istniejącego konta parametrem URL.
- Rozliczenie: typ konta i plan są niezależne. Zmiana typu nie zmienia subskrypcji,
  wykorzystania limitu ani zapisanych danych.
- Panel: przegląd administratora nie pokazuje treści wiadomości. Rozmowy są
  przypisane do użytkownika i dostępne dopiero w jego profilu. Każde otwarcie
  zapisuje zdarzenie audytowe.
- Uprawnienia: na obecnym etapie istnieje jeden administrator platformy wskazany
  serwerowym `PLATFORM_ADMIN_USER_ID`; nie budujemy modułu ról administracyjnych.

- Koszt AI: zapisujemy zwrócone przez OpenRouter usage, koszt USD, tokeny, model,
  dostawcę i identyfikator żądania dla konkretnego użytkownika. Agregat klucza
  dostawcy służy później do uzgadniania, nie zastępuje danych per odpowiedź.
- Powód: typ ma dopasować onboarding, a nie komplikować codzienną nawigację. Hierarchia
  użytkownik → rozmowy odpowiada potrzebie diagnozy jakości bez eksponowania promptów
  na ekranie biznesowych metryk.
- Kompromis: jeden administrator upraszcza MVP, ale wymaga bardzo silnej ochrony konta,
  audytu, retencji i transparentnej informacji dla użytkownika.
- Zastępuje D023 w zakresie codziennego przełączania trybów oraz D026 w zakresie
  osobnej roli QA. Nie znosi obowiązków prywatności opisanych w D026.

## D028 — Supabase i Stripe zamiast lokalnego profilu

- Data: 2026-09-04. Status: kod i migracja gotowe; zewnętrzne projekty oraz sekrety
  nie zostały jeszcze skonfigurowane.
- Decyzja: lokalny profil, jego rozmowy i `.local/workspace.json` zostały usunięte.
  Runtime korzysta z Supabase Auth, organizacji, członkostwa, RLS i prywatnego
  workspace JSONB. Adapter plikowy pozostaje tylko w testach regresji.
- Zapis: klient nie ma bezpośredniego prawa do aktualizacji workspace. Serwer weryfikuje
  sesję i organizację, chroni pola rozliczeniowe i zapisuje przez service role oraz
  wersjonowaną funkcję bazy.
- Płatności: Stripe Checkout zbiera metodę płatności przed 3-dniową próbą. Customer
  Portal obsługuje anulowanie i zmianę planu, a podpisane, idempotentne webhooki
  synchronizują status i plan w Supabase. Dostęp do aplikacji mają statusy `trialing`
  i `active`.
- Granica: kod nie oznacza aktywnej integracji bez migracji, kluczy, cen i endpointu
  webhooka. Zakup dodatkowego limitu, księga zużycia i loginy członków nadal nie są gotowe.
- Powód: realni użytkownicy wymagają źródła prawdy poza procesem aplikacji, izolacji
  organizacji i statusu płatności kontrolowanego przez dostawcę, nie przez frontend.
- Kompromis: JSONB przyspiesza migrację obecnego produktu, ale najważniejsze encje
  trzeba stopniowo normalizować. Supabase Auth/Storage i Stripe tworzą zależność
  integracyjną, dlatego migracje i eksport pozostają w repozytorium.
- Bramka: przed realną płatnością wymagane są testy dwóch organizacji, webhooków,
  kopii zapasowej, podatków i dokumentów prawnych.
- Zaktualizowano: MASTER_PLAN, MVP_SPEC, PRODUCT_SPEC, UX_RULES, DATABASE, TECH_STACK,
  PRICING, ROADMAP, README, RESEARCH i SETUP_SUPABASE_STRIPE.

## D029 — Nowe klucze API Supabase od początku produkcji

- Data: 2026-09-04. Status: wdrożone w kodzie i instrukcji konfiguracji.
- Decyzja: frontend używa `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, a backend
  `SUPABASE_SECRET_KEY`. Nie uruchamiamy produkcji na starszych kluczach JWT
  `anon` i `service_role`.
- Powód: Supabase rekomenduje klucze `sb_publishable_` i `sb_secret_` oraz planuje
  wycofanie starszych kluczy do końca 2026 roku. Projekt nie ma jeszcze danych
  produkcyjnych, więc jest to właściwy moment na użycie nowego standardu.
- Bezpieczeństwo: klucz `sb_secret_` omija RLS i pozostaje wyłącznie w sekretach
  serwerowych Vercela oraz lokalnym `.env.local`; nigdy nie otrzymuje prefiksu
  `NEXT_PUBLIC_` ani nie trafia do repozytorium.
- Kompromis: nazwa zmiennej jest zmianą niekompatybilną względem wcześniejszego
  lokalnego szablonu, ale żadna aktywna integracja Supabase jeszcze jej nie używała.
- Zaktualizowano: kod klienta administracyjnego, `.env.example`, AGENTS,
  SETUP_SUPABASE_STRIPE i DECISIONS.

## D030 — Dwa wejścia sprzedażowe zamiast trzech etapów

- Data: 2026-09-04. Status: przyjęta przez foundera i wdrożona w publicznej
  komunikacji oraz rejestracji.
- Decyzja: landing i rejestracja pokazują tylko dwie sytuacje: **„Buduję od
  zera”** oraz **„Mam pomysł lub firmę”**. Cel 10 000 zł miesięcznego przychodu
  jest głównym, konkretnym punktem wejścia dla pierwszej grupy, ale zawsze pozostaje
  celem użytkownika, nie obietnicą SmartFach.
- Pierwsze wejście sprzedaje ciągłą pracę od wyboru kierunku przez ofertę i cenę
  po pozyskiwanie klientów, a nie jednorazowe „znalezienie pomysłu”.
- Lejek: „Prowadź” nie jest osobnym etapem sprzedażowym. Działająca firma i osoba
  z pomysłem korzystają ze wspólnego wejścia biznesowego; osobny landing „Dla
  zespołów” służy prezentacji planu Firma, a nie tworzy trzeciej ścieżki.
- Architektura: wewnętrzne wartości `discover`, `launch` i `operate` pozostają dla
  kompatybilności danych i dopasowania AI. Nowe wejście biznesowe zapisuje
  `operate`, ponieważ ten kontekst ma działające workflow wycen, protokołów,
  klientów i historii; otwarty asystent obejmuje także ofertę i pozyskanie klienta.
- Zakup: rejestracja nie pokazuje jednocześnie trzech etapów i trzech planów.
  Użytkownik wybiera jedną z dwóch sytuacji, a plan wskazany przez CTA jest pokazany
  w prostym podsumowaniu z możliwością powrotu do cennika.
- Powód: dotychczas klient musiał zrozumieć wewnętrzną architekturę produktu przed
  poznaniem wartości. Dwa wejścia skracają decyzję, wzmacniają komunikację celu
  10 000 zł i zachowują osobną ofertę dla działających firm bez budowania trzech
  produktów.
- Kompromis: wspólne wejście biznesowe jest szersze i może gorzej dopasować pierwszą
  rozmowę osobie, która ma wyłącznie pomysł. Mierzymy aktywację osobno dla obu grup;
  jeśli Task Success Rate spadnie, dodajemy jedno pytanie diagnostyczne po pierwszej
  wiadomości zamiast przywracać trzy etapy w marketingu.
- Odrzucono: usunięcie kontekstu Prowadź z modelu danych, trzy równorzędne ścieżki
  w głównym menu oraz gwarancję osiągnięcia 10 000 zł.
- Zaktualizowano: MASTER_PLAN, MVP_SPEC, PRODUCT_SPEC, UX_RULES, PRICING,
  publiczne landingi, metadane i rejestrację.

## D031 — Dwie oferty planów zależne od punktu startu

- Data: 2026-09-05. Status: decyzja foundera wdrożona w rejestracji, checkout i
  walidacji serwerowej; skuteczność cenowa pozostaje hipotezą.
- Decyzja: „Buduję od zera” pozwala rozpocząć z Lite albo Pro. „Mam pomysł lub
  firmę” pozwala rozpocząć z Pro albo Firma. Pro jest wspólnym planem obu ofert.
- UX: użytkownik zmienia sytuację i plan w tym samym widoku bez przeładowania oraz
  bez przechodzenia do osobnego adresu cennika. Po niedozwolonej kombinacji wybór
  wraca do Pro. Strona płatności również pokazuje tylko dwa plany pasujące do konta.
- Kontrola: para sytuacja–plan jest sprawdzana przez akcję rejestracji, endpoint
  tworzący Stripe Checkout oraz funkcję zakładającą nowe konto w Supabase. Parametr
  adresu nie może wymusić Lite dla działającej firmy ani Firma dla osoby budującej
  od zera.
- Zakres: ograniczenie dotyczy merchandisingu i pierwszego zakupu. Nie tworzy dwóch
  produktów, nie resetuje historii i nie wprowadza opłaty za późniejszą zmianę
  kontekstu konta. W tym zakresie doprecyzowuje D023 i D030.
- Powód: plan Firma nie wnosi wartości osobie bez biznesu, a Lite może zaniżać
  oczekiwaną wartość i przychód w segmencie już pracującym nad firmą. Dwa wybory są
  prostsze do porównania niż trzy.
- Kompromis: brak Lite może obniżyć konwersję cenową wśród początkujących firm i
  samodzielnych usługodawców. Mierzymy osobno rozpoczęcie checkoutu, trial → paid,
  rezygnacje i ARPU dla obu wejść; przy słabym wyniku ponownie testujemy Lite bez
  zmiany architektury produktu.
- Odrzucono: trzy plany w obu wejściach, Firma w „Buduję od zera”, Lite w „Mam
  pomysł lub firmę” oraz zmianę oferty przez nawigację między stronami.
- Zaktualizowano: MASTER_PLAN, MVP_SPEC, PRODUCT_SPEC, UX_RULES, PRICING, rejestrację,
  stronę płatności, endpoint Stripe i migrację Supabase.

## D032 — Checkout przed potwierdzeniem adresu, bez ryzyka automatycznego obciążenia

- Data: 2026-09-05. Status: wdrożone w kodzie; wymaga testu integracyjnego Stripe
  i wklejenia szablonu do hostowanego projektu Supabase.
- Decyzja: po wysłaniu formularza rejestracji SmartFach tworzy konto i natychmiast
  kieruje użytkownika do Stripe Checkout. Nie pokazuje przed płatnością ekranu
  „sprawdź e-mail”. Adres jest potwierdzany po zapisaniu karty i przed wejściem
  do aplikacji.
- Ochrona klienta: do czasu potwierdzenia adresu webhook ustawia subskrypcję do
  zakończenia wraz z trialem. Potwierdzenie usuwa wyłącznie blokadę oznaczoną jako
  zarządzana przez SmartFach; nie cofa późniejszego anulowania wykonanego przez klienta.
- E-mail: przygotowano polski, markowy szablon potwierdzenia i możliwość ponownego
  wysłania wiadomości z ekranu aktywacji. Hostowany Supabase wymaga jednorazowego
  wklejenia szablonu, a realna sprzedaż — własnego SMTP.
- Powód: wymaganie przejścia do skrzynki między formularzem konta i Stripe tworzy
  kosztowną przerwę w najważniejszym lejku. Jednocześnie karta przypisana do
  błędnego adresu nie może zostać obciążona po trzech dniach bez dostępu do konta.
- Kompromis: konto powstaje przed ukończeniem Checkout. Po anulowaniu formularza
  użytkownik potwierdza adres i wraca do płatności po zalogowaniu; trzeba mierzyć
  liczbę takich osieroconych rejestracji i czyścić je zgodnie z polityką retencji.
- Odrzucono: wyłączenie potwierdzania adresów w Supabase, pobieranie opłaty bez
  weryfikacji adresu oraz przechowywanie hasła do czasu zakończenia płatności.
- Zaktualizowano: MASTER_PLAN, MVP_SPEC, SETUP_SUPABASE_STRIPE, rejestrację,
  ekran sukcesu, callback Auth, webhook Stripe i testy reguły odnowienia.

## D033 — Stałe Preview i wspólny backend wyłącznie na etapie alfy

- Data: 2026-09-06. Status: częściowo zastąpiona przez D034 w zakresie Local.
- Decyzja: bieżąca praca trafia najpierw na stałą gałąź `preview`. Po lokalnej
  weryfikacji Vercel tworzy wdrożenie Preview; dopiero zaakceptowany stan jest
  łączony z `main` i publikowany pod `smartfach.pl`.
- Środowisko alfy: przed pierwszymi realnymi klientami Local, Preview i Production
  mogą korzystać z jednego hostowanego Supabase oraz Stripe Sandbox. `.env.local`
  pozostaje prywatną konfiguracją połączenia, a nie osobną lokalną bazą danych.
- Granica: wspólne środowisko nie może pozostać po uruchomieniu Stripe Live lub
  zapisaniu danych realnych klientów. Przed tym momentem tworzymy oddzielny backend
  testowy dla Local/Preview i produkcyjny dla `main`.
- Powód: founder i Codex mogą testować pełny przepływ na wdrożonym adresie bez
  ręcznego odtwarzania wszystkich usług lokalnie, a `smartfach.pl` nie zmienia się
  przed akceptacją.
- Kompromis: migracja lub test na wspólnej bazie może wpłynąć także na obecną wersję
  Production. Do czasu rozdzielenia środowisk dopuszczamy wyłącznie kompatybilne
  migracje i nie kierujemy płatnego ruchu na aplikację.
- Odrzucono: codzienną pracę bezpośrednio na `main`, całkowite usunięcie `.env.local`
  oraz utrzymywanie trzech osobnych backendów jeszcze przed realnymi użytkownikami.
- Zaktualizowano: README, TECH_STACK, SETUP_SUPABASE_STRIPE i DECISIONS.

## D034 — Tylko Preview i Live, bez lokalnego runtime

- Data: 2026-09-06. Status: przyjęta przez foundera i wdrożona w procesie pracy.
- Decyzja: SmartFach ma dwa uruchomione środowiska: Vercel Preview z gałęzi
  `preview` oraz Live z gałęzi `main`. Nie uruchamiamy aplikacji, Supabase, Stripe
  ani AI lokalnie. Lokalny checkout jest wyłącznie kopią roboczą kodu niezbędną do
  przygotowania commita i kontroli statycznej.
- Sekrety: wszystkie wartości aplikacji są konfigurowane tylko w Vercelu. Projekt
  nie utrzymuje `.env.local`; `.env.example` jest wyłącznie katalogiem nazw.
- Wdrożenie: każda zmiana najpierw trafia na `preview`. Dopiero po sprawdzeniu
  wdrożonego adresu jest łączona z `main` i trafia na `smartfach.pl`.
- Etap alfy: Preview i Live mogą tymczasowo używać jednego hostowanego Supabase
  oraz Stripe Sandbox, ponieważ nie obsługują jeszcze prawdziwych płatności i danych.
- Bramka: przed Stripe Live lub pierwszymi realnymi klientami powstają oddzielne
  konfiguracje testowa i produkcyjna. Bez tego test Preview mógłby zmienić dane Live.
- Powód: dwa widoczne środowiska są prostsze dla foundera, a pełne integracje dają
  się sprawdzać w warunkach zbliżonych do rzeczywistego hostingu.
- Kompromis: diagnostyka jest wolniejsza, bo każda zmiana wymaga wdrożenia Preview,
  a awaria wspólnego backendu dotyczy obu wersji. Akceptujemy to wyłącznie przed
  realnym ruchem i stosujemy kompatybilne migracje.
- Zastępuje D033 w zakresie lokalnego runtime, `.env.local` i Local jako środowiska.
- Zaktualizowano: AGENTS, README, TECH_STACK, SETUP_SUPABASE_STRIPE, ROADMAP,
  `.env.example` i DECISIONS.

## D035 — Jedna kanoniczna domena i indeksowanie wyłącznie Live

- Data: 2026-09-06. Status: SEO wdrożone na `preview`; przekierowanie oczekuje na
  ręczną konfigurację w Vercelu i późniejszą weryfikację.
- Decyzja: `https://smartfach.pl` jest jedyną kanoniczną domeną publiczną.
  Trwałe przekierowanie 308 z `smartfachpl.vercel.app` jest konfigurowane przez
  foundera bezpośrednio w Vercelu, a nie w kodzie aplikacji.
- Indeksowanie: publiczne strony mogą być indeksowane wyłącznie, gdy Vercel buduje
  środowisko Production. Preview zwraca blokadę dla robotów i nie publikuje adresów
  w sitemapie. Prywatne ścieżki aplikacji pozostają `noindex` oraz są wyłączone
  w `robots.txt`.
- SEO: każda publiczna podstrona wskazuje własny canonical w `smartfach.pl`, a
  `sitemap.xml` zawiera wyłącznie publiczne strony sprzedażowe i prawne.
- Powód: publiczny alias Vercela nie może konkurować z domeną marki, a dotychczasowe
  globalne `noindex` blokowało także landing i uniemożliwiało organiczne pozycjonowanie.
- Kompromis: po publikacji Live publiczne landingi stają się dostępne dla wyszukiwarek,
  więc każda późniejsza zmiana ich treści wymaga świadomego przeglądu SEO i prawnego.
- Odrzucono: usunięcie technicznej domeny Vercela, pozostawienie dwóch kopii oraz
  włączenie indeksowania Preview.
- Zaktualizowano: metadata, robots, sitemap, testy, README, MVP_SPEC i DECISIONS.

## D036 — Konto administratora poza lejkiem płatniczym

- Data: 2026-09-06. Status: wdrożone w kodzie na Preview.
- Konto właściciela platformy jest identyfikowane przez chroniony UUID, z
  możliwością użycia skonfigurowanego adresu e-mail.
- Wejście administratora do `/app` i `/platnosc` przekierowuje do `/admin`;
  konto nie jest liczone jako klient i nie wymaga abonamentu.
- Anulowanie abonamentu działa z końcem okresu i można je cofnąć. Trwałe
  usunięcie konta wymaga ponownego wpisania adresu e-mail, najpierw anuluje
  Stripe, a następnie usuwa dane firmy. Konto właściciela zespołu nie może być
  usunięte, dopóki organizacja ma innych aktywnych członków.
- Każda operacja administracyjna tworzy wpis audytowy.
- Odrzucono bezpośrednie usuwanie rekordów z panelu Supabase: groziłoby ono
  pozostawieniem aktywnej subskrypcji Stripe lub osieroconych danych.

## D037 — Jeden produkt do budowania przychodu z usługi

- Data: 2026-09-06. Status: wdrożone w kodzie na gałęzi Preview; wymaga walidacji
  z realnymi użytkownikami przed publikacją Live.
- Decyzja: publiczny SmartFach rezygnuje z trzech etapów Odkryj/Uruchom/Prowadź
  i segmentu Firma. Pomaga jednej osobie dopasować prostą usługę do jej warunków,
  zbudować ofertę oraz wykonywać kolejne działania prowadzące do pierwszych klientów.
- Personalizacja: produkt od początku pyta o pracę zdalną/lokalną, czas, budżet,
  doświadczenie, umiejętności i rzeczy, których użytkownik nie chce robić. Brak
  sprecyzowanych umiejętności nie blokuje procesu, ale wymagane kompetencje i nauka
  muszą być komunikowane uczciwie.
- Oferta: publicznie dostępne są tylko Lite 49 zł i Pro 99 zł. Plan Firma oraz
  moduły klientów, cennika, wycen, protokołów i zespołu pozostają w kodzie dla
  kompatybilności, ale ich rozwój trafia do Parking Lot i nie jest sprzedawany.
- Komunikacja: główna obietnica dotyczy pierwszej sprzedawalnej usługi i klienta,
  a 10 000 zł miesięcznego przychodu jest celem do przeliczenia na działania, nie
  gwarancją wyniku ani terminu. Nie używamy obietnic łatwego/pasywnego dochodu,
  fikcyjnych dowodów, ukrytych warunków ani agresywnej sprzedaży opartej na oszustwie.
- Wartość abonamentu: SmartFach nie kończy pracy na wygenerowaniu planu. Pętla to
  działanie, wynik, aktualizacja oferty lub kanału i kolejne działanie.
- Powód: jeden problem i jedno wejście powinny zmniejszyć tarcie komunikacyjne,
  przyspieszyć test reklam oraz pozwolić pozyskać użytkownika przed założeniem firmy.
- Kompromis: produkt traci część wyróżnika branżowego HVAC i mocniej konkuruje ze
  zwykłym AI, kursami i mentorami. Jeśli nie pokaże retencji opartej na wykonanych
  działaniach, wracamy do węższego workflow zamiast budować generycznego coacha.
- Odrzucono: równoległą sprzedaż osobom bez pomysłu, fachowcom i zespołom; dalsze
  eksponowanie planu Firma; obietnice gwarantowanego zarobku; usunięcie gotowych
  modułów firmowych przed wynikiem eksperymentu.
- Zaktualizowano: MASTER_PLAN, MVP_SPEC, PRODUCT_SPEC, UX_RULES, AI_ARCHITECTURE,
  PRICING, ROADMAP, landingi, cennik, rejestrację, ustawienia i prompt asystenta.

## D038 — Jeden profil użytkownika również w danych i płatnościach

- Data: 2026-09-07. Status: wdrożone w kodzie i wspólnym testowym Supabase;
  oczekuje na wdrożenie gałęzi Preview oraz test akceptacyjny.
- Decyzja: użytkownik nie wybiera typu konta podczas rejestracji, w URL, ustawieniach,
  rozmowie ani panelu administratora. Wszystkie konta korzystają z jednego procesu
  budowania własnego przychodu.
- Dane: techniczna kolumna `account_type` pozostaje przejściowo wyłącznie po to, aby
  starsze wdrożenie nie przestało działać. Ma jedyną wartość `builder`. Pola
  `journey.mode` i `conversation.mode` są usuwane z istniejących workspace bez
  usuwania rozmów.
- Płatności: jedynymi planami runtime i bazy są Lite oraz Pro. Ewentualny historyczny
  plan Firma jest normalizowany do Pro; cena Stripe i termin wymagają ręcznej kontroli
  przed użyciem Stripe Live.
- Aplikacja: główna nawigacja zawiera Asystenta, rozmowy i Ustawienia. Moduły firmy
  nie mają aktywnego wejścia; ich historyczne schematy pozostają czasowo w danych.
- Powód: ukrycie dawnych etykiet nie wystarczało — rozgałęzienia nadal wpływały na
  onboarding, checkout, pamięć rozmów, panel administratora i walidację zapisu.
- Kompromis: organizacja i część pól workspace pozostają jako techniczna granica RLS
  i warstwa zgodności. Usuwamy je dopiero po migracji obu środowisk i eksporcie kopii.
- Zastępuje D023, D030 i D031 w zakresie typów kont oraz D037 w zakresie technicznego
  utrzymywania planu Firma w runtime. Historyczne uzasadnienia pozostają w rejestrze.

## D039 — Limit oparty na koszcie i płatne zwiększenia

- Data: 2026-09-07. Status: wdrożone w kodzie na gałęzi Preview; migracja wspólnego
  Supabase i pełny test Stripe oczekują na wykonanie.
- Decyzja: użytkownik widzi procent miesięcznego limitu, a nie tokeny modelu, dolary
  ani techniczne kredyty. Naliczanie odbywa się po stronie serwera na podstawie
  zmierzonego kosztu OpenRouter; przeglądarka nie może samodzielnie zwiększać ani
  zmniejszać użycia.
- Budżet: Lite otrzymuje wewnętrzny budżet 2,25 USD, Pro 5,50 USD. Odrzucono 10/20 USD,
  ponieważ przy cenach 49/99 zł brutto zjadałoby to niemal cały przychód po VAT i Stripe.
- Zwiększenia: 19,99 zł / 1,50 USD, 49,99 zł / 4 USD i 129,99 zł / 11 USD wewnętrznego
  budżetu. Są jednorazowe, nie zmieniają abonamentu i niewykorzystana część przechodzi
  na kolejny okres.
- Bezpieczeństwo: Checkout ma serwerowo ustaloną kwotę i pakiet, a księgi zakupów i
  użycia mają unikalne klucze idempotencji. Webhook i strona powrotu weryfikują status,
  właściciela, walutę oraz kwotę przed dopisaniem limitu.
- Odnowienie: początek okresu pochodzi ze Stripe. Miesięczny limit wraca do zera,
  lecz wykorzystana część płatnego zwiększenia nie jest przywracana.
- Kompromis: jedna jednostka odpowiada 0,01 USD i zaokrągla koszt w górę; jest to
  prostsze i bezpieczniejsze dla alfy niż obietnica konkretnej liczby wiadomości.
  Progi muszą zostać skalibrowane na 30–50 realnych płatnych kontach.

## D040 — Tekst i zdjęcia w MVP; Qwen3.7 Flash do testu kosztowego

- Data: 2026-09-07. Status: przygotowane na gałęzi Preview; wymaga testu
  akceptacyjnego przed zmianą modelu na Live.
- Decyzja: usuwamy nagrywanie głosu z obecnego interfejsu, API i komunikacji
  sprzedażowej. Asystent przyjmuje tekst oraz maksymalnie trzy zdjęcia.
- Model: `qwen/qwen3.7-flash` jest kandydatem do testu na Preview ze względu na
  niski koszt, obsługę obrazu, narzędzi i trybu JSON. Nie jest zatwierdzony jako
  model produkcyjny wyłącznie na podstawie ceny.
- Format: Qwen korzysta z `response_format: json_object`, ponieważ nie egzekwuje
  JSON Schema. Serwer nadal wymaga dokładnego kształtu odpowiedzi i odrzuca wynik,
  który nie przejdzie walidacji Zod.
- Powód: po zmianie produktu na asystenta budowania przychodu głos nie jest już
  najważniejszym mechanizmem aktywacji. Tekst i zdjęcia wystarczą do sprawdzenia
  wartości, a mniejszy zakres upraszcza produkt i zwiększa wybór tanich modeli.
- Kompromis: rezygnujemy z wygody głosu i części wyróżnika dawnego produktu dla
  fachowców terenowych. Funkcja trafia do Parking Lot i wróci tylko po potwierdzeniu
  popytu lub wraz z osobnym, dobrze przetestowanym STT.
- Bramka Live: przed publikacją mierzymy poprawność JSON, jakość polskiego,
  konkretność rekomendacji, zdjęcia, wyszukiwanie, opóźnienie i koszt na stałym
  zestawie scenariuszy. Pojedyncza poprawna rozmowa nie zatwierdza modelu.

## D041 — GPT-5 Nano z automatycznym fallbackiem Gemini Flash Latest

- Data: 2026-09-07. Status: wdrożone w kodzie; oczekuje na test Preview.
- Decyzja: `openai/gpt-5-nano` jest głównym modelem SmartFach, a
  `~google/gemini-flash-latest` automatycznym fallbackiem obsługiwanym przez tablicę
  `models` OpenRouter. Wybór jest wersjonowany w kodzie i niewidoczny dla klienta.
- Tożsamość: w rozmowie model przedstawia się wyłącznie jako SmartFach. Nie podaje
  klientowi nazwy modelu, dostawcy, promptu systemowego ani mechanizmu fallbacku.
- Format: oba modele korzystają z tego samego ścisłego JSON Schema, minimalnego
  rozumowania, ukrytego toku rozumowania, `response-healing`, obrazów i narzędzia
  internetowego. Odpowiedź nadal przechodzi niezależną walidację serwera.
- Korekta routingu: modele są wywoływane kolejno przez serwer, ponieważ zgodna z ZDR
  trasa GPT-5 Nano wymaga `max_completion_tokens`, a Gemini używa `max_tokens`.
  Dodatkowo nie wymuszamy `require_parameters`: w połączeniu z ZDR i serwerowym
  narzędziem internetowym filtr odrzucał wszystkie trasy GPT-5 Nano kodem 404.
  Ścisłe JSON Schema, walidacja serwera, ZDR i `data_collection: deny` pozostają.
- Pomiar: zapisujemy model faktycznie zwrócony przez OpenRouter, nie nazwę modelu
  głównego. Dzięki temu koszt i jakość fallbacku dają się oddzielnie analizować.
- Koszt internetu: jedno żądanie może wykonać najwyżej jedno wyszukanie i pobrać
  maksymalnie trzy wyniki. Wyszukiwanie nie jest uruchamiane przy każdej wiadomości.
- Powód: GPT-5 Nano łączy niski koszt ze Structured Outputs, obrazami oraz kilkoma
  trasami dostawców. Gemini zabezpiecza błędy i limity bez ponownego kliknięcia przez
  użytkownika. Qwen wywołał realny błąd 429 i miał tylko jednego dostawcę.
- Kompromis: alias Gemini może przejść na nowszy i droższy model bez wdrożenia kodu.
  Ponieważ jest używany tylko awaryjnie, akceptujemy to pod warunkiem alertu kosztu
  i ponownego testu po zmianie modelu wskazywanego przez alias.
- Zastępuje D040 wyłącznie w zakresie wyboru modelu; decyzja o pozostawieniu tekstu
  i zdjęć bez głosu pozostaje aktualna.

## D042 — Dokumenty umowy, dane operatora i instalacja PWA

- Data: 2026-09-08. Status: implementacja i migracje; bramki uruchomienia sprzedaży
  pozostają w `LAUNCH_CHECKLIST.md`.
- Decyzja: jedno źródło treści dokumentów; jawne warunki trialu, ceny całkowite,
  limity, odrębne żądanie rozpoczęcia usługi i zachowane prawa konsumenta.
- Każdy nowy zakup zapisuje ofertę i niezmienną kopię dokumentów. Potwierdzenie
  wysyła aplikacja przez SMTP, niezależnie od e-maili Supabase. Brak SMTP blokuje
  nowe Checkout Live. Odrzucono sam link do zmiennej strony zamiast kopii umowy.
- Dane działalności są edytowalne tylko przez administratora, z audytem.
  Nie zmienia to dawnych potwierdzeń ani tożsamości sprzedawcy w Stripe.
- Formularz odstąpienia zapisuje oświadczenie i potwierdzenie; właściciel ręcznie
  rozpatruje je i rozlicza w Stripe. Nie automatyzujemy decyzji o zwrocie.
- PWA instalowana z witryny: bez sklepu i bez nowej opłaty. Asystent nadal wymaga
  internetu. Cache obejmuje tylko publiczny ekran offline, nie dane klientów.
- Kompromis: nowa konfiguracja SMTP i obowiązek codziennej obsługi zgłoszeń;
  mniejszy zakres niż pełny moduł fakturowania, supportu i aplikacje natywne.
- MASTER_PLAN bez zmiany strategii — to domknięcie zakupu i dostępu do produktu.

## D043 — Start prowadzący do działania, procentowe limity i routing jakości

- Data: 2026-09-08. Status: wdrożone w kodzie; wymaga testu E2E na Preview.
- Start rozmowy: nowa rozmowa pokazuje krótki profil z odpowiedziami pojedynczego
  i wielokrotnego wyboru oraz polem dodatkowych informacji. Zatwierdzenie wysyła
  dane bezpośrednio do kontrolowanego trybu `guided_start`; nie uzupełnia pola czatu.
  Asystent porównuje najwyżej trzy kierunki, rekomenduje jeden i zaczyna pierwsze
  działanie. Osobny przycisk omija profil i otwiera zwykłe pytanie.
- Limity: klient widzi wyłącznie procent miesięcznego limitu. Zwiększenia wynoszą
  +25% za 19,99 zł, +50% za 29,99 zł oraz +100% za 59,99 zł. Procent jest przeliczany
  na wewnętrzny budżet aktywnego planu przy tworzeniu Checkout i ponownie sprawdzany
  po płatności. Podstawowe pule Lite/Pro pozostają bez zmiany do czasu danych o użyciu.
- Modele: zwykła rozmowa korzysta z `openai/gpt-5.6-luna`; `guided_start`, obrazy,
  długie wiadomości i rozpoznane złożone zadania trafiają do
  `openai/gpt-5.6-terra`. `google/gemini-3.5-flash` pozostaje awaryjnym fallbackiem
  innego dostawcy. Nie wywołujemy trzech modeli równolegle.
- Powód: Nano jest zoptymalizowane przede wszystkim pod proste streszczenia i
  klasyfikację, a nie kluczową rekomendację biznesową. Stały Gemini zamiast aliasu
  `latest` ogranicza niekontrolowaną zmianę kosztu i zachowania. Cross-provider
  fallback chroni dostępność lepiej niż trzy modele jednego dostawcy.
- Koszt: routing zachowuje istniejący twardy budżet planu, więc lepszy model może
  wykorzystać większy procent przy trudnym zadaniu, ale nie tworzy nieograniczonego
  kosztu. Jakość oceniamy przez Task Success Rate, nie liczbę wiadomości.
- Zastępuje D041 w wyborze i routingu modeli oraz D039 w publicznej prezentacji
  i cenach zwiększeń. Historyczne uzasadnienia i wewnętrzna księga pozostają.

## D044 — Domknięte odzyskiwanie dostępu i niezależny test poczty

- Data: 2026-09-08. Status: wdrożone w kodzie na gałęzi Preview; wymaga testu
  dwóch wiadomości po wdrożeniu.
- Decyzja: `/logowanie` rozpoznaje aktywną sesję i prowadzi administratora do
  `/admin`, a klienta do aplikacji. Panel właściciela ma jawne wylogowanie.
- Odzyskiwanie hasła korzysta z mechanizmu Supabase Auth, bez ujawniania, czy
  podany adres istnieje. Link prowadzi przez kontrolowany callback do osobnej
  strony ustawienia nowego hasła.
- Poczta: panel administratora pozwala wysłać bezpieczną wiadomość testową przez
  SMTP aplikacji. Nie mylimy jej z e-mailami Supabase ani potwierdzeniem umowy,
  które powstaje dopiero po ukończeniu Stripe Checkout i webhooku.
- UX konta: profil działania i ustawienia konta tworzą dwie rzeczywiste kolumny
  na desktopie; plan, instalacja, dane i bezpieczeństwo są pogrupowane w osobne
  karty bez pustej połowy ekranu.
- Powód: brak odzyskiwania hasła i brak możliwości odróżnienia awarii SMTP od
  awarii webhooka blokowały gotowość sprzedażową. Zmiana nie rozszerza obietnicy
  produktu i nie wymaga aktualizacji MASTER_PLAN.

## D045 — Profil tylko raz, nowe rozmowy zaczynają się od zadania

- Data: 2026-09-08. Status: wdrożone w kodzie na gałęzi Preview; wymaga testu E2E.
- Decyzja: formularz warunków pojawia się tylko przed pierwszym prowadzonym startem.
  Jego wynik jest zapisywany jako trwały profil konta przed wywołaniem AI. Każda
  kolejna nowa rozmowa pokazuje wybór aktualnego zadania: znalezienie klientów,
  dopracowanie oferty, plan działań, analiza wyniku albo własne pytanie.
- Ustawienia są miejscem późniejszej edycji profilu, a nie drugim onboardingiem.
  Obejmują stałe informacje: czas, doświadczenie, ograniczenia, cel i bieżący fokus.
  Nie powtarzają preferencji zdalnie/lokalnie zbieranej przy rozpoczęciu pracy.
  Zwykłe pytanie można zadać także bez zakończenia profilu startowego.
- Powód: ponawianie tych samych pytań w każdej rozmowie tworzyło tarcie i sugerowało,
  że SmartFach nie pamięta użytkownika. Jednorazowy profil buduje ciągłość, a wybór
  bieżącego zadania skraca drogę do wartości subskrypcyjnej.
- Trade-off: profil może się zdezaktualizować, dlatego pozostaje jawnie edytowalny.
  Nie budujemy jeszcze automatycznej pamięci wyciągającej trwałe fakty z każdej rozmowy.
- Zastępuje D043 wyłącznie w zasadzie pokazywania profilu w każdej nowej rozmowie.
  Routing modeli i limity z D043 pozostają bez zmiany. Zaktualizowano MASTER_PLAN.

## D046 — Dostęp do limitu dopiero po pełnej aktywacji konta

- Data: 2026-09-08. Status: wdrożone w kodzie na gałęzi Preview; wymaga testu E2E.
- Decyzja: wszystkie serwerowe wejścia do aplikacji, workspace i AI wymagają
  potwierdzonego adresu e-mail oraz abonamentu `trialing` lub `active` z metodą
  płatności potwierdzoną na podstawie danych Stripe. Trial musi mieć przyszłą datę
  zakończenia. Sam status `trialing` nie daje już dostępu.
- Logowanie jawnie odrzuca konto bez potwierdzonego adresu. Widok płatności nie
  nazywa abonamentu aktywnym, jeżeli brakuje metody płatności, i prowadzi do Stripe.
- Subskrypcja użytkownika, który nie potwierdzi e-maila, pozostaje ustawiona do
  zakończenia wraz z trialem. Nie obciążamy go po próbie, ale nie anulujemy jej
  natychmiast, aby mógł dokończyć poprawną aktywację w okresie próbnym.
- Powód: kontrola wyłącznie w interfejsie albo sam status subskrypcji nie chronią
  kosztu AI. Bramka musi działać po stronie serwera przed odczytem danych i wywołaniem
  modelu. Nie wymaga zmiany MASTER_PLAN — domyka wcześniej przyjęty model trialu.

## D047 — Jednoznaczny powrót z płatności i zapasowe potwierdzenie umowy

- Data: 2026-09-08. Status: wdrożone w kodzie na gałęzi Preview; wymaga nowego
  testowego Checkout i kontroli webhooka po wdrożeniu.
- Decyzja: wynik zakupu abonamentu i zwiększenia limitu korzysta ze wspólnego,
  wyśrodkowanego ekranu marki z nagłówkiem, postępem, kontaktem i informacją o
  bezpieczeństwie. Wejście bez `session_id` nie udaje trwającej weryfikacji, tylko
  wyjaśnia brak danych zamówienia.
- Potwierdzenie umowy nadal wysyła przede wszystkim webhook Stripe. Prawidłowy
  powrót po ukończonym Checkout idempotentnie ponawia zapis i dostarczenie wiadomości,
  aby opóźniony webhook nie pozostawił użytkownika bez potwierdzenia.
- Powód: test SMTP nie obejmuje zdarzeń Stripe, a surowy adres strony sukcesu bez
  identyfikatora wprowadzał w błąd. Dwie niezależne okazje do wywołania tej samej,
  zabezpieczonej operacji zwiększają niezawodność bez podwójnego przyznania dostępu.
- Trade-off: prawdziwa awaria webhooka może zostać częściowo zamaskowana, dlatego
  HTTP 200 zdarzeń i `email_sent_at` nadal są obowiązkową częścią testu sprzedaży.
  Zmiana nie wymaga aktualizacji MASTER_PLAN.

## D048 — Progresywna instalacja PWA zamiast jednego fałszywego przebiegu

- Data: 2026-09-08. Status: wdrożone w kodzie; wymaga testu na fizycznym iPhonie
  i urządzeniu z Androidem po publikacji.
- Decyzja: na Androidzie, Chrome i Edge używamy natywnego okna instalacji uruchamianego
  przyciskiem, jeśli przeglądarka udostępni `beforeinstallprompt`. Na iPhonie i iPadzie
  pokazujemy cztery krótkie kroki Safari, ponieważ iOS nie udostępnia stronie
  automatycznego wywołania instalacji PWA.
- Strona `/pobierz` sama rozpoznaje urządzenie, ale pozwala przełączyć instrukcję
  między iPhone/iPad, Androidem i komputerem. Przeglądarki Facebooka, Instagrama
  i TikToka dostają najpierw jawny krok przejścia do Safari lub Chrome.
- Powód: jeden generyczny komunikat był technicznie nieprawdziwy na iOS i mało pomocny
  na urządzeniach, na których przeglądarka nie pokazuje natywnego promptu.
- Trade-off: instalacja na iOS nadal wymaga kilku działań użytkownika. Nie wdrażamy
  eksperymentalnego elementu instalacji Chrome ani aplikacji natywnych. Bez zmiany
  MASTER_PLAN — dopracowano istniejącą funkcję PWA.

## D049 — Współbieżne potwierdzenie zakupu jest poprawnym ponowieniem

- Data: 2026-09-08. Status: wdrożone w kodzie; wymaga ponowienia zdarzenia Sandbox.
- Decyzja: równoległe przetwarzanie tego samego zakupu przez webhook Stripe i stronę
  sukcesu nie jest błędem, jeśli druga ścieżka już zarezerwowała wysyłkę tej samej
  zapisanej umowy. Analogicznie konflikt rewizji workspace jest uznawany za
  zakończony tylko wtedy, gdy ponowny odczyt potwierdza dokładnie oczekiwany stan
  rozliczeń.
- Powód: Stripe może dostarczyć zdarzenie równolegle z powrotem klienta z Checkout.
  Dotychczas e-mail dochodził poprawnie, ale druga ścieżka zwracała HTTP 500,
  przez co Stripe niepotrzebnie oznaczał dostarczenie jako nieudane i ponawiał je.
- Trade-off: aktywna rezerwacja dostarczenia jest traktowana jako praca wykonywana
  przez drugi proces. Dwuminutowa dzierżawa i ręczne ponowienie webhooka nadal
  chronią przypadek przerwanej wysyłki. Bez zmiany MASTER_PLAN.

## D050 — Zgodny z ZDR routing modeli i usunięcie Terra z bieżącego produktu

Korekta po ponownym błędzie Production o 21:46: sama zmiana parametru limitu nie
rozwiązała 404. Wcześniejsza diagnoza była hipotezą, nie potwierdzoną przyczyną.
Wyłączono `require_parameters`, zachowując ZDR i `data_collection: deny` oraz
walidację wyniku. Dodano bezpieczną klasyfikację błędu dostawcy w logach.
Skuteczność wymaga rzeczywistego wywołania z produkcyjnym kluczem.

- Data: 2026-09-08. Status: wdrożone w kodzie; wymaga testu rozmowy na Production.
- Decyzja: zwykłe zadania obsługuje `openai/gpt-5-nano`, start biznesu, zdjęcia,
  długie wiadomości i złożone zadania `openai/gpt-5.6-luna`, a awaryjny fallback
  innego dostawcy to stały `google/gemini-3.8-flash`.
- Przyczyna błędu: identyfikator Terra był prawidłowy. Przy włączonym ZDR OpenRouter
  pozostawiał trasę Azure wymagającą `max_completion_tokens`, lecz adapter wysyłał
  `max_tokens`. `require_parameters: true` odfiltrowywało wszystkie zgodne trasy,
  dlatego główny model zwracał 404, a każdą odpowiedź wykonywał Gemini.
- Implementacja: modele OpenAI otrzymują `max_completion_tokens`, Gemini
  `max_tokens`. ZDR, brak zgody na retencję danych, ścisły schemat i serwerowa
  walidacja pozostają bez zmian.
- Ekonomia: Terra jest około dziesięć razy droższa od Luny i nie ma jeszcze
  potwierdzonej przewagi w Task Success Rate. Wraca dopiero po kontrolowanym
  benchmarku uzasadniającym koszt. Zastępuje D043 w zakresie wyboru modeli;
  MASTER_PLAN bez zmiany.

## D051 — Trwała rezerwacja kosztu, odzyskiwalne płatności i jawna gotowość wdrożenia

- Data: 2026-09-09. Status: implementacja i testy w repozytorium; migracja zdalna
  oraz testy pełnego checkoutu/AI wymagają połączenia z usługami. Nie oznacza live-ready.
- AI: dopuszczenie w transakcji przed generacją, stabilny klucz próby, wynik do replay,
  jedno naliczenie. Odrzucono limit w pamięci procesu i ponowne wywołanie po timeoutcie.
  Niepewne próby wymagają audytowanej decyzji administratora; to celowy kompromis
  dostępności na rzecz ochrony kosztów. Wywołanie ponad resztę puli pokrywa operator.
- Stripe: wygasające blokady z tokenami, odczyt aktualnej subskrypcji po blokadzie,
  atomowy snapshot i odnowienie limitu. Wysyłka umowy w toku nie może oznaczać
  przetworzonego webhooka. Odrzucono bezterminowe locki i dwa niezależne zapisy salda/statusu.
- Jednorazowa próba na konto, trwały checkout i ochrona przed odtworzeniem
  niepewnego zakupu po wygaśnięciu klucza Stripe. Nie jest to pełny antyfraud wielu kont.
- Izolacja: Stripe Live wymaga powiązania Production z własną bazą. Preview
  ze wskazaniem bazy Production jest blokowane zamiast cichego dostępu do realnych danych.
- Metryki: pierwszy etap na konto + koszt SQL + alerty operacyjne. Odrzucono
  fałszywe współczynniki konwersji oraz dodawanie reklamowych trackerów bez decyzji właściciela.
- Marketing: dokładny opis profilu i krótkiego kontekstu, bez obietnicy pełnej
  pamięci wszystkich czatów i bez niepopartej danymi etykiety „najczęściej wybierany”.
- MASTER_PLAN zaktualizowany: rzeczywisty routing, granice pamięci i jednorazowa próba.

## D052 — Czytelne odpowiedzi zamiast jednego bloku tekstu

- Data: 2026-09-09. Odpowiedzi asystenta renderujemy przez react-markdown,
  bez HTML i osadzanych mediów, z linkami wyłącznie HTTP(S).
- Pole reply nadal jest walidowanym ciągiem JSON; instrukcje wymagają akapitów,
  list i oszczędnych nagłówków. Nie zmieniamy modeli ani rozliczania kosztów.
- Odrzucono automatyczne przepisywanie historycznych odpowiedzi: generowałoby
  dodatkowy koszt i mogłoby zmienić znaczenie. Istniejący Markdown jest renderowany,
  ale dawny zwykły tekst nie jest ponownie generowany.
- MASTER_PLAN bez zmiany; doprecyzowanie UX_RULES, nie zmiana strategii.

## D053 — Czytelne operacje i kontakt w sprawie rozliczeń

- Data: 2026-09-09. Panel rozdziela etapy aktywacji (30 dni) od bieżących
  nierozwiązanych webhooków i prób AI. Wspólny kontener zapewnia stałe odstępy
  między panelem operacji i obsługą umów; puste stany nie udają pełnego testu systemu.
- E-mail operatora jest eksponowany w kontakcie, odstąpieniu i obsłudze umów.
  Rozliczenia/zwroty pozostają ręczne w Stripe. Anulowanie odnowienia pozostaje
  samoobsługowe. Nie zmieniono warunków umów ani zapisanych akceptacji.
- Nie usunięto formularza odstąpienia: art. 11a dyrektywy 2011/83/UE dodany przez
  2023/2673 przewiduje funkcję odstąpienia online; termin stosowania zmian to
  19.06.2026. Status polskiej transpozycji nie został potwierdzony w tym przeglądzie,
  dlatego usunięcie istniejącej funkcji wymaga odrębnej weryfikacji prawnej.
  Źródło: https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX%3A32023L2673
- Kompromis: pozostaje mały moduł przyjmowania oświadczeń, bez automatycznych
  zwrotów. Wiadomości wysłane bezpośrednio e-mailem nie są synchronizowane z panelem.
- MASTER_PLAN bez zmiany — dopracowanie istniejącego panelu i kontaktu.

## D054 — Jedna widoczna pula i historia zakupów limitu

- Data: 2026-09-09. Decyzja foundera: zakup powiększa jeden widoczny limit,
  np. 100% + 25% = 125%, bez osobnego licznika „dodatkowego zapasu”.
- Pasek mierzy zużycie względem całej puli, etykiety względem bazowego planu.
  Procenty są przybliżeniem; finansowe rozliczenie pozostaje w jednostkach całkowitych.
- Zachowano istniejące przenoszenie niewykorzystanego dodatku i idempotentne
  przyznawanie przez Stripe. Zużyte dodatki nie wracają przy odnowieniu. Brak migracji.
- Panel administratora czyta istniejącą księgę usage_top_ups: liczbę zakupów,
  historyczne kwoty i przyznania, pozostały zapas oraz całkowity limit okresu.
  Nie wyliczamy historycznych zakupów z obecnego salda ani z aktualnego cennika.
- MASTER_PLAN bez zmiany; zaktualizowano PRICING. Ceny i budżety bez zmiany.

## D055 — Trwała kolejka potwierdzeń bez SMTP w odpowiedzi webhooka

- Data: 2026-09-09. Po zgłoszonym timeoutcie oddzielono zapis zakupu i umowy
  od wysyłki. HTTP 200 oznacza zapisany efekt finansowy i trwały rekord umowy,
  a nie dostarczenie e-maila. Zastępuje D051 w zakresie oczekiwania webhooka na SMTP.
- Istniejące purchase_contracts pełni rolę outbox: zapis przed odpowiedzią,
  pierwsza wysyłka przez Next after, odzyskiwanie przez chroniony cron co 2 minuty.
  Brak nowych tabel lub migracji, brak zmian ceny, limitów i treści warunków.
- Zachowano atomową 2-minutową rezerwację wysyłki; nieudana próba pozostawia
  czas rezerwacji jako opóźnienie przed kolejną próbą. Cron pobiera do 5 rekordów,
  zaczynając od niepodjętych, następnie najdawniej podejmowanych. SMTP ma 45 s
  maksymalnego czasu próby. Sukces jest oznaczany warunkowo dla danej rezerwacji.
- Panel osobno liczy umowy bez potwierdzenia wysyłki od ponad 10 minut.
  Cron wymaga CRON_SECRET i poprawnej tożsamości środowiska bazy.
- Kompromis: SMTP nie zapewnia exactly-once. Przy przyjęciu e-maila i awarii zapisu
  znacznika może dotrzeć ponownie ta sama kopia (stały Message-ID). Płatność i limit
  pozostają idempotentne niezależnie od liczby wysyłek. Nie udajemy dostarczenia
  do skrzynki odbiorczej — znacznik potwierdza przyjęcie przez serwer SMTP.
- Przed ruchem płatnym kontrolujemy pierwsze wywołanie cron w Production oraz
  ponowienie rzeczywistego zdarzenia testowego. MASTER_PLAN bez zmiany strategii.

## D056 — Kontrakt czatu, sprawniejszy Checkout i aktywacja na domenie marki

- Data: 2026-09-09. Zgłoszenie produkcyjne: invalid-schema, powolne przejście do
  Stripe i problem instalacji Chrome / surowy redirect Supabase w Firefoksie.
- AI: minimalny schemat reply zamiast wycen/protokołów. Tolerujemy brak dawnych pól;
  nie wykonujemy żadnych ich instrukcji. Odebrany błędny wynik zwalnia rezerwację
  bez obciążenia użytkownika, w odróżnieniu od niepewnego timeoutu. Operator pokrywa
  koszt wadliwego wyniku. Nie obiecujemy zerowej awaryjności dostawców.
- Checkout: usunięto powtórny odczyt Auth i subskrypcji przed usługą, która już
  sprawdza je pod blokadą; odczyt ceny równolegle z danymi konta. Statystyki
  rejestracji/otwarcia płatności po odpowiedzi. Zachowano zgodę, kontrolę cen,
  właściciela, blokady i trwałe klucze Stripe. UI natychmiast pokazuje pracę.
- E-maile: markowa strona nie zużywa tokenu na GET, przycisk uruchamia POST/verifyOtp.
  Działa bez cookie PKCE z poprzedniej przeglądarki. Wymaga ręcznej podmiany obu
  szablonów w Supabase po wdrożeniu; stare listy pozostają bez zmian.
- PWA: zachowano identyfikator /app, publiczny adres startowy logowania; event
  instalacji jest jednorazowy, instrukcja pozwala otworzyć prompt udostępniony później.
  Potwierdzenie wyboru nie jest przedstawiane jako dowód ukończenia instalacji.
  Zasoby live odpowiadały 200; dokładnej przyczyny awarii na urządzeniu nie potwierdzono.
  Końcowy test instalacji wymaga fizycznego Androida. Systemowego okna wyboru
  aplikacji nie da się stylować kodem strony. MASTER_PLAN bez zmiany strategii.

## D057 — Gemini Flash Latest dla całego czatu, bez Azure

- Data: 2026-09-09. Wyraźna preferencja foundera po niezadowalającej jakości GPT
  i opóźnieniach: jeden Gemini Flash Latest. Zastępuje routing z D050.
- Zweryfikowany identyfikator OpenRouter to `~google/gemini-flash-latest`
  (z tyldą); obecnie kieruje do Gemini 3.8 Flash. Obsługuje tekst, zdjęcia,
  narzędzia i JSON Schema. Standard: 0,75 USD / 1 mln wejścia, 3,75 USD / 1 mln
  wyjścia. To drożej od Nano (0,05/0,40); wybrano jakość, nie niższą cenę tokena.
- Rozważono: pozostawienie Nano przez bezpośrednią trasę OpenAI/Flex, Gemini Latest,
  Gemini 3.5 Flash Lite (0,30/2,50). Flex oficjalnie dopuszcza wolniejsze przetwarzanie
  i niedostępność; Lite nie ma tutaj potwierdzonej jakości. Nie twierdzimy, że Azure
  zawsze kosztuje i działa dokładnie dwukrotnie gorzej. Nie wykonano płatnego benchmarku.
- W kodzie jeden model dla startu, zdjęć i rozmowy. Brak drugiego wywołania GPT lub
  kolejnej generacji po błędzie. OpenRouter może przełączyć dostawcę tego samego
  Gemini. Preferencja `sort: latency`, wykluczenie Azure i znanych wariantów Google
  Flex/Priority. ZDR i `data_collection: deny`, JSON, kontrola kosztu oraz idempotencja
  bez osłabienia. Dostępność zależy też od polityk klucza OpenRouter.
- Kompromis: alias może sam zmienić cenę/model. Monitorujemy rzeczywisty model i koszt;
  po zmianie wymagany test jakości. Nie zmieniono planów ani limitów. Nie zapewniamy
  regionu UE przez sam ZDR. Czas do pierwszego tokenu nie jest czasem kompletnej
  odpowiedzi; streaming pozostaje oddzielnym zadaniem wymagającym zachowania rozliczeń.
- Zaktualizowano MASTER_PLAN i AI_ARCHITECTURE. Brak migracji bazy i nowych sekretów.
- Źródła: https://openrouter.ai/~google/gemini-flash-latest,
  https://openrouter.ai/api/v1/models,
  https://openrouter.ai/api/v1/models/google/gemini-3.8-flash/endpoints,
  https://openrouter.ai/docs/guides/routing/provider-selection,
  https://developers.openai.com/api/docs/guides/flex-processing.

## D058 — Natychmiastowe pokazanie wiadomości, streaming i darmowe powitanie

- Data: 2026-09-09. Founder zgłosił około 10 s oczekiwania na samo „hej”. Nie
  mamy produkcyjnego rozkładu opóźnień; dodano bezpieczny pomiar etapów.
- Samo powitanie obsługuje jawnie techniczna odpowiedź systemowa, bez AI i limitu.
  Nie udaje generacji ani wykonania zadania. Polecenia, zdjęcia i start biznesu
  pozostają w Gemini Latest. Kontrola konta i płatności nie jest omijana.
- UI od razu pokazuje wysłaną wiadomość i status. Fragmenty reply pojawiają się
  podczas generowania jako niezapisany podgląd. Końcowy wynik po walidacji i
  atomowym rozliczeniu; brak automatycznego naliczenia/przyjęcia urwanego tekstu.
- Parser obsługuje podział UTF-8, komentarze SSE, osobny usage, błędy w strumieniu
  oraz brak zakończenia. HTML i niedozwolone linki nadal są blokowane rendererem.
- OpenRouter stream zamiast JSON tylko dla nowego klienta. Brak response-healing
  w streamie; końcowa walidacja/odzyskanie JSON pozostają. Zakończone receipt/replay
  i starsze klienty zachowują zgodność. Rozłączenie użytkownika nie wywołuje modelu
  ponownie ani nie jest utożsamiane z zakończeniem naliczania u Google.
- Usunięto powtórne sprawdzenie tożsamości wdrożenia; równoległy odczyt kontekstu
  i subskrypcji przed dopuszczeniem. Statystyki poza ścieżką odpowiedzi.
- Odrzucono fałszywy tekst generowany lokalnie dla zadań, pomijanie płatności,
  zapisywanie fragmentów jako zakończonej odpowiedzi i obietnicę <1 s bez pomiarów.
- Brak migracji i zmian cen/limitów. MASTER_PLAN: doprecyzowanie szybkości istniejącego
  czatu, nie zmiana strategii. Test czasu rzeczywistych odpowiedzi wymagany na live.
- Źródło: https://openrouter.ai/docs/api_reference/streaming.

## D059 — Przypięty Gemini 3.1 Flash-Lite zamiast Latest

- Data: 2026-09-09. Founder zrezygnował z proponowanego porównania modeli i zlecił
  natychmiastowe wdrożenie `google/gemini-3.1-flash-lite` na main/live. Zastępuje D057.
- Jeden model dla całego czatu, onboardingu i zdjęć; minimalne rozumowanie dla
  szybkiego startu. Standardowe trasy Google, bez Azure/Flex/Priority, bez zmiany
  ZDR, filtrowania danych, streamingu, walidacji, zapisu i rozliczeń.
- Katalog OpenRouter potwierdza ten identyfikator, obrazy, JSON Schema i poziom
  minimal. Cena standardowa: 0,25 USD wejście / 1,50 USD wyjście za milion tokenów;
  konkretna trasa może mieć inne stawki. Mierzymy faktyczny koszt, nie obiecujemy SLA.
- Porównanie i płatne wywołania nie zostały uruchomione. Tymczasowe pliki narzędzia
  ewaluacji usunięto przed commitem. Founder sam sprawdzi jakość na live.
- Kompromis: niższy koszt i oczekiwane mniejsze opóźnienie kosztem niezweryfikowanej
  jakości w złożonych zadaniach. Bez zmian cen abonamentów, limitów lub bazy danych.
- Zaktualizowano MASTER_PLAN, AI_ARCHITECTURE oraz instrukcje konfiguracji.
- Źródło: https://openrouter.ai/google/gemini-3.1-flash-lite.

## D060 — Osobny biznes w każdym czacie i ogólny profil osoby

- Data: 2026-09-09. Na prośbę foundera każdy nowy czat zaczyna ankieta lub pytanie
  bez ankiety. Zastępuje jednorazowy onboarding i przenoszenie ustaleń do profilu.
- Opcjonalna nazwa identyfikuje biznes na liście. Ankieta zostaje przy rozmowie
  jako businessContext i pierwsza wiadomość; kolejne wywołania odczytują tylko kontekst
  bieżącego czatu. Nowsze ustalenia mają pierwszeństwo. Brak pamięci innych czatów.
- W profilu pozostaje jedno pole aboutMe. Nie kopiujemy automatycznie starych pól,
  bo zawierają pomieszane dane osoby i pierwszego biznesu. Zachowujemy je w workspace
  dla zgodności i eksportu, lecz nie używamy ich w nowych promptach.
- Usuwanie na desktopie i telefonie wymaga potwierdzenia. Dopiero udany zapis usuwa
  czat z widoku; błąd pozostawia rozmowę. Operacja zablokowana podczas generacji/zapisu.
  Brak zwrotu zużycia i zmian innych rozmów. Nie obiecujemy natychmiastowego usunięcia
  technicznych receipt ani backupów poza polityką retencji.
- Pola opcjonalne w istniejącym JSONB, bez migracji SQL. MASTER_PLAN, MVP_SPEC
  i AI_ARCHITECTURE zaktualizowane. Model i ceny bez zmian.

## D061 — SmartFach jako asystent budowania biznesu od zera

- Data: 2026-09-10. Founder doprecyzował nadrzędne pozycjonowanie produktu.
- SmartFach jest osobistym asystentem budowania biznesu od zera, zarówno dla
  osoby z pomysłem, jak i bez pomysłu. Wykorzystuje jej wiedzę, umiejętności,
  doświadczenie, zainteresowania, wskazane przez nią kontakty i realne warunki.
- Kierunek rezultatu to własne źródło przychodu i droga do większej wolności
  finansowej. Wolność finansowa pozostaje aspiracją i kierunkiem pracy, a nie
  gwarancją konkretnej kwoty, klienta lub terminu.
- Nie definiujemy marki przez listę funkcji, których produkt nie posiada.
  Oferta, cena, wiadomość i następne działanie są zastosowaniami asystenta,
  a nie pełną definicją SmartFach.
- Wewnętrzne granice bezpieczeństwa i uprawnień pozostają w dokumentacji
  technicznej, ale nie stanowią głównego przekazu marketingowego.
- Zaktualizowano README, MASTER_PLAN, MVP_SPEC i nadrzędną strategię marketingową.
  Bez zmian kodu, cen, limitów i zakresu MVP.

## D062 — Rozdzielenie marketingu i usunięcie martwych modułów

- Data: 2026-09-10. Founder zlecił uporządkowanie projektu i oddzielenie pracy
  marketingowej od kodu aplikacji.
- Strategia, bieżące decyzje, procedury marketingowe i multimedia mają być
  przechowywane poza repozytorium aplikacji, w Google Drive. Kod, migracje oraz
  dokumentacja produktu pozostają w repozytorium połączonym z Vercel.
- Usunięto niepodłączony do runtime import cennika CSV, generator PDF wycen i
  protokołów, ich testy, font Noto Sans oraz zależności `pdf-lib` i `fontkit`.
  Funkcje te pozostają w Parking Lot; historyczne decyzje nadal opisują ich etap.
- `.env.example` pozostaje bez sekretów jako kontrolowana lista nazw zmiennych
  wymaganych w Vercelu. Usunięcie go utrudniłoby konfigurację i weryfikację środowisk.
- Katalog `marketing/` jest ignorowany przez Git i nie trafia do GitHuba ani do
  procesu budowania Vercela. Usunięto także ignorowane artefakty dawnych testów
  PDF. Brak zmian runtime poza redukcją martwego kodu i zależności.

## D063 — Lokalny podział na stronę i marketing, tylko strona w Git

- Data: 2026-09-10. Founder doprecyzował, że lokalny projekt ma dwa katalogi,
  `strona/` i `marketing/`, ale GitHub ma wersjonować wyłącznie stronę.
- Aplikacja, jej konfiguracja, migracje, testy i dokumentacja produktu znajdują
  się w `strona/`. Lokalny `marketing/` jest ignorowany przez Git, a jego
  nadrzędne materiały są przechowywane w Google Drive.
- Vercel ma budować wyłącznie `strona/` przez ustawienie Root Directory. Zmiana
  materiałów marketingowych nie wymaga dostępu aplikacji do ich plików.
- Duże media, eksporty, dane osobowe i sekrety nadal nie trafiają do GitHuba.

## D064 — Spłaszczenie repozytorium do korzenia, `strona/` znika

- Data: 2026-09-10. Founder zlecił uporządkowanie lokalnej struktury repo: katalog
  `strona/` w Git był mylący i niezgodny z konwencją pojedynczej aplikacji.
- Zawartość dawnego `strona/` przeniesiono bezpośrednio do korzenia repozytorium.
  Repozytorium Git nie zawiera już podkatalogu aplikacji — `src/`, `docs/`,
  `supabase/`, `public/`, `package.json` i pozostałe pliki leżą teraz w korzeniu.
- Lokalnie repozytorium mieszka w katalogu `aplikacja/`, obok którego (poza Git)
  leży osobny, niewersjonowany folder `marketing/`. Oba są rodzeństwem w
  nadrzędnym folderze roboczym, a nie zagnieżdżone jedno w drugim.
- Usunięto z `.gitignore` wpis ignorujący `marketing/`, ponieważ ten folder nie
  znajduje się już fizycznie wewnątrz repozytorium i nie może zostać do niego
  przypadkowo dodany.
- `.github/workflows/check.yml` nie ustawia już `working-directory: strona` —
  krok instalacji i kontroli działa bezpośrednio w korzeniu repo.
- Ustawienie Vercel Root Directory wymaga ręcznej zmiany z `strona` na wartość
  pustą (korzeń repo) w panelu Vercela; nie istnieje do tego narzędzie MCP.
- Zastępuje D063 w zakresie fizycznej struktury repozytorium; uzasadnienie
  rozdziału strona/marketing z D063 pozostaje aktualne, zmienia się tylko
  głębokość zagnieżdżenia w Git.

## D065 — Odpowiedzi bez autoprezentacji i samonaprawiający status anulowania

- Data: 2026-09-11. Zwykła odpowiedź przechodzi od razu do pytania użytkownika;
  SmartFach przedstawia się tylko wtedy, gdy użytkownik pyta o jego tożsamość lub model.
- Instrukcja odpowiedzi wymaga prawdziwych podziałów wierszy i nieuciekania znaków
  Markdown. Panel administratora renderuje odpowiedzi tym samym bezpiecznym
  komponentem co czat użytkownika, bez HTML i osadzanych obrazów.
- Profil użytkownika w panelu administratora porównuje zapisany status i flagę
  anulowania z bieżącym stanem Stripe. Rozbieżność uruchamia istniejącą,
  zabezpieczoną synchronizację do Supabase; awaria zewnętrzna nie blokuje profilu,
  ale jest jawnie oznaczona jako możliwie nieaktualny stan.
- Webhook pozostaje podstawowym mechanizmem synchronizacji. Odczyt administratora
  jest zabezpieczeniem na wypadek pominiętego lub opóźnionego zdarzenia, a nie jego
  zamiennikiem. Nie zmieniono planów, cen, limitów, modelu ani landingu.

## D066 — Landing zaczyna od istniejących zasobów, ale zachowuje pierwszego klienta

- Data: 2026-09-11. Zachowano zatwierdzony nagłówek „Nie potrzebujesz idealnego
  pomysłu. Potrzebujesz pierwszego klienta.”. Motyw „nie zaczynasz od zera” rozwija
  komunikację przez umiejętności, doświadczenie, zainteresowania, kontakty, czas
  i ograniczenia użytkownika, zamiast zastępować główną obietnicę.
- Landing jest kierowany szczególnie do osoby pracującej na etacie, która chce
  wykonać mały test po godzinach, ale nie wyklucza osób bez pomysłu lub już
  rozwijających własny kierunek.
- Podgląd produktu odpowiada działającemu modelowi: osobny biznes w każdym czacie,
  krótka ankieta, najwyżej kilka możliwości, jedna rekomendacja, ryzyko i jedno
  działanie na dziś. Element demonstracyjny nie zawiera nieaktywnego przycisku.
- Trzy drogi użytkowników są wyraźnie opisane jako fikcyjne scenariusze. Zaufanie
  budują rzeczywisty proces, jawne granice, pełne zasady próby i kontakt, bez opinii,
  ocen, wyników oraz twierdzeń o zespole, których nie potwierdzono.
- Nie zmieniono aplikacji, modelu, planów, cen, limitów, checkoutu ani dokumentów
  prawnych. Nowy landing wymaga kontroli wizualnej przed publikacją.

## D067 — Redakcyjny kierunek wizualny landingu

- Data: 2026-09-11. Founder odrzucił poprzedni, mocno „startupowy” wygląd landingu
  i wskazał jako inspirację spokojniejszy projekt portfolio. Materiał referencyjny
  służy wyłącznie do określenia rytmu, typografii i poziomu prostoty; nie kopiujemy
  jego treści, kodu, kolorystyki ani elementów marki.
- Landing otrzymuje jasne, ciepłe tło, szeryfowe nagłówki, cienkie podziały,
  oliwkowo-miedziane akcenty i większy oddech. Ograniczamy gradienty, zaokrąglone
  karty, cienie i dekoracje, aby komunikacja była nowoczesna, ale spokojna.
- Zachowano treść, nagłówek, ceny, warunki trzydniowej próby, scenariusze oznaczone
  jako fikcyjne i podgląd zgodny z działającym produktem. Nie zmieniono aplikacji,
  modeli AI, Stripe, Supabase, planów, limitów ani dokumentów prawnych.
- Wersję statyczną sprawdzono wizualnie na desktopie i w widoku telefonu 390 × 844;
  pełne testy kodu i produkcyjny build pozostają bramką przed publikacją.
