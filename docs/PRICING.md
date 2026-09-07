# SmartFach — ceny i limity

Stan: 2026-09-07. Ceny są hipotezą do walidacji.

| Plan | Cena miesięczna | Dla kogo |
| --- | ---: | --- |
| Lite | 49 zł | Spokojny start i podstawowy zakres użycia |
| Pro | 99 zł | Regularna praca nad ofertą, sprzedażą i przychodem |

Plan Firma 299 zł i dodatkowe miejsca 49,99 zł nie są częścią bieżącego produktu.
Nie występują w runtime, checkoutach ani nowych ograniczeniach bazy. Starszy zapis
planu Firma, jeżeli istnieje, jest migrowany do Pro bez zmiany terminu subskrypcji;
ewentualną różnicę płatności trzeba obsłużyć ręcznie przed Stripe Live.

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
widzi procent miesięcznego limitu i może zwiększyć zakres albo przejść na Pro.
Jednorazowe zwiększenia nie zmieniają abonamentu i pozostają do wykorzystania:

| Zwiększenie | Cena brutto — hipoteza | Wewnętrzny budżet kosztu AI |
| --- | ---: | ---: |
| Małe | 19,99 zł | 1,50 USD |
| Większe | 49,99 zł | 4,00 USD |
| Intensywne | 129,99 zł | 11,00 USD |

W runtime jedna wewnętrzna jednostka odpowiada jednemu centowi zmierzonego kosztu
OpenRouter. Użytkownik nie widzi jednostek ani dolarów, ponieważ koszt jednego
zadania zależy od modelu, długości, obrazu i wyszukiwania. Gdy dostawca nie
zwróci kosztu, działa zachowawcza wycena zastępcza. Płatności i obciążenia limitu
mają osobne klucze idempotencji.

## Budżet kosztu AI

- Lite: 2,25 USD na okres, około 8,36 zł przy kursie 3,7145 zł/USD;
- Pro: 5,50 USD na okres, około 20,43 zł przy tym samym kursie;
- cel początkowy: koszt AI około 15–25% ceny brutto abonamentu;
- alarm: 30%; powyżej tego progu trzeba zmienić model, limit lub cenę.

Budżet 10 USD w Lite i 20 USD w Pro został odrzucony. Przy cenach brutto, VAT 23%,
prowizji Stripe 1,5% + 1 zł i kursie NBP z 2026-09-04 pozostawiałby około 0,96 zł
oraz 3,71 zł przed hostingiem, wsparciem, zwrotami i podatkiem dochodowym. Również
sprzedanie za 19,99 zł limitu kosztującego 12 zł jest zbyt ciasne: po VAT i Stripe
pozostałoby około 2,95 zł przed innymi kosztami.

## Pomiar

Testujemy landing → Checkout, trial → paid, aktywację, działania użytkownika,
D7/D30, churn, zwroty, chargebacki, koszt AI, ARPU i CAC. Ceny zmieniamy dopiero,
gdy te dane pokażą problem lub większą gotowość do płacenia.

Przed sprzedażą Live trzeba zatwierdzić prezentację cen brutto/netto, VAT,
dokumenty sprzedaży, metody odnawialne i zasady zwrotów dla polskich konsumentów
oraz przedsiębiorców.
