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
