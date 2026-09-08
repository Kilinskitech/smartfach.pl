# SmartFach — uruchomienie sprzedaży

Stan: 8 września 2026. Implementacja nie jest równoznaczna z zatwierdzeniem prawnym,
konfiguracją usług ani zakończonym testem rzeczywistej płatności.

Aktualizacja 2026-09-09: najpierw wykonaj `RELEASE_2026-09-09.md`. Nowa wersja
wymaga migracji bazy, `CRON_SECRET` i osobnej bazy Preview przed Stripe Live.
Nie publikuj kodu bez tych przygotowań.

## Co jest w kodzie

- Regulamin i prywatność zgodne z obecnym zakresem produktu, do czytania, druku
  i pobrania jako tekst. Nie obiecują wyniku finansowego ani utraty wszystkich praw
  przez samo rozpoczęcie próby.
- 49 zł Lite / 99 zł Pro jako ceny całkowite, trzy pełne dni próby z kartą,
  odnowienie do anulowania. Weryfikacja ceny Stripe: PLN, dokładna kwota, co miesiąc.
- Osobne, niezaznaczone oświadczenia: regulamin / zapoznanie z prywatnością oraz
  żądanie natychmiastowego rozpoczęcia usługi. Walidacja również na serwerze.
- Niezmienna kopia oferty i dokumentów przy akceptacji, suma kontrolna, powiązanie
  ze zamówieniem Stripe. Potwierdzenie umowy e-mailem z załącznikiem tekstowym.
  Bieżące dokumenty publiczne nie zastępują kopii warunków konkretnego zakupu.
- `/admin#dane-sprzedawcy`: edycja nazwy, adresu, NIP, REGON, e-maila i telefonu.
  Domyślny telefon: +48 662 410 479. Zmiany nie edytują dawnych potwierdzeń.
- `/odstapienie`: formularz bez wymogu logowania, dwa kroki, zapis daty i potwierdzenie.
  Używa numeru zamówienia `cs_...` oraz e-maila konta; alternatywnie e-mail/posta.
  Konto zalogowane ma listę własnych nowych zamówień. Zgłoszenie nie wykonuje
  automatycznie zwrotu. Obsługa: `/admin#obsluga-umow` i Stripe.
- `/pobierz` oraz karta w Ustawieniach: natywna instalacja jednym kliknięciem,
  gdy pozwala na nią przeglądarka; dopasowane instrukcje iOS/Android/komputer oraz
  ostrzeżenie dla przeglądarek Facebooka, Instagrama i TikToka; manifest, ikony
  180/192/512 oraz maskable, publiczny ekran braku internetu.
  Brak offline AI: service worker nie zapisuje prywatnych stron ani API.

## 1. Poczta — osobno od Supabase

Supabase SMTP wysyła wiadomości konta. Potwierdzenia zamówień wysyła aplikacja,
dlatego wymaga własnych zmiennych Vercel (bez `NEXT_PUBLIC_`):

| Zmienna | Wartość |
| --- | --- |
| `SMTP_HOST` | serwer SMTP skrzynki; według obecnej konfiguracji Hostido: `host379268.hostido.net.pl` — potwierdź w panelu hostingu |
| `SMTP_PORT` | `465` (SSL) lub `587` (STARTTLS) |
| `SMTP_USER` | pełny adres istniejącej skrzynki, np. `kontakt@smartfach.pl` |
| `SMTP_PASSWORD` | hasło tej skrzynki, tylko jako Secret |

Po dodaniu zmiennych wykonaj nowe wdrożenie. Te same dane mogą służyć Supabase,
ale konfiguracja nie przenosi się automatycznie. Nadawcą jest `SMTP_USER`;
odpowiedzi trafiają na kontakt zapisany w danych sprzedawcy. Zmiana adresu
w panelu SmartFach nie zakłada skrzynki i nie zmienia hasła SMTP.

Po wdrożeniu wejdź w `/admin#obsluga-umow` i użyj „Wyślij test SMTP”. Ten test
sprawdza aplikację oraz zmienne Vercela bez tworzenia zakupu. Osobno przetestuj
potwierdzenie konta i odzyskiwanie hasła, ponieważ te wiadomości wysyła Supabase
z własnej konfiguracji SMTP i własnych szablonów.

W Supabase Auth pozostaw włączone wymaganie potwierdzenia e-maila przed logowaniem.
SmartFach dodatkowo sprawdza `email_confirmed_at` po stronie serwera, ale poprawna
konfiguracja Supabase jest pierwszą warstwą blokady.

Bez kompletu SMTP kod blokuje nowe Checkout z kluczem Stripe Live. W Sandbox
potwierdzenia bez SMTP pozostają w bazie i w eksporcie użytkownika. Ustawione
zmienne nie dowodzą dostarczalności: wykonaj nowe testowe zamówienie i sprawdź
Gmail oraz Outlook, także spam i załącznik.

Gdy wysyłka po zakupie zawiedzie, webhook zwraca błąd do ponowienia, a potwierdzenie
jest już zapisane. Po naprawie SMTP ponów nieprzetworzone zdarzenie w Stripe.
Prawidłowy powrót na `/platnosc/sukces?session_id=cs_...` wykonuje dodatkowo
idempotentne ponowienie zapisu i wysyłki. To zabezpieczenie na opóźniony webhook,
nie zamiennik poprawnie skonfigurowanego endpointu Stripe.
Równoległe wysyłki mają krótką blokadę; SMTP nie zapewnia
ścisłego „exactly once” w przypadku przyjęcia e-maila i jednoczesnej awarii zapisu
statusu. Stały Message-ID ogranicza skutki duplikatów, ale nie gwarantuje ich braku.
Równoległa aktywna rezerwacja wysyłki od 2026-09-09 zwraca 503 do ponowienia
webhooka. Nie oznaczamy zdarzenia jako zakończonego, zanim wysyłka się nie potwierdzi.
Po zakończeniu pracy pierwszego procesu ponowienie powinno zwrócić HTTP 200.

W Sandbox endpoint webhooka również musi działać w trybie testowym. Sekret
`STRIPE_WEBHOOK_SECRET` musi pochodzić z dokładnie tego endpointu, który odbiera
zdarzenia testowe dla `https://smartfach.pl/api/stripe/webhook`. Działający test
SMTP nie sprawdza webhooka. Po nowym Checkout sprawdź osobno, czy
`checkout.session.completed` zakończył się HTTP 200 i czy w tabeli
`purchase_contracts` dla nowego `cs_test_...` pojawiło się `email_sent_at`.
Starsze sesje utworzone przed zapisem `legal_acceptance_id` nie generują takiego
potwierdzenia i nie nadają się do tego testu.

## 2. Stripe Live

1. Zakończ weryfikację firmy w Stripe i ustaw rachunek wypłat oraz publiczne dane.
2. Utwórz ceny **miesięczne PLN**: Lite 49,00 zł i Pro 99,00 zł. Cena ma być
   całkowita — nie doliczaj osobnego VAT do kwot reklamowanych konsumentowi.
3. Tylko Production: podmień `STRIPE_SECRET_KEY`, `STRIPE_PRICE_LITE`,
   `STRIPE_PRICE_PRO`, `STRIPE_WEBHOOK_SECRET`. Ceny to `price_...`, nie `prod_...`
   i nie liczby. Klucz i ceny muszą pochodzić z tego samego trybu/konta Stripe.
4. Webhook Live: `https://smartfach.pl/api/stripe/webhook`, zdarzenia zgodnie
   z `SETUP_SUPABASE_STRIPE.md`. Nowy endpoint ma nowy sekret `whsec_...`.
5. Customer Portal Live: włącz anulowanie, ustaw linki regulaminu i prywatności,
   sprawdź ustawienia zmiany planu. Włącz wiadomości o płatnościach i końcu próby.
6. `NEXT_PUBLIC_APP_URL=https://smartfach.pl`; wykonaj nowe wdrożenie Production.
7. Za zgodą właściciela przeprowadź kontrolny rzeczywisty zakup, anulowanie i zwrot.
   Nie używaj kart testowych z kluczami Live. Potwierdzenie Stripe nie zastępuje
   ustalenia z księgowym obowiązków fakturowania, VAT i ewidencji sprzedaży.

## 3. Przed pierwszym ruchem reklamowym — pozostałe bramki

- [ ] Oddzielna testowa baza i Stripe Sandbox dla Preview przed pierwszymi realnymi
  danymi/Live. Obecnie oba wdrożenia korzystają ze wspólnej bazy testowej; samo
  rozdzielenie kluczy Stripe nie izoluje rekordów subskrypcji i webhooków.
- [ ] Potwierdź dane działalności i status podatkowy; przegląd dokumentów i Checkout
  przez prawnika/księgowego. Teksty nie są gwarancją zgodności wszystkich procesów.
- [ ] Sprawdź umowy powierzenia i transfery u rzeczywistych dostawców, ich regiony,
  prywatność OpenRouter/ZDR oraz ograniczony cel ręcznego wglądu w rozmowy.
- [ ] Zatwierdź harmonogram retencji i procedurę usuwania, kopii i odtworzenia.
  Nowe tabele umów zachowują niezbędne dowody po usunięciu konta (FK SET NULL).
  Nie mają automatycznego harmonogramu czyszczenia — stosuj zatwierdzone terminy.
- [ ] Włącz ochronę haseł z wycieków w Supabase, jeśli dostępna w planie. Kontrola
  Supabase zgłaszała tę funkcję jako wyłączoną. MFA na kontach właściciela dostawców.
- [ ] Nowe konto → próba → e-mail konta → asystent → odświeżenie → anulowanie.
  Przed potwierdzeniem e-maila sprawdź brak logowania, brak dostępu do workspace i
  brak wywołania OpenRouter. Sprawdź też blokadę konta bez metody płatności, brak
  opłaty bez potwierdzenia adresu i brak podwójnego naliczenia webhooka.
- [ ] Dokupienie limitu, kopia umowy e-mailem i w Ustawieniach, zgłoszenie odstąpienia,
  otrzymanie zgłoszenia w adminie, rozliczenie przez właściciela w Stripe.
- [ ] Nowy zakup Sandbox: `checkout.session.completed` ma HTTP 200, powrót zawiera
  `session_id=cs_test_...`, a odpowiadający rekord `purchase_contracts` ma
  uzupełnione `email_sent_at`. Ponów celowo ten sam webhook i potwierdź brak drugiego
  przyznania dostępu lub zwiększenia limitu.
- [ ] Sprawdź e-maile: przyjęcie przez SMTP nie dowodzi dotarcia do odbiorcy.
- [ ] „Nie pamiętasz hasła?” → polski e-mail → nowe hasło → ponowne logowanie.
- [ ] Fizyczny iPhone/Safari: `/pobierz` rozpoznaje iOS, pokazuje instrukcję Safari,
  „Do ekranu początkowego” tworzy poprawną ikonę, a uruchomienie prowadzi do `/app`.
- [ ] Fizyczny Android/Chrome: przycisk otwiera natywne okno instalacji jednym
  kliknięciem; po odrzuceniu nadal działa instrukcja z menu Chrome. Sprawdź ikonę,
  start `/app`, logowanie, zdjęcie, klawiaturę, powrót po zamknięciu, brak sieci
  i ponowne połączenie.
- [ ] Wejście na `/pobierz` z reklamy w Facebooku/Instagramie/TikToku pokazuje
  najpierw przejście do Safari/Chrome, a potem pozwala dokończyć instalację.
- [ ] Włącz alerty błędów Vercel/Stripe, kosztów OpenRouter oraz sprawdzaj codziennie
  skrzynkę i `/admin#obsluga-umow`. Nie uruchamiaj Meta Pixel/GA bez wymaganej zgody.

## Weryfikacja wykonana w tej zmianie

- `npm run check`: typy, lint i 168 testów poprawne.
- Standardowy `npm run build` napotkał ograniczenie sandboxa: Turbopack nie mógł
  otworzyć wewnętrznego portu. Alternatywny `npm run build -- --webpack` zakończony
  poprawnie; nie zmieniono produkcyjnego polecenia kompilacji ani architektury.
- Nowe migracje zastosowane w połączonym projekcie Supabase. Transakcyjny test
  RLS na dwóch istniejących kontach: izolacja nowych dokumentów/zgłoszeń,
  brak dostępu anon i brak uprawnień klienta do edycji danych operatora/RPC.
  Wszystkie testowe wpisy zostały wycofane przez ROLLBACK.
- PWA: test cache potwierdza brak utrwalania prywatnego HTML/API i pozostawienie
  cudzych cache bez zmian. Fizycznej instalacji na telefonach nie wykonano.
- SMTP oraz rzeczywistej transakcji Live nie przetestowano w tej zmianie.
- Nowy ekran powrotu z płatności i ponowienie dostarczenia umowy wymagają wdrożenia
  Preview oraz świeżego Checkout; bez `session_id` ekran celowo nie weryfikuje zakupu.
- Po publikacji: HTTP 200 dla dokumentów, kontaktu, instalacji, odstąpienia,
  manifestu, ikon i ekranu offline. Ekran wyniku płatności bez `session_id` pokazuje
  bezpieczny stan bez danych zamówienia i nie przyznaje dostępu. Zweryfikowano telefon
  w dokumentach i prawidłowy cache-control service workera.
- W przeglądarce Codex sprawdzono otwieranie instrukcji instalacji, układ 390px,
  regulamin mobilny i pierwszy krok odstąpienia bez wysyłania oświadczenia.
  Poprawiono kontrast karty instalacji. To nie zastępuje testu fizycznego urządzenia.

## Źródła przeglądu dokumentów (7–8 września 2026)

- Ustawa o prawach konsumenta: https://eli.gov.pl/api/acts/DU/2024/1796/text.html
- RODO: https://eur-lex.europa.eu/eli/reg/2016/679/oj?locale=PL
- Usługi elektroniczne: https://eli.gov.pl/eli/DU/2002/1204/ogl
- UOKiK, odstąpienie: https://prawakonsumenta.uokik.gov.pl/prawo-odstapienia-od-umowy/umowy-szczegolne/
- Funkcja odstąpienia, dyrektywa 2023/2673: https://eur-lex.europa.eu/legal-content/en/ALL/?uri=oj%3AL_202302673
- Oficjalny opis PARP: https://bip.parp.gov.pl/component/content/article/91021:one-click-return-czyli-zwroty-w-e-commerce-po-nowemu
- Next.js PWA: https://nextjs.org/docs/app/guides/progressive-web-apps
- Stripe Checkout: https://docs.stripe.com/api/checkout/sessions/create
- SMTP: https://nodemailer.com/smtp

Formularz odstąpienia wdrożono jako funkcję konsumencką. Nie traktujemy samej
dyrektywy jako dowodu pełnej transpozycji do prawa polskiego; dokładny aktualny
reżim i terminy dla działalności operatora powinien potwierdzić przegląd prawny.
