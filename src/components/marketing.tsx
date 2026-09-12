import Link from "next/link";
import {
  ArrowRight,
  Ban,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Clock3,
  Compass,
  HeartHandshake,
  Lightbulb,
  ListChecks,
  LogIn,
  Menu,
  MessageCircle,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  WalletCards,
} from "lucide-react";
import { BrandMark } from "./brand";
import { plans } from "@/domain/billing";

type PublicPlanId = "lite" | "pro";
type FaqItem = readonly [question: string, answer: string];

const fitOptions = [
  {
    icon: BriefcaseBusiness,
    label: "MAM ETAT I DOŚWIADCZENIE",
    title: "Nie wiem jeszcze, co z tego mogę sprzedawać",
    copy: "Zaczniemy od problemów i zadań, które znasz lepiej niż osoba spoza Twojej branży.",
  },
  {
    icon: Compass,
    label: "MAM KILKA POMYSŁÓW",
    title: "Nie wiem, który z nich ma sens",
    copy: "Porównamy najwyżej kilka kierunków i wybierzemy jeden mały test zamiast rozbudowanego planu.",
  },
  {
    icon: Clock3,
    label: "CHCĘ ZACZĄĆ PO GODZINACH",
    title: "Potrzebuję ograniczyć czas i ryzyko",
    copy: "Pierwszy krok dopasujemy do realnego kalendarza i budżetu, bez rzucania pracy w ciemno.",
  },
  {
    icon: Ban,
    label: "WIEM, CZEGO NIE CHCĘ",
    title: "Odrzucimy kierunki, które do Ciebie nie pasują",
    copy: "Bez telefonu, pokazywania twarzy, dużego wkładu albo pracy fizycznej — jeśli to Twoje granice.",
  },
] as const;

const planDetails: Record<
  PublicPlanId,
  { audience: string; description: string; features: readonly string[] }
> = {
  lite: {
    audience: "SPOKOJNY START",
    description:
      "Dla osoby, która chce wybrać kierunek i wykonywać kilka najważniejszych działań w miesiącu.",
    features: [
      "Osobisty kierunek dopasowany do Twoich warunków",
      "Pomoc w ofercie, cenie i pierwszych działaniach",
      "Tekst, zdjęcia i research w internecie",
      "Zapisana historia i ustalenia",
      "Standardowy miesięczny limit",
    ],
  },
  pro: {
    audience: "REGULARNE DZIAŁANIE",
    description:
      "Dla osoby, która chce regularnie budować ofertę, zdobywać klientów i poprawiać wyniki.",
    features: [
      "Wszystko z planu Lite",
      "Wyższy miesięczny limit",
      "Więcej researchu rynku i klientów",
      "Więcej pracy nad ofertami i wiadomościami",
      "Regularna aktualizacja następnych działań",
    ],
  },
};

const faqItems: readonly FaqItem[] = [
  [
    "Czy muszę mieć pomysł na biznes?",
    "Nie. SmartFach zaczyna od Twoich warunków: czasu, budżetu, doświadczenia, sposobu pracy i rzeczy, których nie chcesz robić. Następnie pomaga porównać ograniczoną liczbę realnych usług i wybrać najprostszy test.",
  ],
  [
    "Czy SmartFach jest również dla osoby pracującej na etacie?",
    "Tak. Możesz zacząć od małego testu po godzinach, bez deklarowania odejścia z pracy. Czas, budżet i akceptowalne ryzyko są częścią Twojego kontekstu.",
  ],
  [
    "Czy muszę rzucić pracę, aby zacząć?",
    "Nie. SmartFach pomaga dobrać pierwszy krok do czasu, który naprawdę masz. Celem jest sprawdzenie kierunku w kontrolowany sposób, zanim podejmiesz większą decyzję.",
  ],
  [
    "Co, jeśli nie mam żadnych wyjątkowych umiejętności?",
    "Nie potrzebujesz eksperckiego poziomu na starcie. SmartFach może wskazać usługi wykorzystujące to, co już umiesz, albo kierunki z małym progiem wejścia. Zawsze powinien również pokazać, czego trzeba się nauczyć przed przyjęciem zlecenia.",
  ],
  [
    "Czy mogę zacząć bez pokazywania twarzy?",
    "Tak. Jeżeli nie chcesz nagrywać filmów ani budować marki osobistej, SmartFach uwzględni to jako granicę i zaproponuje inne sposoby pracy oraz docierania do klientów.",
  ],
  [
    "Czy SmartFach gwarantuje klientów lub określony przychód?",
    "Nie. Pomaga przygotować ofertę, sposób dotarcia i kolejny test, ale nie może zagwarantować klienta, sprzedaży, kwoty ani terminu. Wynik zależy również od rynku, jakości realizacji i Twoich działań.",
  ],
  [
    "Czy to jest kurs?",
    "Nie. Pracujesz na swojej aktualnej sytuacji. SmartFach pomaga przygotować konkretny rezultat, zapamiętuje rozmowy i po wykonaniu działania pomaga dostosować kolejny krok.",
  ],
  [
    "Jak działają 3 dni bez opłat?",
    "Przy rozpoczęciu podajesz kartę, ale dzisiaj płacisz 0 zł. Jeśli anulujesz przed końcem trzeciego dnia, pierwsza miesięczna opłata nie zostanie pobrana. Bez anulowania wybrany plan rozpocznie się automatycznie.",
  ],
];

export function MarketingHeader() {
  return (
    <header className="marketing-header">
      <Link className="marketing-brand" href="/" aria-label="SmartFach — strona główna">
        <BrandMark size={38} />
        <span>Smart<b>Fach</b></span>
      </Link>
      <nav aria-label="Główna nawigacja">
        <Link href="/#jak-dziala">Jak to działa</Link>
        <Link href="/#przykladowa-droga">Przykładowe drogi</Link>
        <Link href="/cennik">Cennik</Link>
        <Link href="/kontakt">Kontakt</Link>
      </nav>
      <div className="marketing-header-actions">
        <Link className="marketing-login" href="/logowanie?plan=pro">
          <span>Zacznij za 0 zł</span>
          <ArrowRight size={16} />
        </Link>
        <Link className="marketing-account-login" href="/logowanie" aria-label="Zaloguj się" title="Zaloguj się">
          <UserRound size={18} aria-hidden="true" />
          <span>Zaloguj się</span>
        </Link>
        <details className="marketing-mobile-menu">
          <summary aria-label="Otwórz menu"><Menu size={21} /></summary>
          <nav aria-label="Nawigacja telefonu">
            <span className="mobile-menu-title">MENU</span>
            <Link href="/#jak-dziala">Jak to działa</Link>
            <Link href="/#dla-ciebie">Dla Ciebie</Link>
            <Link href="/#przykladowa-droga">Przykładowe drogi</Link>
            <Link href="/#co-dostajesz">Co dostajesz</Link>
            <Link href="/cennik">Cennik</Link>
            <Link href="/kontakt">Kontakt</Link>
            <Link className="mobile-menu-login" href="/logowanie"><LogIn size={16} /> Mam już konto — zaloguj się</Link>
            <Link className="mobile-menu-start" href="/logowanie?plan=pro">Zacznij 3 dni za 0 zł <ArrowRight size={15} /></Link>
          </nav>
        </details>
      </div>
    </header>
  );
}

function ProductPreview() {
  return (
    <div className="preview-stage start-preview-stage">
      <div className="preview-float preview-float-top" aria-hidden="true">
        <SearchCheck size={14} /> Kierunek wybrany
      </div>
      <div className="preview-float preview-float-bottom" aria-hidden="true">
        <ListChecks size={14} /> Następny krok gotowy
      </div>
      <div className="product-preview" aria-label="Podgląd działania SmartFach">
        <div className="preview-top">
          <span><BrandMark size={25} /> SmartFach</span>
          <small className="preview-scenario-label">SCENARIUSZ PRZYKŁADOWY</small>
        </div>
        <div className="preview-question">
          <span>Ty</span>
          Znam Excel, mam 5 godzin tygodniowo i chcę dorobić po pracy. Co mogę sprzedać?
        </div>
        <div className="preview-card start-result-card">
          <div><Target size={20} /><span><small>REKOMENDACJA DO SPRAWDZENIA</small><strong>Porządkowanie arkuszy i prostych raportów dla mikrofirm</strong></span></div>
          <dl>
            <div><dt>Dlaczego</dt><dd>Excel + kontakty</dd></div>
            <div><dt>Ryzyko</dt><dd>Nieznany popyt</dd></div>
            <div><dt>Test</dt><dd>3 krótkie rozmowy</dd></div>
          </dl>
          <div className="preview-next-step"><Check size={15} /> Dziś: zapytaj trzy znane firmy o najbardziej uciążliwy arkusz.</div>
        </div>
        <p><ShieldCheck size={14} /> To przykład sposobu pracy, nie historia klienta ani obietnica wyniku.</p>
      </div>
    </div>
  );
}

function FitSection() {
  return (
    <section className="marketing-section fit-section" id="dla-ciebie">
      <div className="section-intro">
        <p className="marketing-kicker">TO NIE MUSI BYĆ BRAK POMYSŁU</p>
        <h2>Czasem po prostu nie widzisz biznesu w tym, co robisz codziennie.</h2>
        <p>SmartFach zaczyna od Twojej sytuacji, zamiast podsuwać każdemu tę samą listę modnych pomysłów.</p>
      </div>
      <div className="fit-grid">
        {fitOptions.map(({ icon: Icon, label, title, copy }) => (
          <article key={label}>
            <span><Icon size={23} /></span>
            <small>{label}</small>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function StartingCapital() {
  const resources = [
    [Lightbulb, "Umiejętności", "To, co robisz dobrze w pracy i poza nią."],
    [BriefcaseBusiness, "Doświadczenie", "Problemy i branże, które znasz od środka."],
    [Compass, "Zainteresowania", "Tematy, które chcesz rozwijać dłużej niż tydzień."],
    [HeartHandshake, "Kontakty", "Ludzie i środowiska, do których masz naturalny dostęp."],
    [Clock3, "Czas i ograniczenia", "Realna liczba godzin, budżet i rzeczy, których nie chcesz robić."],
  ] as const;
  return (
    <section className="marketing-section capital-section" aria-labelledby="capital-title">
      <div className="capital-heading">
        <p className="marketing-kicker">TWÓJ KAPITAŁ STARTOWY</p>
        <h2 id="capital-title">Nie zaczynasz od zera.</h2>
        <p>SmartFach łączy te elementy, żeby znaleźć kierunek dopasowany do Ciebie — nie kolejną modną listę pomysłów z internetu.</p>
      </div>
      <div className="capital-grid">
        {resources.map(([Icon, title, copy], index) => (
          <article key={title}>
            <span><Icon size={21} /></span>
            <small>0{index + 1}</small>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ActionSystem() {
  const steps = [
    ["POZNAJEMY TWOJĄ SYTUACJĘ", "Czas, doświadczenie, umiejętności, kontakty, budżet i granice."],
    ["WYBIERAMY KIERUNEK", "Maksymalnie kilka realnych możliwości i jedna rekomendacja do sprawdzenia."],
    ["BUDUJEMY PIERWSZĄ USŁUGĘ", "Odbiorca, problem, rezultat, zakres i sposób ustalenia ceny."],
    ["PLANUJEMY MAŁY TEST", "Dopasowany sposób dotarcia i jedno działanie możliwe do wykonania dzisiaj."],
  ] as const;
  return (
    <section className="marketing-section action-system" id="jak-dziala">
      <div className="section-intro">
        <p className="marketing-kicker">JAK TO DZIAŁA</p>
        <h2>Od Twojej sytuacji do pierwszego testu na rynku.</h2>
        <p>Po wykonaniu działania wracasz z wynikiem, odpowiedzią rynku albo nową informacją. SmartFach pomaga wtedy poprawić kolejny krok.</p>
      </div>
      <div className="action-steps" aria-label="Jak działa SmartFach">
        {steps.map(([label, value], index) => (
          <div key={label}>
            <span>0{index + 1}</span>
            <p><small>{label}</small><strong>{value}</strong></p>
            {index < steps.length - 1 && <ArrowRight size={17} />}
          </div>
        ))}
      </div>
    </section>
  );
}

function ExamplePaths() {
  const examples = [
    {
      name: "Marta",
      start: "Pracuje w administracji i ma około 5 godzin tygodniowo.",
      resources: "Dobrze zna Excel i ma kontakty w kilku małych firmach.",
      direction: "Porządkowanie arkuszy i prostych raportów dla mikrofirm.",
      test: "Trzy rozmowy ze znanymi właścicielami o najbardziej uciążliwych arkuszach.",
    },
    {
      name: "Kamil",
      start: "Pracuje w branży budowlanej i chce zacząć bez dużej inwestycji.",
      resources: "Sprawnie organizuje zakupy i zna lokalnych wykonawców.",
      direction: "Pomoc małym ekipom w porządkowaniu zakupów oraz zapytań do dostawców.",
      test: "Rozmowa z trzema ekipami o błędach i opóźnieniach przy zamawianiu materiałów.",
    },
    {
      name: "Ola",
      start: "Pracuje w obsłudze klienta i chce działać zdalnie po godzinach.",
      resources: "Dobrze pisze, porządkuje informacje i nie chce pokazywać twarzy.",
      direction: "Przygotowanie szablonów odpowiedzi i bazy wiedzy dla małych sklepów online.",
      test: "Krótki audyt komunikacji jednego sklepu i przygotowanie próbki trzech odpowiedzi.",
    },
  ] as const;
  return (
    <section className="marketing-section example-section" id="przykladowa-droga" aria-labelledby="examples-title">
      <div className="section-intro">
        <p className="marketing-kicker">PRZYKŁADOWE DROGI</p>
        <h2 id="examples-title">Ten sam proces. Zupełnie inne punkty wyjścia.</h2>
        <p>To ilustracje sposobu myślenia SmartFach. Nie są opiniami klientów ani obietnicą rezultatu.</p>
      </div>
      <div className="example-grid">
        {examples.map((example, index) => (
          <article key={example.name}>
            <div className="example-card-top">
              <span>0{index + 1}</span>
              <small>SCENARIUSZ PRZYKŁADOWY — POSTAĆ FIKCYJNA</small>
            </div>
            <h3>{example.name}</h3>
            <dl>
              <div><dt>Punkt wyjścia</dt><dd>{example.start}</dd></div>
              <div><dt>Zasoby</dt><dd>{example.resources}</dd></div>
              <div><dt>Możliwy kierunek</dt><dd>{example.direction}</dd></div>
              <div><dt>Pierwszy mały test</dt><dd>{example.test}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProductWalkthrough() {
  return (
    <section className="marketing-section product-section" id="produkt" aria-labelledby="product-title">
      <div className="product-section-copy">
        <p className="marketing-kicker">PRAWDZIWY SPOSÓB PRACY</p>
        <h2 id="product-title">Jedna rozmowa. Jeden kierunek. Jedno działanie na dziś.</h2>
        <p>Każdy nowy czat może dotyczyć osobnego biznesu. Krótka ankieta zapisuje kontekst tylko tej rozmowy, a Ty możesz też od razu zadać własne pytanie.</p>
        <ul>
          <li><Check size={16} /> najwyżej kilka możliwości zamiast niekończącej się listy</li>
          <li><Check size={16} /> jedna rekomendacja z powodem i ryzykiem</li>
          <li><Check size={16} /> jedno zadanie, z którym możesz ruszyć dzisiaj</li>
        </ul>
      </div>
      <div className="product-workbench" aria-label="Przykład interfejsu SmartFach">
        <div className="workbench-top"><BrandMark size={24} /><strong>Nowy biznes</strong><small>Scenariusz przykładowy</small></div>
        <div className="workbench-survey">
          <span>Jak chcesz pracować?</span>
          <div><b>Zdalnie</b><b>Lokalnie</b><b>Bez znaczenia</b></div>
          <span>Na jakim jesteś etapie?</span>
          <div><b>Mam umiejętności</b><b>Nie mam pomysłu</b><b>Mam pomysł</b></div>
        </div>
        <div className="workbench-answer">
          <small>SMARTFACH · REKOMENDACJA</small>
          <h3>Zacznij od usługi, którą możesz sprawdzić bez rzucania etatu.</h3>
          <p><strong>Do sprawdzenia:</strong> czy trzy znane firmy rzeczywiście tracą czas na ręczne raporty.</p>
          <div><ListChecks size={17} /><span><small>DZIAŁANIE NA DZIŚ</small><strong>Umów trzy krótkie rozmowy i zapisz powtarzający się problem.</strong></span></div>
        </div>
      </div>
    </section>
  );
}

function Outcomes() {
  const outcomes = [
    [Compass, "Kierunek", "Ograniczona lista usług dopasowanych do Twojej sytuacji."],
    [Target, "Oferta", "Problem klienta, zakres, cena i powód, żeby wybrać właśnie Ciebie."],
    [SearchCheck, "Klienci", "Miejsca dotarcia, kryteria wyboru i konkretna lista działań."],
    [MessageCircle, "Wiadomości", "Pierwszy kontakt, odpowiedzi i poprawki bez pustej kartki."],
    [WalletCards, "Cel finansowy", "Cena i liczba sprzedaży potrzebna do osiągnięcia Twojego celu."],
    [ListChecks, "Plan na dziś", "Jedno najważniejsze działanie zamiast kolejnej teorii."],
  ] as const;
  return (
    <section className="marketing-section outcomes-section" id="co-dostajesz">
      <div className="outcomes-copy">
        <p className="marketing-kicker">CO MOŻESZ WYPRACOWAĆ</p>
        <h2>Konkretne elementy biznesu, nie obietnicę wyniku.</h2>
        <p>Każdy etap kończy się czymś, co możesz wykorzystać: decyzją, ofertą, wiadomością, sposobem dotarcia albo zadaniem do wykonania.</p>
        <Link href="/logowanie?plan=pro">Zacznij 3 dni za 0 zł <ArrowRight size={16} /></Link>
      </div>
      <div className="outcome-grid builder-outcome-grid">
        {outcomes.map(([Icon, title, copy]) => (
          <article key={title}><Icon size={23} /><strong>{title}</strong><span>{copy}</span></article>
        ))}
      </div>
    </section>
  );
}

function ContinuityLoop() {
  return (
    <section className="marketing-section continuity-section builder-loop">
      <div className="section-intro">
        <p className="marketing-kicker">ASYSTENT DO REGULARNEJ PRACY</p>
        <h2>Planujesz, działasz, wracasz z wynikiem i poprawiasz.</h2>
        <p>Oferta rzadko jest idealna za pierwszym razem. Wróć do tej samej rozmowy z odpowiedzią klienta albo nową informacją, a SmartFach pomoże dostosować następne działanie. Kontekst jednego biznesu nie miesza się z innymi czatami.</p>
      </div>
      <div className="continuity-loop">
        {[
          ["01", "PLANUJESZ", "Wybierasz najbliższy krok"],
          ["02", "DZIAŁASZ", "Sprawdzasz go na rynku"],
          ["03", "WRACASZ", "Podajesz wyniki i odpowiedzi"],
          ["04", "POPRAWIASZ", "Dostosowujesz kolejne działanie"],
        ].map(([number, label, value], index) => (
          <div key={label}>
            <span>{number}</span>
            <p><small>{label}</small><strong>{value}</strong></p>
            {index < 3 && <ArrowRight size={17} />}
          </div>
        ))}
      </div>
    </section>
  );
}

function TrustSection() {
  const points = [
    [MessageCircle, "Prawdziwy produkt", "Pokazujemy sposób pracy zgodny z działającą aplikacją, nie wymyślony panel."],
    [ShieldCheck, "Jasne granice", "Bez gwarancji klienta, przychodu ani terminu. Ty zatwierdzasz i wykonujesz działania."],
    [WalletCards, "Pełne zasady próby", "Przed startem widzisz 0 zł dzisiaj, kartę, cenę planu i datę pierwszej opłaty."],
    [HeartHandshake, "Kontakt przed zakupem", "Możesz zapytać o produkt lub rozliczenia, zanim rozpoczniesz próbę."],
  ] as const;
  return (
    <section className="marketing-section trust-section" aria-labelledby="trust-title">
      <div className="section-intro">
        <p className="marketing-kicker">ZAUFANIE BEZ FIKCYJNYCH OPINII</p>
        <h2 id="trust-title">Wiesz, co dostajesz i czego SmartFach nie obiecuje.</h2>
      </div>
      <div className="trust-grid">
        {points.map(([Icon, title, copy]) => (
          <article key={title}><Icon size={21} /><h3>{title}</h3><p>{copy}</p></article>
        ))}
      </div>
    </section>
  );
}

function PricingSection() {
  const planIds: readonly PublicPlanId[] = ["lite", "pro"];
  return (
    <section className="marketing-section pricing-section" id="cennik">
      <div className="section-intro">
        <p className="marketing-kicker">JEDEN PRODUKT · DWA TEMPA PRACY</p>
        <h2>Zacznij bez kupowania kolejnego drogiego kursu.</h2>
        <p>Oba plany pomagają przejść od wyboru usługi do zdobywania klientów. Pro daje więcej miejsca na regularny research, oferty i codzienną pracę.</p>
      </div>
      <div className="pricing-grid pricing-grid-two">
        {planIds.map((planId) => {
          const plan = plans[planId];
          const details = planDetails[planId];
          return (
            <article key={planId} className={planId === "pro" ? "featured" : ""}>
              {planId === "pro" && <span className="plan-ribbon">REKOMENDOWANY</span>}
              <small>{details.audience}</small>
              <h3>SmartFach {plan.name}</h3>
              <p>{details.description}</p>
              <strong>{plan.price}<span> / miesiąc</span></strong>
              <ul>{details.features.map((feature) => <li key={feature}><Check size={15} /> {feature}</li>)}</ul>
              <Link href={`/logowanie?plan=${planId}`}>Zacznij 3 dni za 0 zł <ArrowRight size={15} /></Link>
            </article>
          );
        })}
      </div>
      <p className="pricing-context-note"><ShieldCheck size={15} /> Możesz zmienić sposób działania bez utraty historii. Nie kupujesz osobnego produktu, gdy znajdziesz kierunek.</p>
      <p className="trial-disclosure"><ShieldCheck size={15} /> <span><strong>3 dni bez opłat · karta wymagana.</strong> Jeśli nie anulujesz przed końcem próby, pobierzemy cenę wybranego planu za pierwszy miesiąc. Abonament odnawia się co miesiąc do rezygnacji.</span></p>
      <p className="pricing-disclaimer">Przed podpięciem karty zobaczysz 0 zł dzisiaj, wybrany plan i dokładny termin pierwszej opłaty.</p>
    </section>
  );
}

function FAQSection() {
  return (
    <section className="marketing-section faq-section" id="faq">
      <div className="faq-intro">
        <p className="marketing-kicker">BEZ PUSTYCH OBIETNIC</p>
        <h2>Najważniejsze pytania przed startem.</h2>
        <p>SmartFach pomaga wybrać i wykonać działania. Nie sprzedaje gwarancji wyniku ani gotowej recepty pasującej każdemu.</p>
        <div className="faq-contact">
          <MessageCircle size={20} />
          <p><strong>Masz inne pytanie?</strong><span>Napisz do nas, zanim podepniesz kartę.</span></p>
          <Link href="/kontakt">Kontakt <ArrowRight size={14} /></Link>
        </div>
      </div>
      <div className="faq-list">
        {faqItems.map(([question, answer], index) => (
          <details key={question} open={index === 0}>
            <summary><span>{question}</span><ChevronDown size={19} aria-hidden="true" /></summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function MarketingHome() {
  return (
    <div className="marketing-site builder-marketing landing-v3">
      <a className="skip-link" href="#landing-content">Przejdź do treści</a>
      <div className="landing-announcement" aria-label="Najważniejsze informacje o SmartFach">
        <span>3 DNI ZA 0 ZŁ</span>
        <i aria-hidden="true" />
        <span>PLAN OD 49 ZŁ / MIES.</span>
        <i aria-hidden="true" />
        <span>ANULUJ PRZED PIERWSZĄ OPŁATĄ</span>
      </div>
      <MarketingHeader />
      <main id="landing-content">
        <section className="marketing-hero builder-hero">
          <div className="hero-orb hero-orb-one" aria-hidden="true" />
          <div className="hero-orb hero-orb-two" aria-hidden="true" />
          <div className="hero-copy">
            <p className="marketing-kicker hero-kicker"><span aria-hidden="true" /> TWÓJ BIZNES, KROK PO KROKU</p>
            <h1><span>Zbuduj usługę.</span> <em>Zdobądź pierwszego klienta.</em></h1>
            <p className="hero-lead">SmartFach zamienia Twoje umiejętności i dostępny czas w konkretną ofertę, sposób dotarcia do klientów i jedno działanie na dziś.</p>
            <div className="hero-actions">
              <Link className="hero-primary" href="/logowanie?plan=pro">Zacznij 3 dni za 0 zł <ArrowRight size={18} /></Link>
              <Link className="hero-secondary" href="/#jak-dziala">Zobacz, jak to działa</Link>
            </div>
            <p className="hero-purchase-note">0 zł dzisiaj · karta wymagana · potem Pro 99 zł/mies. · anulujesz przed końcem próby</p>
            <div className="hero-path" aria-label="Droga ze SmartFach">
              <span><b>01</b> Kierunek</span>
              <ArrowRight size={15} aria-hidden="true" />
              <span><b>02</b> Oferta</span>
              <ArrowRight size={15} aria-hidden="true" />
              <span><b>03</b> Klient</span>
            </div>
          </div>
          <ProductPreview />
        </section>
        <FitSection />
        <StartingCapital />
        <ActionSystem />
        <ExamplePaths />
        <ProductWalkthrough />
        <Outcomes />
        <ContinuityLoop />
        <TrustSection />
        <PricingSection />
        <FAQSection />
        <section className="marketing-cta builder-cta">
          <BrandMark size={50} />
          <p className="marketing-kicker">TWÓJ PIERWSZY KROK</p>
          <h2>Nie musisz dziś wiedzieć, jaki biznes zbudujesz.</h2>
          <p>Wystarczy, że opiszesz swoją sytuację. SmartFach pomoże znaleźć pierwszy kierunek i zamienić go w małe działanie, które możesz wykonać bez rzucania wszystkiego.</p>
          <Link href="/logowanie?plan=pro">Zacznij 3 dni za 0 zł <ArrowRight size={18} /></Link>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

export function PricingLanding() {
  return (
    <div className="marketing-site path-landing builder-marketing landing-v3 public-v2">
      <MarketingHeader />
      <main>
        <section className="pricing-hero">
          <p className="marketing-kicker"><Sparkles size={14} /> PROSTY ABONAMENT · BEZ KUPIONYCH MARZEŃ</p>
          <h1>Wybierz tempo, w którym chcesz budować swój przychód.</h1>
          <p>Lite i Pro dają ten sam sposób pracy. Różnią się miesięcznym limitem i intensywnością korzystania.</p>
        </section>
        <PricingSection />
        <FAQSection />
      </main>
      <MarketingFooter />
    </div>
  );
}

export function MarketingFooter() {
  return (
    <footer className="marketing-footer">
      <Link className="marketing-brand" href="/"><BrandMark size={31} /><span>Smart<b>Fach</b></span></Link>
      <p>Asystent AI od własnych warunków do pierwszej sprzedawalnej usługi.</p>
      <div>
        <Link href="/#jak-dziala">Jak to działa</Link>
        <Link href="/#dla-ciebie">Dla Ciebie</Link>
        <Link href="/#co-dostajesz">Co dostajesz</Link>
        <Link href="/cennik">Cennik</Link>
        <Link href="/kontakt">Kontakt</Link>
        <Link href="/regulamin">Regulamin</Link>
        <Link href="/polityka-prywatnosci">Prywatność</Link>
        <Link href="/odstapienie">Odstąp od umowy tutaj</Link>
      </div>
    </footer>
  );
}
