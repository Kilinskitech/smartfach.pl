# E-maile transakcyjne Supabase

Stan: 2026-09-05. Szablon w repozytorium nie zmienia automatycznie ustawień
hostowanego projektu Supabase. Trzeba wkleić go raz w panelu projektu.

## Potwierdzenie konta

1. Otwórz Supabase → Authentication → Email Templates → Confirm signup.
2. Ustaw temat: `Potwierdź adres e-mail — SmartFach`.
3. Wklej całą zawartość `docs/email-templates/confirm-signup.html`.
4. Zapisz i wyślij test na adres należący do zespołu projektu.

Szablon używa `{{ .ConfirmationURL }}`, dlatego zachowuje adres powrotu przekazany
przy rejestracji. Aplikacja obsługuje także wariant SSR z `token_hash`, gdy w
przyszłości zmienimy sposób budowania linku.

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
