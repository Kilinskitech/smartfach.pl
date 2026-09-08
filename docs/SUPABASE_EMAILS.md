# E-maile transakcyjne Supabase

Stan: 2026-09-05. Szablon w repozytorium nie zmienia automatycznie ustawień
hostowanego projektu Supabase. Trzeba wkleić go raz w panelu projektu.

W projekcie Free utworzonym po 3 czerwca 2026 najpierw skonfiguruj własny SMTP.
Supabase blokuje edycję szablonów nowych darmowych projektów korzystających z jego
domyślnej wysyłki. Po zapisaniu SMTP wróć do sekcji z szablonami.

## Potwierdzenie konta

1. Otwórz Supabase → Authentication → Email Templates → Confirm signup.
2. Ustaw temat: `Potwierdź adres e-mail — SmartFach`.
3. Wklej całą zawartość `docs/email-templates/confirm-signup.html`.
4. Zapisz i wyślij test na adres należący do zespołu projektu.

Szablon używa `{{ .ConfirmationURL }}`, dlatego zachowuje adres powrotu przekazany
przy rejestracji. Aplikacja obsługuje także wariant SSR z `token_hash`, gdy w
przyszłości zmienimy sposób budowania linku.

## Odzyskiwanie hasła

1. Otwórz Supabase → Authentication → Email Templates → Reset password.
2. Ustaw temat: `Ustaw nowe hasło — SmartFach`.
3. Wklej całą zawartość `docs/email-templates/recovery.html`.
4. Sprawdź, czy w Redirect URLs znajdują się oba adresy:
   `https://smartfach.pl/auth/callback` oraz
   `https://preview.smartfach.pl/auth/callback`.
5. Na `/logowanie` wybierz „Nie pamiętasz hasła?”, wyślij test i sprawdź, czy
   link otwiera `/ustaw-haslo`, a zapisane hasło pozwala ponownie się zalogować.

Formularz celowo pokazuje taki sam komunikat dla istniejącego i nieistniejącego
adresu, aby nie ujawniać osobom postronnym listy kont.

## Wysyłka produkcyjna

Domyślny serwer Supabase służy tylko do testów, ma silne limity i nie dostarcza
wiadomości do zwykłych klientów projektu. Przed reklamą i realnymi rejestracjami:

1. skonfiguruj własnego dostawcę SMTP w Authentication → SMTP Settings;
2. ustaw nadawcę, np. `SmartFach <no-reply@smartfach.pl>`;
3. dodaj rekordy SPF/DKIM podane przez dostawcę, nie usuwając obecnych rekordów
   poczty bez sprawdzenia ich łącznej składni;
4. wyłącz śledzenie linków w dostawcy, aby nie przepisywał linków potwierdzających;
5. przetestuj Gmail, Outlook i pocztę firmową oraz folder Spam;
6. ustaw rozsądne limity Auth i alerty błędów dostarczenia.

Hasło SMTP jest sekretem. Nie zapisuj go w GitHub ani w publicznej zmiennej Vercela.

SMTP wpisany w Vercelu nie konfiguruje wiadomości Supabase. Są to dwa osobne
klienty pocztowe korzystające z tej samej skrzynki: Supabase wysyła potwierdzenie
konta i odzyskiwanie hasła, a aplikacja wysyła potwierdzenie zamówienia po
ukończeniu Stripe Checkout. Oba miejsca trzeba skonfigurować oddzielnie.

## Ustawienia Hostido dla SmartFach

Na start można wykorzystać pocztę z już opłaconego hostingu. Najpierw w DirectAdmin
utwórz skrzynkę `kontakt@smartfach.pl` albo osobną `no-reply@smartfach.pl`. Następnie
w Supabase → Authentication → Emails → SMTP Settings wpisz:

- Sender email: dokładnie adres utworzonej skrzynki;
- Sender name: `SmartFach`;
- Host: `host379268.hostido.net.pl`;
- Port: `465`;
- Username: pełny adres skrzynki, taki sam jak Sender email;
- Password: hasło tej konkretnej skrzynki;
- szyfrowanie: SSL.

Przy wykorzystaniu SMTP Hostido obecne rekordy MX, SPF i DKIM poczty pozostają na
Hostido. Nie dodawaj drugiego SPF i nie usuwaj rekordów pocztowych. Po zapisaniu
wyślij próbne potwierdzenie na zewnętrzny Gmail oraz Outlook. Jeżeli dostarczalność
będzie słaba albo zacznie rosnąć wolumen, przenieś wiadomości transakcyjne na
dedykowanego dostawcę i subdomenę, np. `auth.smartfach.pl`.
