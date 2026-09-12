import { z } from "zod";
import { plans, creditPacks } from "./billing";
import { legalDocumentVersion, type Operator } from "./operator";

export type LegalSection = { title: string; paragraphs: string[] };
export type LegalDocument = { title: string; version: string; sections: LegalSection[] };

export const termsAcknowledgement = "Akceptuję Regulamin i potwierdzam zapoznanie się z Polityką prywatności.";
export const earlyServiceRequest = "Żądam rozpoczęcia świadczenia usługi od razu, przed upływem 14 dni na odstąpienie od umowy. W razie odstąpienia po rozpoczęciu płatnej usługi rozliczenie może obejmować część już spełnionego świadczenia. Samo uruchomienie dostępu nie pozbawia mnie prawa odstąpienia.";
export const purchaseConsentSchema = z.object({
  termsAccepted: z.literal(true, "Zaakceptuj Regulamin i zapoznaj się z Polityką prywatności."),
  earlyServiceRequested: z.literal(true, "Potwierdź żądanie uruchomienia usługi od razu."),
  legalVersion: z.literal(legalDocumentVersion, "Odśwież formularz, aby zapoznać się z aktualnymi warunkami."),
});

export function termsDocument(operator: Operator): LegalDocument {
  return {
    title: "Regulamin SmartFach",
    version: legalDocumentVersion,
    sections: [
      { title: "1. Sprzedawca i kontakt", paragraphs: [
        `Usługodawcą i sprzedawcą SmartFach dostępnego pod adresem https://smartfach.pl jest ${operator.name}, przedsiębiorca wpisany do Centralnej Ewidencji i Informacji o Działalności Gospodarczej. Adres prowadzenia działalności i do korespondencji: ${operator.address}. NIP: ${operator.taxId}. REGON: ${operator.regon}.`,
        `Kontakt, reklamacje, odstąpienia i sprawy prywatności: ${operator.email}; telefon: ${operator.phone}. Koszt połączenia jest zgodny z taryfą operatora użytkownika. Regulamin jest udostępniany bezpłatnie przed zakupem; można go pobrać, zapisać i wydrukować. Umowę zawieramy w języku polskim.`,
      ] },
      { title: "2. Czym jest SmartFach", paragraphs: [
        "SmartFach jest usługą cyfrową świadczoną przez internet. Asystent AI pomaga dopasować kierunek usługowy do warunków użytkownika, przygotować ofertę, treści i wiadomości, planować działania oraz analizować przekazane wyniki. Udostępniamy rozmowy tekstowe, analizę zdjęć, zapis preferencji i historii oraz wyszukiwanie informacji, gdy wymaga tego zadanie i funkcja jest dostępna.",
        "Konto jest przeznaczone dla jednej pełnoletniej osoby. Lite i Pro różnią się wielkością limitu korzystania z AI. Nie obejmują kont pracowników, kursu, osobistej opieki ludzkiego mentora ani wykonania sprzedaży za użytkownika. Użytkownik sam wysyła przygotowane wiadomości, podejmuje decyzje i wykonuje działania poza aplikacją.",
        "Podawane w serwisie cele, w tym 10 000 zł miesięcznego przychodu, są przykładami celów do zaplanowania. Nie stanowią zapewnienia ich osiągnięcia, terminu, zysku ani dochodu pasywnego. Wyniki zależą m.in. od umiejętności, pracy, oferty, kosztów i sytuacji rynkowej. Przychód nie oznacza dochodu ani zysku.",
      ] },
      { title: "3. Wymagania techniczne", paragraphs: [
        "Potrzebujesz połączenia z internetem, aktywnego adresu e-mail oraz aktualnej, wspieranej wersji przeglądarki Chrome, Safari, Edge lub Firefox z włączonym JavaScript i niezbędnymi mechanizmami sesji. Dostęp jest możliwy na komputerze, telefonie i tablecie. Koszt internetu i urządzenia ponosi użytkownik.",
        "SmartFach jest obecnie udostępniany jako aplikacja internetowa działająca w przeglądarce. Nie oferujemy obecnie osobnej aplikacji natywnej w App Store ani Google Play. AI, logowanie, płatności i synchronizacja wymagają internetu.",
        "Załączniki są ograniczone do obsługiwanych przez formularz obrazów: maksymalnie trzy zdjęcia w jednej wiadomości i łączny limit żądania wskazany przez aplikację. Dla bezpieczeństwa obowiązuje dodatkowo limit 20 zapytań AI na godzinę i konto. SmartFach może odmówić przetworzenia pliku w nieobsługiwanym formacie albo zbyt dużego żądania.",
        "Typowe ryzyka usług internetowych obejmują phishing, przejęcie hasła, złośliwe oprogramowanie i nieuprawnione użycie urządzenia. Korzystaj z aktualnego systemu, unikalnego hasła i wylogowuj się na wspólnych urządzeniach. Nie udostępniaj danych logowania.",
      ] },
      { title: "4. Konto, zamówienie i zawarcie umowy", paragraphs: [
        "Konto zakładasz przez podanie nazwy, adresu e-mail, hasła i wyboru planu oraz zaakceptowanie Regulaminu. Założenie konta jest bezpłatne i samo w sobie nie uruchamia obciążenia karty. Potwierdzenie adresu e-mail jest wymagane przed wejściem do asystenta.",
        "Po rejestracji przechodzisz do bezpiecznego formularza Stripe. Przed zatwierdzeniem widzisz wybrany plan, cenę, częstotliwość odnowienia, okres próbny i metodę płatności. Umowa o subskrypcję na czas nieoznaczony zostaje zawarta po skutecznym zatwierdzeniu zamówienia z obowiązkiem zapłaty po próbie oraz potwierdzeniu jego przyjęcia przez system. Przerwany lub odrzucony formularz nie jest zakupem.",
        "Prosimy osobno o wyraźne żądanie rozpoczęcia świadczenia usługi przed upływem terminu odstąpienia. Nie oznacza ono zrzeczenia się uprawnień konsumenta. Potwierdzenie warunków zamówienia wraz z treścią zaakceptowanych dokumentów przekazujemy na adres e-mail konta.",
        "Podaj prawidłowy adres e-mail. Gdy nie zostanie potwierdzony przed końcem próby, subskrypcja jest ustawiana do zakończenia bez przejścia w płatne odnowienie. Potwierdzenie adresu w trakcie próby może uruchomić odnowienie zgodnie z zamówieniem; nie cofa odrębnej rezygnacji złożonej przez użytkownika.",
      ] },
      { title: "5. Ceny, próba i płatności cykliczne", paragraphs: [
        "3-dniowa próba jest dostępna jeden raz na konto. Ponowny zakup po wykorzystaniu próby rozpoczyna płatny abonament bez kolejnej próby; należność i termin są pokazane przed zatwierdzeniem zamówienia.",
        `SmartFach Lite kosztuje ${plans.lite.price} miesięcznie, a SmartFach Pro ${plans.pro.price} miesięcznie. Są to całkowite ceny w PLN dla użytkownika, obejmujące podatki należne przy sprzedaży. Abonament jest płatny z góry za każdy miesięczny okres.`,
        "Próba trwa 3 pełne dni od aktywacji w Stripe i wymaga zapisania obsługiwanej metody płatności. Przy rozpoczęciu próby należność wynosi 0 zł. Dokładny termin jej zakończenia jest wskazany w płatności i danych abonamentu. Bank może przeprowadzić techniczną weryfikację karty.",
        "Jeśli nie anulujesz subskrypcji przed końcem próby, Stripe pobierze pierwszą miesięczną opłatę za zamówiony plan. Kolejne opłaty są pobierane automatycznie co miesiąc do czasu anulowania. Zgoda dotyczy kwoty i częstotliwości pokazanych przed zatwierdzeniem zamówienia. Zmiana karty lub zaprzestanie używania serwisu nie anuluje abonamentu.",
        "Metody płatności dostępne dla danego zamówienia pokazuje Stripe. SmartFach nie zapisuje pełnego numeru karty ani kodu CVC. Jeśli płatność się nie powiedzie, operator płatności może ją ponowić i poprosić o aktualizację metody płatności. Dostęp do AI może zostać wstrzymany do uregulowania należności. Reklamację błędnego obciążenia możesz złożyć bezpośrednio do nas.",
        "Zmiana planu i jej ewentualne wyrównanie wymagają zatwierdzenia warunków pokazanych w portalu płatności. Dane do dokumentu sprzedaży należy podać prawidłowo. Dokumenty rozliczeniowe dostarczamy zgodnie z obowiązującymi przepisami; potwierdzenie płatności Stripe nie zastępuje dokumentu podatkowego, jeżeli taki dokument jest wymagany.",
      ] },
      { title: "6. Miesięczny limit i jego zwiększenie", paragraphs: [
        "Ze względów bezpieczeństwa obowiązuje ograniczenie do 20 prób zapytań na godzinę na użytkownika oraz jedno przetwarzane zadanie na konto jednocześnie. Przed wysłaniem zapytania część dostępnej puli jest tymczasowo rezerwowana. Utrata połączenia może wymagać sprawdzenia próby przez obsługę przed zwolnieniem rezerwacji; sama rezerwacja nie jest dodatkową płatnością.",
        "Każdy plan zawiera 100% miesięcznego limitu korzystania z AI. W aplikacji pokazujemy pozostały lub wykorzystany procent. Limit nie oznacza stałej liczby wiadomości, ponieważ zadania różnią się zakresem i kosztem wykonania.",
        "Tempo wykorzystania limitu ustalamy na podstawie wewnętrznego budżetu planu i faktycznego kosztu poprawnie obsłużonego żądania, obejmującego przetworzenie kontekstu, odpowiedź i ewentualne narzędzia. Dłuższa rozmowa, zdjęcia, złożona analiza i wyszukiwanie internetowe mogą wykorzystywać limit szybciej niż krótka odpowiedź tekstowa. Jeżeli dostawca nie zwróci pomiaru, stosujemy ostrożne zastępcze oszacowanie uwzględniające wiadomość, zdjęcia i narzędzia. Aktualny stan procentowy jest widoczny w aplikacji.",
        "Pula planu odnawia się przy rozpoczęciu nowego okresu rozliczeniowego; niewykorzystana część podstawowego limitu nie przechodzi na kolejny okres. Próbę obejmuje pula wybranego planu. Po wyczerpaniu dostępnego limitu dalsza praca AI zostaje zablokowana do odnowienia lub świadomego zakupu zwiększenia. Nie pobieramy automatycznie dodatkowych opłat za przekroczenie limitu. Operacje zakończone błędem bez dostarczenia odpowiedzi nie powinny obciążać limitu; błędne naliczenie korygujemy po zgłoszeniu.",
        `Jednorazowe zwiększenia limitu danego planu: ${creditPacks.map(pack => `+${pack.percentage}% za ${pack.price}`).join("; ")}. Cena jest całkowita. Wielkość zwiększenia, cena i warunki są widoczne przed osobnym zamówieniem. Zakup nie odnawia się automatycznie i nie zmienia abonamentu.`,
        "Najpierw wykorzystywana jest pula planowa, następnie dokupiona. Niewykorzystane zwiększenie przechodzi na kolejne okresy i pozostaje na istniejącym koncie po anulowaniu abonamentu. Jego wykorzystanie wymaga aktywnego planu. Przed trwałym usunięciem konta można skontaktować się w sprawie pozostałego limitu. Zasady te nie ograniczają prawa odstąpienia, reklamacji ani zwrotu należnego na podstawie prawa.",
      ] },
      { title: "7. Anulowanie abonamentu i zamknięcie konta", paragraphs: [
        `Anulujesz odnowienie w aplikacji przez Ustawienia → Zarządzaj abonamentem / portal płatności. Możesz też wysłać jednoznaczną rezygnację na ${operator.email}; w takim przypadku liczy się chwila otrzymania oświadczenia, a nie jego późniejsza obsługa. Warto zachować potwierdzenie.`,
        "Anulowanie przed końcem próby zapobiega pierwszej opłacie. Anulowanie w płatnym okresie zatrzymuje kolejne odnowienie; dostęp pozostaje do końca opłaconego okresu, chyba że żądasz wcześniejszego zakończenia. Samo zwykłe anulowanie nie powoduje zwrotu za prawidłowo wykonany bieżący okres. Niezależnie możesz skorzystać z ustawowego odstąpienia lub reklamacji.",
        `Usunięcie konta i eksport danych zgłosisz na ${operator.email}. Kopię zapisanych rozmów i preferencji możesz także pobrać w Ustawieniach. Przed usunięciem weryfikujemy tożsamość w niezbędnym zakresie i koordynujemy zakończenie płatności. Usunięcie konta usuwa możliwość korzystania z jego danych i pozostałego limitu; przed wykonaniem otrzymasz informację o skutkach.`,
        "W razie naruszenia Regulaminu możemy wezwać do jego zaprzestania, a następnie ograniczyć lub zakończyć dostęp, podając przyczynę. Natychmiastowe czasowe ograniczenie jest dopuszczalne, gdy jest niezbędne do ochrony bezpieczeństwa, powstrzymania bezprawnego działania albo wykonania obowiązku prawnego. Zapewniamy możliwość wyjaśnienia sprawy i zakwestionowania decyzji przez e-mail.",
      ] },
      { title: "8. Prawo odstąpienia w ciągu 14 dni", paragraphs: [
        "Konsument może odstąpić od umowy zawartej na odległość bez podania przyczyny w ciągu 14 dni od jej zawarcia. Dotyczy to także osobnego zakupu zwiększenia limitu, licząc termin od tej umowy. Rozpoczęcie 3-dniowej próby nie skraca ustawowego terminu. Dostęp do asystenta sam w sobie nie powoduje utraty prawa odstąpienia.",
        `Wystarczy wysłać jednoznaczne oświadczenie przed upływem terminu na ${operator.email} albo adres ${operator.address}. Możesz użyć formularza zamieszczonego na końcu Regulaminu, ale nie jest to obowiązkowe. Wskaż konto i zamówienie, których dotyczy oświadczenie. Potwierdzimy otrzymanie e-mailem.`,
        "Możesz także skorzystać z funkcji „Odstąp od umowy tutaj” na https://smartfach.pl/odstapienie, dostępnej w stopce serwisu i ustawieniach konta. Po sprawdzeniu danych zamówienia wybierz „Potwierdź odstąpienie”. Otrzymasz potwierdzenie oświadczenia i czasu jego złożenia. Logowanie nie jest wymagane; inne powyższe sposoby pozostają dostępne.",
        "Jeżeli na Twoje wyraźne żądanie usługa rozpoczęła się przed upływem terminu odstąpienia, rozliczenie za część odpłatnie spełnionego świadczenia do chwili odstąpienia następuje wyłącznie w zakresie dopuszczonym prawem, proporcjonalnie do jej zakresu i umówionej ceny. Bezpłatne dni próby pozostają bezpłatne. Nie obciążamy za świadczenie, jeżeli nie zostały spełnione ustawowe warunki takiego rozliczenia. Nie ustanawiamy opłaty za samo odstąpienie.",
        "Należny zwrot realizujemy bez zbędnej zwłoki, najpóźniej w ciągu 14 dni od otrzymania oświadczenia, tą samą metodą płatności, chyba że wyraźnie uzgodnisz inną bez dodatkowego kosztu. Prawo odstąpienia i ochronę dotyczącą usługi cyfrowej stosujemy także do osoby fizycznej prowadzącej działalność, gdy zawierana umowa nie ma dla niej zawodowego charakteru, w zakresie przewidzianym ustawą o prawach konsumenta.",
      ] },
      { title: "9. Zgodność usługi z umową i reklamacje", paragraphs: [
        "Odpowiadamy za zgodność usługi cyfrowej z umową przez okres jej dostarczania zgodnie z ustawą o prawach konsumenta. Dostarczamy aktualizacje potrzebne do zachowania zgodności, w tym bezpieczeństwa, i informujemy o nich w odpowiednich przypadkach. Zastrzeżenia o ograniczeniach AI nie uchylają tej odpowiedzialności.",
        "W razie niezgodności konsument może żądać doprowadzenia usługi do zgodności, a w ustawowo określonych sytuacjach obniżenia ceny albo odstąpienia. Usunięcie niezgodności powinno nastąpić w rozsądnym czasie, bez kosztów i nadmiernych niedogodności, z uwzględnieniem charakteru i celu usługi. Przy niedostarczeniu usługi przysługują uprawnienia przewidziane prawem.",
        `Reklamację można wysłać na ${operator.email} lub adres korespondencyjny. Opisz problem, termin wystąpienia, konto i oczekiwane rozwiązanie. Numer płatności lub zrzut błędu może pomóc, ale brak dodatkowego dowodu nie jest sam w sobie podstawą odmowy rozpoznania. Nie przesyłaj hasła ani pełnych danych karty.`,
        "Odpowiadamy na reklamację konsumenta w ciągu 14 dni od otrzymania, na e-mail lub innym trwałym nośniku. Brak odpowiedzi w tym terminie wywołuje skutki przewidziane prawem. Dla pozostałych użytkowników przyjmujemy ten sam termin odpowiedzi. Możesz skorzystać z pomocy miejskiego lub powiatowego rzecznika konsumentów, Inspekcji Handlowej oraz informacji UOKiK. Udział w konkretnym postępowaniu pozasądowym ustala się zgodnie z właściwymi przepisami; nie ogranicza to drogi sądowej.",
      ] },
      { title: "10. Ograniczenia i bezpieczne korzystanie z AI", paragraphs: [
        "Rozmawiasz z systemem sztucznej inteligencji, a nie człowiekiem. Odpowiedzi mogą zawierać błędy, nieaktualne dane, nieprawidłowe wyliczenia, pozorne źródła lub nietrafne rekomendacje. Sprawdź fakty, ceny, prawa do treści i przydatność rezultatu przed jego wykorzystaniem. Link do źródła nie gwarantuje poprawnej interpretacji jego treści.",
        "SmartFach nie świadczy indywidualnego doradztwa prawnego, podatkowego, medycznego ani inwestycyjnego i nie zastępuje osoby z wymaganymi uprawnieniami. Nie używaj odpowiedzi jako jedynej podstawy decyzji o zdrowiu, bezpieczeństwie, inwestycji lub zobowiązaniu finansowym. Proponowana działalność może wymagać zezwoleń, kwalifikacji, rejestracji i rozliczeń, które trzeba zweryfikować.",
        "Dostawca modelu może zmieniać się ze względów jakościowych lub dostępności. Zachowujemy opisany cel i istotny zakres usługi; nie sprzedajemy dostępu do określonego modelu ani gwarancji identycznych wyników. Źródła internetowe i treść zdjęć stanowią materiał do analizy, a nie polecenia upoważniające system do działania w Twoim imieniu.",
      ] },
      { title: "11. Treści użytkownika i prawa własności", paragraphs: [
        "Zachowujesz przysługujące Ci prawa do własnych treści. Udzielasz nam niewyłącznego upoważnienia do ich przetwarzania, przechowywania i przekazywania dostawcom w zakresie niezbędnym do wykonania zamówionej funkcji, obsługi zgłoszeń i zabezpieczenia usługi, na zasadach Polityki prywatności. Nie sprzedajemy Twoich rozmów innym użytkownikom.",
        "Możesz wykorzystywać otrzymane rezultaty, w tym komercyjnie, z poszanowaniem prawa i praw osób trzecich. Wynik AI może być podobny do rezultatu uzyskanego przez inną osobę; nie zapewniamy wyłączności ani powstania praw autorskich do każdego wygenerowanego elementu. Zweryfikuj zwłaszcza cudze znaki, fotografie i materiały przed publikacją.",
        "Kod, wygląd, znak SmartFach i pozostałe własne materiały usługodawcy są chronione zgodnie z prawem. Abonament uprawnia do korzystania z funkcji, nie przenosi praw do oprogramowania. Nie wolno rozpowszechniać konta ani odsprzedawać dostępu bez uzgodnienia.",
      ] },
      { title: "12. Działania niedozwolone i dane innych osób", paragraphs: [
        "Zabronione jest dostarczanie treści bezprawnych, oszustwo, podszywanie się pod inne osoby, naruszanie cudzych praw, generowanie spamu, obchodzenie limitów i autoryzacji, atakowanie infrastruktury oraz używanie usługi do wyrządzania szkody. Nie wprowadzaj haseł, kluczy API, danych karty, tajemnic prawnie chronionych, danych o zdrowiu ani innych szczególnych kategorii danych lub danych o wyrokach i czynach zabronionych.",
        "Obecny SmartFach służy pracy nad własną usługą i nie jest systemem przechowywania kartotek klientów. Opisując sytuacje klientów i współpracowników, usuń ich identyfikatory i używaj opisów anonimowych. Nie dodawaj danych osobowych innych osób do rozmów ani zdjęć dokumentów tożsamości. Jeżeli potrzebujesz przetwarzania identyfikowalnych danych klientów w imieniu firmy, uzgodnij z nami odpowiednie warunki przed ich przekazaniem.",
      ] },
      { title: "13. Dostępność i zmiany usługi", paragraphs: [
        "Podejmujemy działania potrzebne do prawidłowego i bezpiecznego funkcjonowania serwisu. Mogą wystąpić przerwy techniczne, awarie sieci lub dostawców. O zaplanowanych istotnych przerwach informujemy z wyprzedzeniem, gdy jest to możliwe. Usuwamy awarie bez zbędnej zwłoki. Nie wyłącza to uprawnień z tytułu niezgodności z umową.",
        "Zmiany wykraczające poza konieczne utrzymanie zgodności są dopuszczalne z uzasadnionych powodów: zmiany prawa, poprawa bezpieczeństwa, konieczne dostosowanie do systemów lub dostawców, usunięcie błędów albo rozwój funkcji zgodnych z celem usługi. Nie mogą powodować dodatkowego kosztu bez zgody. O zmianie informujemy jasno; jeżeli istotnie i negatywnie wpływa na dostęp lub korzystanie, przekazujemy z wyprzedzeniem na trwałym nośniku jej cechy, termin i uprawnienia użytkownika, w tym możliwość wypowiedzenia bez opłat w ustawowym terminie 30 dni, gdy prawo je przewiduje.",
      ] },
      { title: "14. Odpowiedzialność", paragraphs: [
        "Odpowiedzialność usługodawcy określają właściwe przepisy prawa. Nie ograniczamy uprawnień konsumenta ani uprawnień przedsiębiorcy objętego ochroną konsumencką. Brak gwarancji wyniku biznesowego nie oznacza wyłączenia odpowiedzialności za niewykonanie lub nienależyte wykonanie naszej umowy.",
        "Decyzje o rozpoczęciu działalności, wydatkach, publikacji i kontaktach z klientami podejmuje użytkownik. Ocena ewentualnej odpowiedzialności uwzględnia rzeczywistą przyczynę szkody, obowiązki obu stron i ustawowe zasady. Nie wymagamy zrzeczenia się roszczeń wynikających z bezwzględnie obowiązujących przepisów.",
      ] },
      { title: "15. Prywatność i zmiany Regulaminu", paragraphs: [
        "Zasady danych osobowych, odbiorców, przechowywania rozmów, ograniczonego dostępu administratora i praw użytkownika opisuje Polityka prywatności. Zapoznanie się z nią nie jest zgodą na dowolne przetwarzanie danych ani warunkiem zgody marketingowej.",
        "Regulamin możemy aktualizować z powodu zmiany prawa, zasad bezpieczeństwa, funkcji lub sposobu świadczenia opisanej usługi. Zmiany istotne dla trwającej umowy przekazujemy wcześniej e-mailem, wyjaśniając przyczynę, zakres i datę. Nie stosujemy ich wstecz. Zmiana ceny lub istotnego zakresu zobowiązań wymaga zgody, gdy przewiduje to prawo; milczenie nie jest taką zgodą. Użytkownik zachowuje prawa do rezygnacji i zakończenia umowy.",
        "Stosujemy prawo polskie z zachowaniem bezwzględnie obowiązującej ochrony konsumenta wynikającej z właściwego prawa. Właściwość sądu określają przepisy; nie narzucamy konsumentowi sądu siedziby usługodawcy. Nieważność jednego postanowienia nie uchyla ustawowych praw ani pozostałych zgodnych z prawem postanowień.",
      ] },
      { title: "Załącznik — formularz odstąpienia od umowy", paragraphs: [
        `Adresat: ${operator.name}, ${operator.address}, ${operator.email}.`,
        "Niniejszym informuję o odstąpieniu od umowy dotyczącej SmartFach (subskrypcja / jednorazowe zwiększenie limitu — wskaż właściwe).",
        "Data zawarcia umowy: …\nImię i nazwisko: …\nAdres konsumenta: …\nE-mail konta lub numer zamówienia: …\nData oświadczenia: …\nPodpis (tylko przy wysyłce na papierze): …",
        "Formularz jest dobrowolny. Wystarczy inne jednoznaczne oświadczenie wysłane w terminie.",
      ] },
    ],
  };
}

export function privacyDocument(operator: Operator): LegalDocument {
  return { title: "Polityka prywatności SmartFach", version: legalDocumentVersion, sections: [
    { title: "1. Administrator i kontakt", paragraphs: [
      `Administratorem danych w związku z prowadzeniem serwisu SmartFach jest ${operator.name}, ${operator.address}, NIP ${operator.taxId}, REGON ${operator.regon}. W sprawach danych osobowych skontaktuj się pod adresem ${operator.email} lub telefonem ${operator.phone}.`,
      "Dokument wyjaśnia zasady przetwarzania danych odwiedzających, osób kontaktujących się oraz użytkowników kont. Pojęcia administratora, danych osobowych i przetwarzania mają znaczenie określone w RODO. Nie żądamy zgody na tę politykę jako ogólnego zezwolenia na przetwarzanie; dla każdego celu wskazujemy własną podstawę.",
    ] },
    { title: "2. Dane i ich źródła", paragraphs: [
      "Od Ciebie otrzymujemy: adres e-mail, nazwę lub imię, dane do faktury podane przy zakupie, preferencje dotyczące pracy, cel, doświadczenie, ograniczenia, treści wiadomości i dodane zdjęcia. Pole hasła jest obsługiwane przez system uwierzytelniania; administrator nie ma dostępu do Twojego hasła w postaci jawnej.",
      "W ramach działania serwisu powstają: identyfikator konta, historia i tytuły rozmów, odpowiedzi AI, daty działań, plan, stan subskrypcji i próby, potwierdzenie akceptacji dokumentów, naliczenia limitu, koszt przetwarzania, metadane techniczne (m.in. adres IP, przeglądarka, błędy, identyfikator żądania) oraz audyt dostępu administratora.",
      "Ze Stripe otrzymujemy dane potrzebne do rozliczenia i obsługi abonamentu: identyfikatory klienta, zamówienia i subskrypcji, status płatności, terminy, kwoty, walutę, podane dane rozliczeniowe oraz informację o przypisaniu metody płatności. Nie otrzymujemy pełnego numeru karty ani CVC. Z usługi AI otrzymujemy odpowiedzi, źródła i dane o zużyciu.",
    ] },
    { title: "3. Cele i podstawy prawne", paragraphs: [
      "Założenie konta, logowanie, dostarczanie odpowiedzi AI, zapis kontekstu i historii, realizacja zakupu, naliczanie limitu i obsługa rezygnacji — art. 6 ust. 1 lit. b RODO, czyli wykonanie umowy lub działania na Twoje żądanie przed jej zawarciem.",
      "Rozliczenia podatkowe, rachunkowe, obowiązki konsumenckie, dokumentowanie żądań i współpraca z uprawnionymi organami — art. 6 ust. 1 lit. c RODO, w zakresie obowiązków wynikających z właściwych przepisów.",
      "Kontakt niezwiązany bezpośrednio z zawarciem umowy, zapewnienie bezpieczeństwa, zapobieganie oszustwom, kontrola uprawnień, pomiar kosztów, diagnozowanie konkretnych błędów, niezbędna kontrola jakości oraz ustalenie, dochodzenie lub obrona roszczeń — art. 6 ust. 1 lit. f RODO. Naszym interesem jest obsługa korespondencji, niezawodność i bezpieczeństwo usługi oraz ochrona praw. Oceniając zakres przetwarzania, uwzględniamy prawa i oczekiwania użytkownika.",
      "Marketing wymagający zgody lub opcjonalne mechanizmy śledzące mogą zostać uruchomione wyłącznie po spełnieniu odrębnych wymogów prawnych i udzieleniu odpowiedniej informacji. Obecne założenie konta nie zapisuje automatycznie do newslettera ani nie stanowi zgody na marketing.",
    ] },
    { title: "4. Co trafia do AI", paragraphs: [
      "Po wysłaniu wiadomości przekazujemy do OpenRouter i obsługującego żądanie dostawcy modelu treść polecenia, potrzebny fragment rozmowy, zapisane preferencje oraz aktualnie dodane zdjęcia. Wyszukiwanie może przekazać do dostawcy wyszukiwarki zapytanie sformułowane na podstawie rozmowy. Nie przesyłamy w tym celu hasła ani danych karty.",
      "Obrazy są przetwarzane w ramach bieżącego żądania; obecna historia nie jest archiwum oryginalnych załączników. W historii mogą zostać opis obrazu, jego nazwa i informacje z niego odczytane. Jeśli zdjęcie zawiera dane osobowe, są one również przekazywane do analizy, dlatego przed dodaniem usuń lub zasłoń informacje zbędne.",
      "Stosujemy ustawienia routingu ograniczające użycie danych przez dostawców do realizacji żądania i wyłączające dozwolone przez konfigurację zbieranie danych do treningu. Nie oznacza to braku przechowywania rozmów w Twoim koncie SmartFach. Dostawcy mogą przechowywać metadane operacyjne i rozliczeniowe. Aktualnie korzystamy z OpenRouter i modeli dostarczanych przez OpenAI/Microsoft lub Google; konkretną trasę ustala router z uwzględnieniem dostępności i ustawień prywatności.",
      "Nie wprowadzaj szczególnych kategorii danych, takich jak zdrowie, pochodzenie, przekonania czy dane biometryczne, danych o karalności, haseł ani poufnych kartotek klientów. SmartFach nie jest przeznaczony do przetwarzania tych danych. Opisując innych ludzi, używaj informacji zanonimizowanych.",
    ] },
    { title: "5. Dostęp człowieka do rozmów", paragraphs: [
      "Rozmowy nie są publiczne i nie są dostępne innym użytkownikom. Upoważniony administrator SmartFach może jednak odczytać treść wiadomości, odpowiedzi oraz zapisany kontekst konkretnego konta, gdy jest to potrzebne do obsługi zgłoszenia, sprawdzenia błędu, bezpieczeństwa lub proporcjonalnej kontroli jakości odpowiedzi. Taki odczyt jest rejestrowany w audycie.",
      "Nie traktujemy tego jako prawa do nieograniczonego przeglądania życia prywatnego użytkownika. Dobieramy zakres do celu, a do ogólnej analizy produktu preferujemy statystyki i dane pozbawione identyfikatorów. Nie udostępniamy rozmów reklamodawcom ani nie publikujemy ich jako przykładów bez odrębnego uzgodnienia. Możesz wnieść sprzeciw wobec przetwarzania opartego na uzasadnionym interesie; rozpatrzymy go na zasadach RODO.",
    ] },
    { title: "6. Odbiorcy danych i dostawcy", paragraphs: [
      "Vercel — hosting aplikacji, obsługa żądań i logi techniczne. Supabase — uwierzytelnianie, baza kont, rozmów, preferencji i rozliczeń. Stripe — przyjmowanie płatności, weryfikacja metody płatności, abonament, zapobieganie oszustwom i portal klienta. OpenRouter oraz dostawca obsługującego modelu lub wyszukiwania — przetworzenie polecenia, zdjęć i kontekstu. Hostido / dostawca poczty skonfigurowany dla domeny — obsługa korespondencji i wiadomości transakcyjnych.",
      "Dane mogą otrzymać również upoważnione osoby obsługujące serwis, dostawcy niezbędnego wsparcia, księgowość, doradcy prawni i uprawnione organy — w zakresie potrzebnym do celu i na właściwej podstawie. Dostawcom działającym w naszym imieniu powierzamy dane na podstawie wymaganych umów. Stripe może działać także jako odrębny administrator m.in. dla własnych obowiązków prawnych i przeciwdziałania nadużyciom, na zasadach swojej polityki prywatności.",
    ] },
    { title: "7. Przetwarzanie poza Europejskim Obszarem Gospodarczym", paragraphs: [
      "Korzystanie z dostawców chmurowych i AI może wiązać się z przetwarzaniem lub dostępem do danych poza EOG, w szczególności w USA. Sam wybór europejskiego regionu bazy nie wyklucza takiego dostępu dla wsparcia, infrastruktury lub innych funkcji.",
      "Gdy dochodzi do transferu objętego RODO, stosujemy właściwy mechanizm: decyzję Komisji Europejskiej stwierdzającą odpowiedni stopień ochrony (w tym EU–US Data Privacy Framework wyłącznie dla objętego nim, aktualnie certyfikowanego odbiorcy) albo standardowe klauzule umowne i wymagane dodatkowe zabezpieczenia. Informację o mechanizmie dla konkretnego odbiorcy i kopię odpowiednich zabezpieczeń, z ochroną cudzych praw i tajemnic, można uzyskać przez kontakt z administratorem.",
    ] },
    { title: "8. Jak długo przechowujemy dane", paragraphs: [
      "Aby bezpiecznie obsługiwać ponowienia po utracie połączenia, przechowujemy techniczną kopię wyniku AI, dostępną do ponownego odebrania przez 24 godziny. Codzienne czyszczenie usuwa treść kopii starszych niż 24 godziny (zwykle w ciągu 48 godzin od zakończenia próby). Identyfikatory prób i rozliczenia pozostają do obsługi konta i zapobiegania powtórnemu naliczeniu. Te kopie są oddzielne od zapisanej historii rozmów.",
      "Profil, preferencje i zapisane rozmowy przechowujemy podczas utrzymywania konta, aby możliwa była kontynuacja pracy. Samo anulowanie abonamentu zatrzymuje odnowienie i nie jest żądaniem usunięcia konta. Po zgłoszeniu i wykonaniu usunięcia dane robocze są usuwane, chyba że konkretny obowiązek prawny lub obrona roszczenia wymaga zachowania niezbędnego fragmentu.",
      "Dokumenty sprzedaży i rozliczeń przechowujemy przez okres wynikający z obowiązujących przepisów podatkowych i rachunkowych. Potwierdzenia umów, akceptacji i niezbędną korespondencję dotyczącą roszczeń przechowujemy do upływu właściwych terminów przedawnienia, z uwzględnieniem ich przerwania lub zawieszenia. Nie jest to podstawą zachowywania całych rozmów bez związku ze sprawą.",
      "Korespondencję obsługujemy przez czas potrzebny do zakończenia sprawy i ewentualnej ochrony związanych z nią roszczeń. Logi i audyt przechowujemy przez czas konieczny do wyjaśnienia incydentów, bezpieczeństwa i rozliczalności, ograniczając ich zakres. Dane w kopiach zapasowych są wycofywane w cyklu retencji dostawcy i nie służą bieżącemu odtwarzaniu usuniętego konta. Przy obsłudze żądania informujemy o mających zastosowanie wyjątkach i ograniczeniach.",
      "Zasada nadrzędna: nie przechowujemy danych dłużej, niż wymaga konkretny cel. Żądanie usunięcia nie obejmuje danych, które musimy zachować z mocy prawa; dostęp do nich jest wówczas ograniczony do właściwego celu.",
    ] },
    { title: "9. Twoje prawa", paragraphs: [
      "W granicach i na warunkach RODO przysługuje Ci prawo dostępu do danych i kopii, sprostowania, usunięcia, ograniczenia przetwarzania oraz przenoszenia danych przetwarzanych automatycznie na podstawie zgody lub umowy. Jeżeli podstawą jest zgoda, możesz ją wycofać w dowolnym momencie bez wpływu na zgodność wcześniejszego przetwarzania.",
      "Możesz wnieść sprzeciw z przyczyn związanych ze swoją szczególną sytuacją wobec przetwarzania na podstawie art. 6 ust. 1 lit. f RODO. Wobec marketingu bezpośredniego sprzeciw przysługuje bez uzasadnienia. Po sprzeciwie ocenimy, czy istnieją wymagane prawem nadrzędne podstawy dalszego przetwarzania; marketing bezpośredni zakończymy.",
      `Żądanie wyślij na ${operator.email}. Możemy poprosić o informacje potrzebne do bezpiecznej weryfikacji tożsamości, nie żądamy jednak zbędnych dokumentów. Odpowiadamy zasadniczo w ciągu miesiąca; o uzasadnionym przedłużeniu i jego przyczynach informujemy zgodnie z RODO.`,
      "Masz prawo złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych (uodo.gov.pl), także bez wcześniejszego kontaktu z nami. Kopię rozmów i preferencji możesz samodzielnie pobrać w Ustawieniach; nie ogranicza to szerszego prawa dostępu do danych.",
    ] },
    { title: "10. Dobrowolność i automatyczne decyzje", paragraphs: [
      "Podanie danych jest dobrowolne, ale e-mail, dane uwierzytelniające i informacje niezbędne do zakupu są potrzebne do utworzenia konta i wykonania umowy. Bez nich nie możemy udostępnić odpowiednich funkcji. Dodatkowe preferencje i treść zadania wybierasz sam; ich zakres wpływa na dopasowanie odpowiedzi.",
      "AI dobiera propozycje na podstawie rozmowy i preferencji. Nie podejmuje w Twoim imieniu decyzji wywołujących skutki prawne lub podobnie istotnie na Ciebie wpływających w rozumieniu art. 22 RODO. Reguły abonamentu i limitu deterministycznie kontrolują dostęp. Operator płatności może stosować własne mechanizmy oceny ryzyka opisane w jego informacji o prywatności.",
    ] },
    { title: "11. Cookies i pamięć urządzenia", paragraphs: [
      "Korzystamy z niezbędnych mechanizmów sesji, uwierzytelnienia i bezpieczeństwa, w tym cookies Supabase. Umożliwiają logowanie i utrzymanie sesji. Płatności Stripe używają swoich mechanizmów niezbędnych do obsługi i ochrony transakcji. Blokada niezbędnych cookies może uniemożliwić logowanie lub zakup.",
      "Nie uruchamiamy Meta Pixel ani Google Analytics. Po stronie serwera zapisujemy pierwsze zdarzenia operacyjne przypisane do konta: rejestrację, otwarcie i ukończenie płatności, pierwszą odpowiedź AI, zatwierdzony start, aktywację lub zakończenie abonamentu i doładowanie. Służą do sprawdzania poprawności procesu i pomiaru aktywacji; nie zawierają treści rozmów ani identyfikatorów reklamowych i nie korzystają z dodatkowych cookies. Usuwamy je wraz z kontem. Jeśli dodamy narzędzia marketingowe lub opcjonalne śledzenie, zapewnimy uprzednie informacje i wymagany wybór zgody. Akceptacja Regulaminu nie zastępuje zgody marketingowej.",
      "Przeglądarka zapisuje wyłącznie dane niezbędne do działania serwisu, w szczególności sesję logowania i ustawienia techniczne. Usunięcie danych zapisanych na urządzeniu nie usuwa danych przechowywanych na koncie i nie anuluje abonamentu.",
    ] },
    { title: "12. Ochrona danych i aktualizacje", paragraphs: [
      "Stosujemy szyfrowanie transmisji HTTPS, kontrolę sesji i uprawnień, izolację kont w bazie, serwerowe przechowywanie sekretów i audyt dostępu administratora. Żaden system nie gwarantuje całkowitego braku ryzyka. Podejrzenie przejęcia konta lub ujawnienia danych zgłoś niezwłocznie przez kontakt.",
      "Serwis jest przeznaczony dla osób pełnoletnich. Nie wymaga podawania danych dzieci ani identyfikowalnych danych klientów. Jeśli takie dane zostały przekazane omyłkowo, skontaktuj się w celu ich usunięcia.",
      "Politykę aktualizujemy, gdy zmieniają się rzeczywiste procesy lub wymagania prawne. Wskazujemy wersję dokumentu, a o istotnych zmianach dotyczących użytkowników informujemy odpowiednim kanałem, np. e-mailem lub komunikatem w aplikacji. Nowy cel wymagający odrębnej podstawy nie wynika automatycznie z publikacji nowej wersji polityki.",
    ] },
  ] };
}

export function legalDocumentText(document: LegalDocument) {
  return `${document.title}\nWersja: ${document.version}\n\n${document.sections.map(section => `${section.title}\n\n${section.paragraphs.join("\n\n")}`).join("\n\n")}\n`;
}
