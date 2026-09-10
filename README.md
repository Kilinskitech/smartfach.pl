# SmartFach — repozytorium strony

Wersjonowana aplikacja znajduje się w katalogu [strona/](strona/README.md).
Zawiera kod SmartFach, konfigurację Vercela, migracje Supabase, testy i
dokumentację produktu.

Vercel ma ustawiony katalog bazowy `strona/` i buduje wyłącznie aplikację.
Lokalny obszar `marketing/` oraz materiały w Google Drive nie są wersjonowane w
tym repozytorium i nie należą do artefaktów strony.

Sekrety środowiskowe są przechowywane wyłącznie w Vercelu. Plik
[`strona/.env.example`](strona/.env.example) zawiera tylko nazwy wymaganych
zmiennych i bezpieczne wartości przykładowe.
