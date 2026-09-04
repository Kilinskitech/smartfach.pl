import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
  ClipboardCheck,
  Compass,
  FileText,
  Image as ImageIcon,
  Menu,
  MessageCircle,
  Mic,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { BrandMark } from "./brand";
import { plans } from "@/domain/billing";

const paths = [
  {
    id: "odkryj",
    icon: Compass,
    label: "Odkryj",
    title: "Chcesz zacząć, ale nie masz kierunku?",
    copy: "Znajdź kierunek, sprawdzaj go w praktyce i aktualizuj założenia na podstawie tego, co naprawdę działa.",
    result: "Kierunek rozwijany na podstawie wyników",
  },
  {
    id: "uruchom",
    icon: Rocket,
    label: "Uruchom",
    title: "Masz pomysł, ale brakuje Ci planu?",
    copy: "Testuj ofertę, poprawiaj cenę i planuj kolejne działania na podstawie odpowiedzi klientów.",
    result: "Oferta i stale aktualizowane działania",
  },
  {
    id: "prowadz",
    icon: BriefcaseBusiness,
    label: "Prowadź i rozwijaj",
    title: "Masz już klientów albo pracowników?",
    copy: "Obsługuj kolejne zlecenia, zachowuj historię klientów i wykorzystuj ją przy następnej pracy.",
    result: "Pamięć firmy rosnąca z każdym zleceniem",
  },
] as const;

type PricingContext = "discover" | "launch" | "operate";
type PublicPlanId = keyof typeof plans;

const publicPlanDetails = {
  lite: {
    audience: "DLA JEDNEJ OSOBY · LŻEJSZE UŻYCIE",
    description: "Dla jednej osoby, która chce zacząć korzystać ze SmartFach i pracuje z nim od czasu do czasu.",
    features: [
      "Typ konta dopasowany do Twojej sytuacji",
      "Jedno konto użytkownika",
      "Tekst, zdjęcia i nagrania",
      "Zapisane dane i zatwierdzony kontekst",
      "Standardowy miesięczny limit",
    ],
  },
  pro: {
    audience: "DLA JEDNEJ OSOBY · REGULARNA PRACA",
    description: "Dla jednej osoby, która regularnie rozwija lub prowadzi firmę i potrzebuje większego zakresu pracy z asystentem.",
    features: [
      "Typ konta dopasowany do Twojej sytuacji",
      "Wszystko z planu Lite",
      "Wyższy miesięczny limit",
      "Więcej pracy nad ofertami i marketingiem",
      "Więcej wycen, protokołów i wiadomości",
    ],
  },
  firma: {
    audience: "DLA WŁAŚCICIELA I ZESPOŁU",
    description: "Dla firmy, która chce pracować na wspólnych klientach, historii i zasadach zamiast rozdzielać wiedzę między pracowników.",
    features: [
      "Typ konta dopasowany do firmy i zespołu",
      "Właściciel i do 3 pracowników",
      "Wspólni klienci, cennik i historia",
      "Wspólny limit zespołu",
      "Kolejny członek: 49,99 zł / mies.",
    ],
  },
} as const satisfies Record<
  PublicPlanId,
  { audience: string; description: string; features: readonly string[] }
>;

const pricingContent: Record<PricingContext, {
  kicker: string;
  title: string;
  lead: string;
  planIds: readonly PublicPlanId[];
  featuredPlan: PublicPlanId;
  note: string;
}> = {
  discover: {
    kicker: "ABONAMENT DLA JEDNEJ OSOBY",
    title: "Wybierasz intensywność pracy, nie etap swojej firmy.",
    lead: "Lite wystarczy do lżejszej pracy, a Pro daje wyższy miesięczny limit. Typ konta dopasowujesz osobno do swojej sytuacji.",
    planIds: ["lite", "pro"],
    featuredPlan: "pro",
    note: "Odkryj jest typem konta wybieranym na starcie. Gdy Twoja sytuacja się zmieni, ustawisz inny typ w Ustawieniach bez zmiany planu.",
  },
  launch: {
    kicker: "ABONAMENT DLA JEDNEJ OSOBY",
    title: "Wybierz tempo działania. Typ konta pozostaje skupiony na Twoim celu.",
    lead: "Lite daje standardowy zakres, a Pro więcej miejsca na regularną pracę nad ofertą, sprzedażą i kolejnymi zadaniami.",
    planIds: ["lite", "pro"],
    featuredPlan: "pro",
    note: "Uruchom jest typem konta, a nie codziennym przełącznikiem. Późniejsza zmiana w Ustawieniach zachowuje informacje i wykorzystanie limitu.",
  },
  operate: {
    kicker: "DLA JEDNEJ OSOBY LUB ZESPOŁU",
    title: "Pracujesz sam? Wybierz Lite lub Pro. Masz zespół? Wybierz Firma.",
    lead: "Typ Prowadź dopasowuje produkt do pracy z klientami. Plan określa intensywność, liczbę użytkowników i wspólną przestrzeń firmy.",
    planIds: ["lite", "pro", "firma"],
    featuredPlan: "pro",
    note: "Wariant Firma obejmuje właściciela i do 3 członków. Każde kolejne miejsce zwiększa cenę o 49,99 zł miesięcznie.",
  },
};

export function MarketingHeader() {
  return (
    <header className="marketing-header">
      <Link className="marketing-brand" href="/" aria-label="SmartFach — strona główna">
        <BrandMark size={38} />
        <span>Smart<b>Fach</b></span>
      </Link>
      <nav aria-label="Główna nawigacja">
        <Link href="/#sciezki">Jak działa</Link>
        <Link href="/odkryj">Znajdź pomysł</Link>
        <Link href="/uruchom">Uruchom firmę</Link>
        <Link href="/dla-firm">Prowadź firmę</Link>
        <Link href="/cennik">Cennik</Link>
        <Link href="/kontakt">Kontakt</Link>
      </nav>
      <details className="marketing-mobile-menu">
        <summary aria-label="Otwórz menu"><Menu size={21} /></summary>
        <nav aria-label="Nawigacja telefonu">
          <Link href="/#sciezki">Jak działa</Link>
          <Link href="/odkryj">Znajdź pomysł</Link>
          <Link href="/uruchom">Uruchom firmę</Link>
          <Link href="/dla-firm">Prowadź firmę</Link>
          <Link href="/cennik">Cennik</Link>
          <Link href="/kontakt">Kontakt</Link>
        </nav>
      </details>
    </header>
  );
}

function ProductPreview() {
  return (
    <div className="preview-stage">
      <div className="preview-float preview-float-top" aria-hidden="true">
        <Sparkles size={14} /> Gotowe w kilka chwil
      </div>
      <div className="preview-float preview-float-bottom" aria-hidden="true">
        <ClipboardCheck size={14} /> Zapisane u klienta
      </div>
      <div className="product-preview" aria-label="Podgląd działania SmartFach">
      <div className="preview-top">
        <span><BrandMark size={25} /> SmartFach</span>
        <small><i /> Asystent gotowy</small>
      </div>
      <div className="preview-question">
        <span>Ty</span>
        Przygotuj wycenę dla Kowalskiego: montaż klimatyzacji, 5 metrów instalacji i dojazd.
      </div>
      <div className="preview-card">
        <div><FileText size={20} /><span><small>SZKIC WYCENY</small><strong>Montaż klimatyzacji</strong></span></div>
        <dl>
          <div><dt>Klient</dt><dd>Kowalski</dd></div>
          <div><dt>Pozycje</dt><dd>3 do sprawdzenia</dd></div>
          <div><dt>Ceny</dt><dd>Z cennika firmy</dd></div>
        </dl>
        <button>Sprawdź i zapisz <ArrowRight size={15} /></button>
      </div>
      <p><ShieldCheck size={14} /> AI rozumie polecenie. Kwoty liczy kod.</p>
      </div>
    </div>
  );
}

function Paths() {
  return (
    <section className="marketing-section paths-section" id="sciezki">
      <div className="section-intro">
        <p className="marketing-kicker">JEDEN ASYSTENT · TRZY PUNKTY STARTU</p>
        <h2>Zacznij dokładnie tam, gdzie jesteś</h2>
        <p>Przy uruchomieniu wybierasz typ konta dopasowany do swojej sytuacji. Nie przełączasz go podczas codziennej pracy; później możesz zmienić go w Ustawieniach.</p>
      </div>
      <div className="path-grid">
        {paths.map(({ id, icon: Icon, label, title, copy, result }, index) => (
          <article key={id} className={`path-card path-card-${id}`}>
            <div className="path-card-top">
              <span className="path-icon"><Icon size={24} /></span>
              <i>0{index + 1}</i>
            </div>
            <small>TYP KONTA · {label.toUpperCase()}</small>
            <h3>{title}</h3>
            <p>{copy}</p>
            <div className="path-result"><Check size={16} /><span>{result}</span></div>
            <Link href={id === "prowadz" ? "/dla-firm" : `/${id}`}>Zobacz tę ścieżkę <ArrowRight size={16} /></Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function PricingCard({
  planId,
  href,
  featured = false,
}: {
  planId: PublicPlanId;
  href: string;
  featured?: boolean;
}) {
  const plan = plans[planId];
  const details = publicPlanDetails[planId];
  return (
    <article className={featured ? "featured" : ""}>
      {featured && <span className="plan-ribbon">POLECANY</span>}
      <small>{details.audience}</small>
      <h3>SmartFach {plan.name}</h3>
      <p>{details.description}</p>
      <strong>{plan.price}<span> / miesiąc</span></strong>
      <ul>
        {details.features.map((feature) => (
          <li key={feature}><Check size={15} /> {feature}</li>
        ))}
      </ul>
      <Link href={`${href}${href.includes("?") ? "&" : "?"}plan=${planId}`}>
        Rozpocznij 3 dni próbne <ArrowRight size={15} />
      </Link>
    </article>
  );
}

function Pricing({ context }: { context: PricingContext }) {
  const content = pricingContent[context];
  const href = `/logowanie?typ=${context}`;
  return (
    <section className="marketing-section pricing-section" id="cennik">
      <div className="section-intro">
        <p className="marketing-kicker">{content.kicker}</p>
        <h2>{content.title}</h2>
        <p>{content.lead}</p>
      </div>
      <div className={`pricing-grid ${content.planIds.length === 2 ? "pricing-grid-two" : ""}`}>
        {content.planIds.map((planId) => (
          <PricingCard
            key={planId}
            planId={planId}
            href={href}
            featured={planId === content.featuredPlan}
          />
        ))}
      </div>
      {context !== "operate" && (
        <p className="pricing-team-link">
          Masz już zespół? Plan Firma pasuje do typu Prowadź. <Link href="/cennik">Zobacz pełny cennik <ArrowRight size={14} /></Link>
        </p>
      )}
      <p className="pricing-context-note"><ShieldCheck size={15} /> {content.note}</p>
      <p className="trial-disclosure"><ShieldCheck size={15} /> <span><strong>3 dni bez opłat · karta wymagana.</strong> Jeśli nie anulujesz przed końcem próby, pobierzemy cenę wybranego planu za pierwszy miesiąc. Abonament odnawia się co miesiąc do rezygnacji.</span></p>
      <p className="pricing-disclaimer">Ceny i limity pozostają hipotezą do walidacji. Stripe pokaże 0 zł dzisiaj, plan i termin pierwszego obciążenia przed zatwierdzeniem karty.</p>
    </section>
  );
}

function PricingOverview() {
  return (
    <section className="marketing-section pricing-section pricing-overview" id="cennik">
      <div className="section-intro">
        <p className="marketing-kicker">PLAN I TYP KONTA TO DWIE RÓŻNE DECYZJE</p>
        <h2>Plan wybierasz według intensywności i liczby osób.</h2>
        <p>Plan określa limit i liczbę osób. Typ konta dopasowuje asystenta do Twojej sytuacji i zmienisz go później wyłącznie w Ustawieniach.</p>
      </div>
      <div className="pricing-grid">
        {(Object.keys(plans) as PublicPlanId[]).map((planId) => (
          <PricingCard
            key={planId}
            planId={planId}
            href="/logowanie?typ=operate"
            featured={planId === "pro"}
          />
        ))}
      </div>
      <p className="pricing-context-note"><ShieldCheck size={15} /> Typ konta nie zmienia ceny ani terminu odnowienia. Zapisane informacje i wykorzystanie limitu zostają na koncie.</p>
      <p className="trial-disclosure"><ShieldCheck size={15} /> <span><strong>3 dni bez opłat · karta wymagana.</strong> Jeśli nie anulujesz przed końcem próby, pobierzemy cenę wybranego planu za pierwszy miesiąc. Abonament odnawia się co miesiąc do rezygnacji.</span></p>
      <p className="pricing-disclaimer">Ceny i limity są hipotezą dla wczesnej wersji. Checkout pokaże dokładny termin pierwszego obciążenia i zasady rezygnacji.</p>
    </section>
  );
}

export function MarketingHome() {
  return (
    <div className="marketing-site">
      <MarketingHeader />
      <main>
        <section className="marketing-hero">
          <div className="hero-orb hero-orb-one" aria-hidden="true" />
          <div className="hero-orb hero-orb-two" aria-hidden="true" />
          <div className="hero-copy">
            <p className="marketing-kicker hero-kicker"><Sparkles size={14} /> JEDEN ASYSTENT · CAŁY CYKL FIRMY</p>
            <h1>Zacznij tam, gdzie jesteś. <em>Rozwijaj firmę bez zaczynania od zera.</em></h1>
            <p className="hero-lead">Wybierz, czy szukasz kierunku, uruchamiasz pomysł czy prowadzisz firmę. SmartFach dopasuje konto do Twojej sytuacji i pokaże tylko potrzebne narzędzia.</p>
            <div className="hero-actions">
              <Link className="hero-primary" href="#sciezki">Zacznij od swojego etapu <ArrowRight size={18} /></Link>
            </div>
            <div className="hero-trust">
              <span><Check size={15} /> Typ konta dopasowany na starcie</span>
              <span><Check size={15} /> Zmiana później w Ustawieniach</span>
              <span><Check size={15} /> Zachowane dane i historia</span>
            </div>
          </div>
          <ProductPreview />
        </section>
        <section className="input-strip">
          <p>Mówisz. Piszesz. Robisz zdjęcie.</p>
          <div><span><MessageCircle size={18} /> Tekst</span><span><Mic size={18} /> Głos</span><span><ImageIcon size={18} /> Zdjęcie</span></div>
          <strong>SmartFach przygotowuje rezultat.</strong>
        </section>
        <section className="workflow-ribbon" aria-label="Jak działa SmartFach">
          <div><span>01</span><p><strong>Powiedz, czego potrzebujesz</strong><small>Tekstem, głosem albo zdjęciem</small></p></div>
          <i><ArrowRight size={18} /></i>
          <div><span>02</span><p><strong>SmartFach wykonuje pracę</strong><small>Wykorzystuje właściwy kontekst</small></p></div>
          <i><ArrowRight size={18} /></i>
          <div><span>03</span><p><strong>Sprawdzasz gotowy rezultat</strong><small>I przechodzisz do kolejnego zadania</small></p></div>
        </section>
        <Paths />
        <ContinuityLoop />
        <section className="marketing-section operations-showcase">
          <div>
            <p className="marketing-kicker">NIE KOLEJNY OGÓLNY CZAT</p>
            <h2>Nie kończy na poradzie. Pomaga wykonać pracę.</h2>
            <p>SmartFach korzysta z kontekstu Twojej firmy, przygotowuje gotowy rezultat i pozwala Ci go sprawdzić przed zapisem.</p>
            <Link href="/dla-firm">Zobacz SmartFach dla firm <ArrowRight size={16} /></Link>
          </div>
          <div className="outcome-grid">
            <article><FileText size={23} /><strong>Wycena</strong><span>Pozycje, ceny z cennika i gotowy PDF</span></article>
            <article><ClipboardCheck size={23} /><strong>Protokół</strong><span>Wykonana praca zapisana w historii klienta</span></article>
            <article><Users size={23} /><strong>Klienci</strong><span>Kontakty i wcześniejsze dokumenty w jednym miejscu</span></article>
            <article><BarChart3 size={23} /><strong>Rozwój</strong><span>Marketing, oferta i następne zadanie do wykonania</span></article>
          </div>
        </section>
        <PricingOverview />
        <section className="marketing-cta">
          <BrandMark size={50} />
          <h2>Nie potrzebujesz kolejnej teorii. Potrzebujesz następnego kroku.</h2>
          <p>Powiedz SmartFachowi, gdzie jesteś i co chcesz osiągnąć. Pomoże zamienić to w konkretną pracę.</p>
          <Link href="/cennik">Wybierz plan i zacznij 3 dni próby <ArrowRight size={18} /></Link>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

const landingData = {
  discover: {
    kicker: "MASZ CHĘĆ, ALE NIE MASZ JESZCZE KIERUNKU?",
    title: "Znajdź kierunek, sprawdzaj go i rozwijaj — krok po kroku.",
    lead: "Ustal cel dojścia do 10 000 zł miesięcznego przychodu. Wracaj z wynikami, aktualizuj liczby i wybieraj ze SmartFach kolejne działania.",
    cta: "Zacznij pracować nad celem",
    href: "/logowanie?typ=discover",
    icon: Compass,
    trust: "10 000 zł to cel do regularnego sprawdzania, nie gwarancja wyniku.",
    resultLabel: "W trakcie pracy rozwijasz:",
    items: ["Cel i kierunek działania", "Aktualizowane założenia", "Plan najbliższych zadań", "Historię decyzji i wyników"],
    benefitTitle: "Plan nie kończy pracy. Zmienia się razem z tym, czego dowiadujesz się z rynku.",
    benefitLead: "SmartFach zapamiętuje zatwierdzone ustalenia, dzięki czemu po każdym teście możesz podjąć kolejną decyzję bez zaczynania od zera.",
    benefits: [
      ["Aktualizuj zamiast zaczynać od nowa", "Wracaj do pomysłu po każdym teście i poprawiaj cenę, koszty, grupę klientów albo sposób dotarcia."],
      ["Decyzje oparte na wynikach", "Zapisuj, co zadziałało, co nie i czego dowiedziałeś się od klientów. Kolejny krok wykorzysta te informacje."],
      ["Dopasuj konto, gdy sytuacja się zmieni", "Gdy kierunek jest gotowy, zmieniasz typ konta na Uruchom w Ustawieniach. Dotychczasowe rozmowy pozostają zapisane."],
    ],
  },
  launch: {
    kicker: "SMARTFACH URUCHOM · OD POMYSŁU DO DZIAŁANIA",
    title: "Testuj ofertę, poprawiaj ją i planuj kolejne działania.",
    lead: "Ustal, co sprzedajesz, komu i za ile. Wracaj z odpowiedziami klientów, aktualizuj priorytety i zawsze wiedz, co warto zrobić jako następne.",
    cta: "Zacznij w Uruchom",
    href: "/logowanie?typ=launch",
    icon: Rocket,
    trust: "Typ konta zmienisz później w Ustawieniach bez zmiany abonamentu.",
    resultLabel: "W każdym cyklu poprawiasz:",
    items: ["Klienta i jego problem", "Ofertę oraz cenę", "Działania sprzedażowe", "Priorytet na kolejny tydzień"],
    benefitTitle: "Nie potrzebujesz sztywnego biznesplanu. Potrzebujesz regularnego następnego kroku.",
    benefitLead: "SmartFach pomaga planować, wykonać działanie, zapisać wynik i dostosować kolejne zadanie do tego, co wydarzyło się naprawdę.",
    benefits: [
      ["Najbliższe działania", "Planujesz to, co możesz wykonać teraz, zamiast tworzyć dokument, który po tygodniu przestaje być aktualny."],
      ["Korekty na podstawie rynku", "Aktualizujesz ofertę, cenę i komunikację wraz z informacjami z rozmów oraz pierwszych prób sprzedaży."],
      ["Pomoc przy wykonaniu", "Tworzysz wiadomości, oferty i treści razem z asystentem, a rezultat zapisujesz do następnego cyklu."],
    ],
  },
  operate: {
    kicker: "SMARTFACH · PROWADŹ I ROZWIJAJ",
    title: "Mniej administracji. Więcej czasu na klientów i rozwój firmy.",
    lead: "Powiedz lub napisz, co trzeba zrobić. SmartFach pomoże przygotować wycenę, protokół i wiadomość, a historię pracy zachowa przy właściwym kliencie.",
    cta: "Ułatw sobie prowadzenie firmy",
    href: "/logowanie?typ=operate",
    icon: BriefcaseBusiness,
    trust: "Ty zatwierdzasz dokumenty. Kwoty i reguły biznesowe pozostają pod kontrolą.",
    resultLabel: "Jedno polecenie może przygotować:",
    items: ["Wycenę do sprawdzenia i PDF", "Protokół z wizyty", "Wiadomość do klienta", "Zapis w historii klienta"],
    benefitTitle: "Jedno zdanie może zakończyć kilka minut pracy biurowej.",
    benefitLead: "Najczęstsze zadania firmy są dostępne w jednym asystencie — dla właściciela pracującego solo i dla zespołu.",
    benefits: [
      ["Dokument zamiast pustej kartki", "Tworzysz wyceny, protokoły i wiadomości na podstawie krótkiego polecenia, zdjęcia albo nagrania."],
      ["Historia klienta w jednym miejscu", "Wcześniejsze ustalenia, wykonane prace i dokumenty zostają przypisane do właściwej osoby."],
      ["Jeden sposób pracy firmy", "Cennik, klienci i dokumenty pozostają spójne, niezależnie od tego, czy działasz sam czy z pracownikami."],
    ],
  },
} as const;

function PathBenefits({ mode }: { mode: keyof typeof landingData }) {
  const page = landingData[mode];
  return (
    <section className="marketing-section path-benefits" id="jak-pomaga">
      <div className="section-intro">
        <p className="marketing-kicker">KONKRETNA POMOC, NIE PUSTA ROZMOWA</p>
        <h2>{page.benefitTitle}</h2>
        <p>{page.benefitLead}</p>
      </div>
      <div className="path-benefit-grid">
        {page.benefits.map(([title, copy], index) => (
          <article key={title}>
            <span>0{index + 1}</span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ContinuityLoop() {
  const steps = [
    ["PLANUJESZ", "Ustalasz najbliższy krok"],
    ["DZIAŁASZ", "Wykonujesz go w praktyce"],
    ["WRACASZ Z WYNIKIEM", "Zapisujesz liczby i wnioski"],
    ["AKTUALIZUJESZ", "Dostosowujesz dalsze działania"],
  ] as const;
  return (
    <section className="marketing-section continuity-section">
      <div className="section-intro">
        <p className="marketing-kicker">PLAN JEST POCZĄTKIEM</p>
        <h2>SmartFach działa dalej, gdy pojawiają się prawdziwe wyniki.</h2>
        <p>Planujesz, wykonujesz kolejny krok i wracasz z tym, co wydarzyło się w praktyce. SmartFach kontynuuje na podstawie zapisanej rozmowy, aktualizuje priorytety i pomaga wybrać dalsze działanie.</p>
      </div>
      <div className="continuity-loop" aria-label="Ciągły cykl pracy ze SmartFach">
        {steps.map(([label, value], index) => (
          <div key={label}>
            <span>0{index + 1}</span>
            <p><small>{label}</small><strong>{value}</strong></p>
            {index < steps.length - 1 && <ArrowRight size={17} />}
          </div>
        ))}
      </div>
      <div className="continuity-promise">
        <ShieldCheck size={23} />
        <p><strong>Typ konta zmienia się razem z firmą.</strong><span>Na co dzień widzisz tylko narzędzia potrzebne w swojej sytuacji. Kiedy etap działalności naprawdę się zmieni, aktualizujesz typ w Ustawieniach bez utraty danych.</span></p>
        <Link href="/logowanie">Zacznij od swojej sytuacji <ArrowRight size={16} /></Link>
      </div>
    </section>
  );
}

function HonestGoalPlan() {
  const steps = [
    ["CEL", "10 000 zł przychodu"],
    ["OFERTA", "Cena i realne koszty"],
    ["SPRZEDAŻ", "Potrzebna liczba klientów"],
    ["DZIAŁANIE", "Zadania na ten tydzień"],
  ] as const;
  return (
    <section className="marketing-section honest-goal">
      <div>
        <p className="marketing-kicker">CEL SPRAWDZANY NA LICZBACH</p>
        <h2>Bez magicznych metod. Z celem regularnie sprawdzanym na liczbach.</h2>
        <p>SmartFach nie obiecuje wyniku. Pomaga przeliczyć cel na ofertę, potrzebną liczbę klientów i działania, a potem aktualizować je na podstawie efektów.</p>
      </div>
      <div className="goal-steps" aria-label="Jak cel finansowy zmienia się w regularne działania">
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

export function PathLanding({ mode }: { mode: keyof typeof landingData }) {
  const page = landingData[mode];
  const Icon = page.icon;
  return (
    <div className={`marketing-site path-landing mode-${mode}`}>
      <MarketingHeader />
      <main>
        <section className="path-hero">
          <div className="hero-orb hero-orb-one" aria-hidden="true" />
          <div>
            <p className="marketing-kicker"><Icon size={14} /> {page.kicker}</p>
            <h1>{page.title}</h1>
            <p>{page.lead}</p>
            <div className="hero-actions path-hero-actions">
              <Link className="hero-primary" href={page.href}>Rozpocznij 3 dni próbne <ArrowRight size={18} /></Link>
              <Link className="hero-secondary" href="#jak-pomaga">Zobacz, jak pomaga</Link>
            </div>
            <small><ShieldCheck size={13} /> Karta wymagana · 0 zł przez 3 dni · możesz anulować przed pierwszą opłatą.</small>
            <small className="path-trust-note"><ShieldCheck size={13} /> {page.trust}</small>
          </div>
          <aside>
            <div className="path-aside-head">
              <span className="large-path-icon"><Icon size={31} /></span>
              <small>SMARTFACH · {page.kicker.replace("SMARTFACH ", "")}</small>
            </div>
            <p>{page.resultLabel}</p>
            <ul>{page.items.map((item, index) => <li key={item}><span>{index + 1}</span><strong>{item}</strong><Check size={17} /></li>)}</ul>
            <div className="path-command"><Sparkles size={15} /><span>Co robimy jako następne?</span><ArrowRight size={16} /></div>
          </aside>
        </section>
        <PathBenefits mode={mode} />
        {mode === "discover" && <HonestGoalPlan />}
        <ContinuityLoop />
        <Pricing context={mode} />
      </main>
      <MarketingFooter />
    </div>
  );
}

export function PricingLanding() {
  return (
    <div className="marketing-site path-landing">
      <MarketingHeader />
      <main>
        <section className="pricing-hero">
          <p className="marketing-kicker"><Sparkles size={14} /> PLAN OKREŚLA LIMIT · TYP KONTA OKREŚLA SPOSÓB PRACY</p>
          <h1>Wybierz intensywność pracy i liczbę osób.</h1>
          <p>Lite i Pro są dla jednej osoby, a Firma dla zespołu. Podczas startu wybierasz jeden typ konta: Odkryj, Uruchom albo Prowadź.</p>
        </section>
        <PricingOverview />
      </main>
      <MarketingFooter />
    </div>
  );
}

export function MarketingFooter() {
  return (
    <footer className="marketing-footer">
      <Link className="marketing-brand" href="/"><BrandMark size={31} /><span>Smart<b>Fach</b></span></Link>
      <p>Asystent AI od pomysłu do codziennej pracy firmy.</p>
      <div>
        <Link href="/odkryj">Znajdź pomysł</Link>
        <Link href="/uruchom">Uruchom firmę</Link>
        <Link href="/dla-firm">Prowadź firmę</Link>
        <Link href="/cennik">Cennik</Link>
        <Link href="/kontakt">Kontakt</Link>
        <Link href="/regulamin">Regulamin</Link>
        <Link href="/polityka-prywatnosci">Prywatność</Link>
      </div>
    </footer>
  );
}
