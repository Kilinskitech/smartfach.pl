import Link from "next/link";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { MarketingFooter, MarketingHeader } from "./marketing";
import { ContactForm } from "./contact-form";
import { BrandMark } from "./brand";
import { smartFachOperator } from "@/domain/operator";

export function ContactPage() {
  return (
    <div className="marketing-site public-info-site">
      <MarketingHeader />
      <main>
        <section className="public-info-hero contact-hero">
          <div>
            <p className="marketing-kicker"><Mail size={14} /> KONTAKT</p>
            <h1>Porozmawiajmy o tym, jak pracujesz.</h1>
            <p>
              Masz pytanie, chcesz przetestować SmartFach albo szukasz planu dla
              zespołu? Napisz krótko, na jakim etapie jesteś.
            </p>
          </div>
          <aside className="contact-card">
            <span><BrandMark size={30} /></span>
            <small>SMARTFACH</small>
            <strong>Kontakt z zespołem SmartFach</strong>
            <p>Opisz swoją sytuację, a odpowiemy konkretnie i bez sprzedażowej presji.</p>
            <a href={`mailto:${smartFachOperator.email}`}>
              <Mail size={16} /> {smartFachOperator.email}
            </a>
            <div className="contact-legal-links">
              Pełne dane operatora znajdziesz w <Link href="/regulamin">Regulaminie</Link>
              {" "}i <Link href="/polityka-prywatnosci">Polityce prywatności</Link>.
            </div>
          </aside>
        </section>
        <section className="public-info-content contact-content">
          <div className="section-intro">
            <p className="marketing-kicker">NAPISZ DO NAS</p>
            <h2>Jedna wiadomość wystarczy.</h2>
            <p>
              Im konkretniej opiszesz swoją firmę lub pomysł, tym konkretniej
              odpowiemy. Zwykle wystarczy branża, liczba osób i największy problem.
            </p>
          </div>
          <ContactForm />
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

function LegalPage({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <div className="marketing-site public-info-site">
      <MarketingHeader />
      <main>
        <section className="public-info-hero legal-hero">
          <div>
            <p className="marketing-kicker"><ShieldCheck size={14} /> DOKUMENTY I ZASADY</p>
            <h1>{title}</h1>
            <p>{lead}</p>
            <small>Ostatnia aktualizacja: 4 września 2026 r.</small>
          </div>
        </section>
        <article className="legal-document">{children}</article>
      </main>
      <MarketingFooter />
    </div>
  );
}

function OperatorDetails() {
  return (
    <address className="legal-operator">
      <strong>{smartFachOperator.name}</strong>
      <span>{smartFachOperator.address}</span>
      <span>NIP: {smartFachOperator.taxId} · REGON: {smartFachOperator.regon}</span>
      <a href={`mailto:${smartFachOperator.email}`}>{smartFachOperator.email}</a>
    </address>
  );
}

export function TermsPage() {
  return (
    <LegalPage
      title="Regulamin SmartFach"
      lead="Najważniejsze zasady konta, 3-dniowego okresu próbnego i odnawianej subskrypcji."
    >
      <div className="legal-alert">
        <ShieldCheck size={20} />
        <p>
          <strong>SmartFach jest nadal wczesną wersją produktu.</strong>
          <span>
            Przed przyjęciem pierwszej realnej płatności dokument wymaga jeszcze
            przeglądu prawnika i uzupełnienia zasad podatkowych. Wiążąca cena,
            waluta, podatki i termin pierwszej opłaty są pokazywane w Stripe Checkout.
          </span>
        </p>
      </div>

      <section>
        <h2>1. Operator i kontakt</h2>
        <p>Operatorem serwisu SmartFach jest:</p>
        <OperatorDetails />
      </section>

      <section>
        <h2>2. Zakres usługi</h2>
        <p>
          SmartFach jest narzędziem wspierającym planowanie oraz codzienną pracę
          firmy. Konto może obejmować asystenta AI, wyceny, protokoły, kartotekę
          klientów, cennik i inne funkcje wskazane w wybranym planie. SmartFach
          nie jest systemem księgowym ani zastępstwem fachowej oceny użytkownika.
        </p>
        <p>
          Plan Firma nie obejmuje jeszcze aktywnych zaproszeń i osobnych loginów
          pracowników, dopóki funkcja nie zostanie jawnie udostępniona na koncie.
          Samo utworzenie konta nie uruchamia okresu próbnego — następuje to dopiero
          po zakończeniu Stripe Checkout i podaniu wymaganej metody płatności.
        </p>
      </section>

      <section>
        <h2>3. Zasady korzystania</h2>
        <ul>
          <li>Wprowadzaj wyłącznie dane, do których przetwarzania masz prawo.</li>
          <li>Nie wprowadzaj haseł, kluczy API, danych szczególnych kategorii ani poufnych danych klientów.</li>
          <li>Nie wykorzystuj serwisu do działań bezprawnych, naruszających prawa innych osób lub bezpieczeństwo systemów.</li>
          <li>Samodzielnie sprawdzaj treść dokumentu przed zapisaniem, pobraniem albo przekazaniem klientowi.</li>
        </ul>
      </section>

      <section>
        <h2>4. Odpowiedzi AI i decyzje użytkownika</h2>
        <p>
          Asystent może popełniać błędy, pomijać informacje lub błędnie rozumieć
          polecenie. Nie zastępuje fachowej oceny technicznej, prawnej, podatkowej,
          medycznej ani finansowej. Użytkownik odpowiada za weryfikację rezultatu i
          za decyzję o jego wykorzystaniu.
        </p>
        <p>
          Ceny, VAT i sumy w dokumentach powinny wynikać z danych użytkownika oraz
          kontrolowanych obliczeń. SmartFach nie daje gwarancji pozyskania
          klienta, przychodu ani innego wyniku biznesowego.
        </p>
      </section>

      <section>
        <h2>5. Okres próbny, opłaty i rezygnacja</h2>
        <p>
          Okres próbny trwa 3 pełne dni i wymaga wcześniejszego podania metody płatności
          w Stripe. W chwili rozpoczęcia próby opłata wynosi 0 zł. Jeśli subskrypcja
          nie zostanie anulowana przed końcem próby, Stripe podejmie pierwszą opłatę
          za wybrany plan, a następnie będzie odnawiać go co miesiąc.
        </p>
        <p>
          Użytkownik zarządza metodą płatności i anulowaniem w portalu Stripe.
          Anulowanie w okresie próbnym zapobiega pierwszej opłacie. Szczegóły ceny,
          terminu obciążenia i podatków są prezentowane przed zatwierdzeniem karty.
        </p>
      </section>

      <section>
        <h2>6. Prawa do serwisu</h2>
        <p>
          Nazwa, identyfikacja wizualna, interfejs i kod SmartFach podlegają ochronie
          prawnej. Użytkownik zachowuje prawa do treści i danych, które sam wprowadza,
          oraz umożliwia ich techniczne przetwarzanie wyłącznie w zakresie
          potrzebnym do działania wybranej funkcji.
        </p>
      </section>

      <section>
        <h2>7. Zgłoszenia i zakończenie korzystania</h2>
        <p>
          Błędy, pytania i zastrzeżenia można wysłać na adres {smartFachOperator.email}.
          Użytkownik może anulować subskrypcję oraz zażądać eksportu lub usunięcia
          danych na zasadach opisanych w polityce prywatności. Operator może zakończyć dostęp po
          wcześniejszej informacji, o ile nie jest potrzebne natychmiastowe działanie
          dla ochrony bezpieczeństwa.
        </p>
      </section>

      <section>
        <h2>8. Postanowienia końcowe</h2>
        <p>
          Regulamin podlega prawu polskiemu. Zmiany będą publikowane wraz z datą
          aktualizacji. W zakresie nieuregulowanym zastosowanie mają właściwe
          przepisy prawa. Kontakt w sprawie dokumentu jest dostępny na stronie
          <Link href="/kontakt"> Kontakt <ArrowRight size={14} /></Link>.
        </p>
      </section>
    </LegalPage>
  );
}

export function PrivacyPage() {
  return (
    <LegalPage
      title="Polityka prywatności SmartFach"
      lead="Wyjaśniamy, jakie dane przetwarza konto, płatność i asystent SmartFach."
    >
      <div className="legal-alert">
        <ShieldCheck size={20} />
        <p>
          <strong>Treść rozmów może być sprawdzana w celu poprawy jakości.</strong>
          <span>
            Upoważniony właściciel SmartFach może odczytać pełne prompty i odpowiedzi,
            aby wykrywać błędy AI i problemy z ciągłością rozmowy. Dostęp jest
            przypisany do użytkownika i rejestrowany w audycie.
          </span>
        </p>
      </div>

      <section>
        <h2>1. Administrator danych</h2>
        <p>Administratorem danych osobowych przekazanych operatorowi jest:</p>
        <OperatorDetails />
      </section>

      <section>
        <h2>2. Jakie dane przetwarzamy</h2>
        <p>
          W korespondencji możemy otrzymać imię i nazwisko, adres e-mail, treść
          wiadomości oraz inne informacje podane dobrowolnie. Prosimy nie przesyłać
          przez formularz danych wrażliwych ani danych klientów.
        </p>
        <p>
          Konto i sesję obsługuje Supabase. W bazie przechowujemy profil, organizację,
          klientów, cennik, dokumenty, rozmowy, zużycie i dane potrzebne do działania
          planu. Stripe obsługuje metodę płatności i subskrypcję; SmartFach nie zapisuje
          pełnego numeru karty ani CVC. Treść polecenia i załączniki mogą być przekazane
          przez OpenRouter do wybranego dostawcy modelu AI.
        </p>
      </section>

      <section>
        <h2>3. Cele i podstawy przetwarzania</h2>
        <ul>
          <li>odpowiedź na wiadomość i prowadzenie korespondencji — prawnie uzasadniony interes administratora;</li>
          <li>podjęcie działań przed zawarciem umowy, gdy pytanie dotyczy przyszłej usługi;</li>
          <li>utworzenie i prowadzenie konta, realizacja subskrypcji oraz dostarczenie funkcji — wykonanie umowy;</li>
          <li>rozliczenia i dokumentacja wymagana prawem — obowiązek prawny;</li>
          <li>ustalenie, dochodzenie lub obrona roszczeń — prawnie uzasadniony interes administratora;</li>
          <li>zapewnienie bezpieczeństwa, pomiar kosztów i diagnostyka błędów AI — prawnie uzasadniony interes administratora, z uwzględnieniem praw użytkownika.</li>
        </ul>
      </section>

      <section>
        <h2>4. Odbiorcy i przekazywanie danych</h2>
        <p>
          Dane mogą otrzymać dostawcy hostingu, bazy i uwierzytelniania (Supabase),
          płatności (Stripe), modeli AI i routingu (OpenRouter oraz wybrany dostawca
          modelu), poczty i obsługi technicznej — tylko w zakresie potrzebnym do celu.
          Formularz kontaktowy nadal korzysta z programu pocztowego użytkownika.
        </p>
        <p>
          Niektórzy dostawcy mogą przetwarzać dane poza Europejskim Obszarem Gospodarczym.
          Przed pierwszą produkcyjną płatnością operator musi zweryfikować regiony,
          umowy powierzenia i właściwy mechanizm transferu dla każdego dostawcy.
        </p>
      </section>

      <section>
        <h2>5. Czas przechowywania</h2>
        <p>
          Korespondencję przechowujemy przez czas potrzebny do obsługi sprawy, a
          następnie przez okres niezbędny do rozliczenia kontaktu lub ochrony przed
          roszczeniami. Dane konta są przechowywane przez okres świadczenia usługi,
          a po jej zakończeniu przez czas potrzebny do rozliczeń, obsługi żądań i
          ochrony przed roszczeniami. Szczegółowe okresy retencji wymagają zatwierdzenia przed startem produkcyjnym.
        </p>
      </section>

      <section>
        <h2>6. Twoje prawa</h2>
        <p>
          W zależności od sytuacji możesz żądać dostępu do danych, ich sprostowania,
          usunięcia, ograniczenia przetwarzania, przeniesienia danych oraz wnieść
          sprzeciw. Masz również prawo złożyć skargę do Prezesa Urzędu Ochrony Danych
          Osobowych. Żądanie możesz wysłać na {smartFachOperator.email}.
        </p>
      </section>

      <section>
        <h2>7. Dobrowolność i automatyczne decyzje</h2>
        <p>
          Podanie danych w wiadomości jest dobrowolne, ale bez adresu zwrotnego i
          treści pytania możemy nie być w stanie odpowiedzieć. Dane kontaktowe nie są
          wykorzystywane do podejmowania decyzji wywołujących skutki prawne wyłącznie
          w sposób zautomatyzowany.
        </p>
      </section>

      <section>
        <h2>8. Pliki cookies</h2>
        <p>
          Obecna wersja nie korzysta z reklamowych ani analitycznych plików cookies.
          Aplikacja używa technicznych cookies potrzebnych do bezpiecznej sesji Supabase.
          Przed dodaniem analityki, reklamy lub zewnętrznych narzędzi polityka
          zostanie uzupełniona, a wymagane wybory użytkownika będą respektowane.
        </p>
      </section>

      <section>
        <h2>9. Aktualizacje i kontakt</h2>
        <p>
          Polityka może być aktualizowana wraz z rozwojem produktu. Najnowsza wersja
          jest publikowana pod tym adresem. Pytania dotyczące prywatności możesz
          wysłać przez stronę <Link href="/kontakt">Kontakt <ArrowRight size={14} /></Link>.
        </p>
      </section>
    </LegalPage>
  );
}
