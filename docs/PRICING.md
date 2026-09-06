# SmartFach — ceny i limity

Stan: 2026-09-06. Ceny są hipotezą do walidacji.

| Plan | Cena miesięczna | Dla kogo |
| --- | ---: | --- |
| Lite | 49 zł | Spokojny start i podstawowy zakres użycia |
| Pro | 99 zł | Regularna praca nad ofertą, sprzedażą i przychodem |

Plan Firma 299 zł i dodatkowe miejsca 49,99 zł nie są częścią publicznej oferty.
Pozostają kompatybilne technicznie dla wcześniejszych danych, ale nie pojawiają się
na landingach, w cenniku ani rejestracji.

## Próba

- 3 pełne dni, karta wymagana;
- 0 zł przy rozpoczęciu;
- po próbie miesięczne odnowienie wybranego planu;
- anulowanie przed końcem zapobiega pierwszej opłacie;
- Checkout pokazuje dokładną datę obciążenia i cenę po próbie;
- błędny lub niepotwierdzony adres nie może zakończyć się automatycznym obciążeniem.

Trzy dni są hipotezą. Porównaniem jest 7 dni z kartą, jeśli dane pokażą, że
użytkownicy nie zdążają uzyskać wartości.

## Różnica Lite i Pro

Na obecnym etapie plany różnią się głównie miesięcznym zakresem użycia. Nie
twierdzimy, że Pro ma „lepsze” lub dokładniejsze AI. Dokładne limity należy ustalić
na podstawie kosztu jednej skutecznej sesji, a nie samej liczby wiadomości.

## Zwiększenie użycia

Interfejs codzienny nie pokazuje salda „kredytów”. Po wykorzystaniu planu użytkownik
może zwiększyć miesięczny zakres albo przejść na Pro. Zasady, cena, ważność i zwroty
muszą być ustalone przed uruchomieniem zakupu. Każda płatność i każde obciążenie
limitu wymagają idempotentnej księgi.

## Pomiar

Testujemy landing → Checkout, trial → paid, aktywację, działania użytkownika,
D7/D30, churn, zwroty, chargebacki, koszt AI, ARPU i CAC. Ceny zmieniamy dopiero,
gdy te dane pokażą problem lub większą gotowość do płacenia.

Przed sprzedażą Live trzeba zatwierdzić prezentację cen brutto/netto, VAT,
dokumenty sprzedaży, metody odnawialne i zasady zwrotów dla polskich konsumentów
oraz przedsiębiorców.
