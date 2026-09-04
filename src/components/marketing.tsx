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
    label: "Buduję od zera",
    title: "Chcę stworzyć biznes i pracować nad celem 10 000 zł przychodu miesięcznie",
    copy: "SmartFach pomaga wybrać kierunek dopasowany do Twoich możliwości, zbudować ofertę, ustalić cenę i rozpocząć pozyskiwanie klientów.",
    results: [
      "Kierunek i model działania",
      "Oferta, cena i plan sprzedaży",
      "Kolejne zadania prowadzące do klientów",
    ],
    href: "/odkryj",
    cta: "Zacznij budować biznes",
  },
  {
    id: "uruchom",
    icon: BriefcaseBusiness,
    label: "Mam pomysł lub firmę",
    title: "Chcę zdobywać klientów i sprawniej prowadzić biznes",
    copy: "SmartFach pomaga w marketingu, ofertach i obsłudze zleceń. Przygotowuje dokumenty, a historię pracy zachowuje przy właściwym kliencie.",
    results: [
      "Marketing i rozwój oferty",
      "Wyceny, protokoły i wiadomości",
      "Klienci, historia i praca zespołu",
    ],
    href: "/uruchom",
    cta: "Rozwijaj biznes ze SmartFach",
  },
] as const;

type PricingContext = "discover" | "launch" | "operate";
type PublicPlanId = keyof typeof plans;

const publicPlanDetails = {
  lite: {
    audience: "DLA JEDNEJ OSOBY · LŻEJSZE UŻYCIE",
    description: "Dla jednej osoby, która chce zacząć korzystać ze SmartFach i pracuje z nim od czasu do czasu.",
    features: [
      "Jedno konto użytkownika",
      "Tekst, zdjęcia i nagrania",
      "Budowanie kierunku, oferty i sprzedaży",
      "Zapisane ustalenia i historia pracy",
      "Standardowy miesięczny limit",
    ],
  },
  pro: {
    audience: "DLA JEDNEJ OSOBY · REGULARNA PRACA",
    description: "Dla jednej osoby, która regularnie rozwija lub prowadzi firmę i potrzebuje większego zakresu pracy z asystentem.",
    features: [
      "Wszystko z planu Lite",
      "Wyższy miesięczny limit",
      "Więcej pracy nad ofertami i marketingiem",
      "Więcej wycen, protokołów i wiadomości",
      "Ciągłość ustaleń między kolejnymi zadaniami",
    ],
  },
  firma: {
    audience: "DLA WŁAŚCICIELA I ZESPOŁU",
    description: "Dla firmy, która chce pracować na wspólnych klientach, historii i zasadach zamiast rozdzielać wiedzę między pracowników.",
    features: [
      "Właściciel i do 3 pracowników",
      "Wspólni klienci, cennik i historia",
      "Wspólny limit zespołu",
      "Jeden standard pracy dla całej firmy",
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
    title: "Wybierz, jak często chcesz pracować ze SmartFach.",
    lead: "Lite wystarczy do lżejszego użycia, a Pro daje więcej miejsca na regularne planowanie, research i realizację kolejnych działań.",
    planIds: ["lite", "pro"],
    featuredPlan: "pro",
    note: "Gdy zaczniesz działać lub zdobędziesz klientów, korzystasz dalej w tym samym abonamencie — bez utraty ustaleń.",
  },
  launch: {
    kicker: "DLA SAMODZIELNEJ OSOBY LUB ZESPOŁU",
    title: "Pracujesz sam? Wybierz Pro. Potrzebujesz wspólnej przestrzeni? Wybierz Firma.",
    lead: "Pro jest dla jednej osoby rozwijającej biznes, a Firma dodaje wspólnych klientów, historię i pracę zespołu.",
    planIds: ["pro", "firma"],
    featuredPlan: "pro",
    note: "Jeden abonament pomaga od pierwszej oferty po codzienną pracę firmy. Nie kupujesz kolejnego produktu wraz z rozwojem.",
  },
  operate: {
    kicker: "DLA SAMODZIELNEJ OSOBY LUB ZESPOŁU",
    title: "Pracujesz sam? Wybierz Pro. Masz zespół? Wybierz Firma.",
    lead: "Pro daje pełny zakres dla jednej osoby, a Firma dodaje wspólną przestrzeń, klientów i historię zespołu.",
    planIds: ["pro", "firma"],
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
        <Link href="/#jak-dziala">Jak to działa</Link>
        <Link href="/odkryj">Buduję od zera</Link>
        <Link href="/uruchom">Mam pomysł lub firmę</Link>
        <Link href="/dla-firm">Dla zespołów</Link>
        <Link href="/cennik">Cennik</Link>
        <Link href="/kontakt">Kontakt</Link>
      </nav>
      <Link className="marketing-login" href="/logowanie?typ=discover&plan=pro">
        <span className="login-label-full">Zacznij 3 dni bez opłat</span>
        <span className="login-label-short">Zacznij</span>
        <ArrowRight size={16} />
      </Link>
      <details className="marketing-mobile-menu">
        <summary aria-label="Otwórz menu"><Menu size={21} /></summary>
        <nav aria-label="Nawigacja telefonu">
          <Link href="/#jak-dziala">Jak to działa</Link>
          <Link href="/odkryj">Buduję od zera</Link>
          <Link href="/uruchom">Mam pomysł lub firmę</Link>
          <Link href="/dla-firm">Dla zespołów</Link>
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
        <p className="marketing-kicker">JEDEN ASYSTENT · OD STARTU DO ROZWOJU</p>
        <h2>Zbuduj biznes od zera albo rozwijaj ten, który już masz.</h2>
        <p>SmartFach nie kończy pracy na znalezieniu pomysłu. Pomaga zbudować ofertę, dotrzeć do klientów, wykonać kolejne zadania i prowadzić codzienną pracę firmy.</p>
      </div>
      <div className="path-grid">
        {paths.map(({ id, icon: Icon, label, title, copy, results, href, cta }, index) => (
          <article key={id} className={`path-card path-card-${id}`}>
            <div className="path-card-top">
              <span className="path-icon"><Icon size={24} /></span>
              <i>0{index + 1}</i>
            </div>
            <small>{label.toUpperCase()}</small>
            <h3>{title}</h3>
            <p>{copy}</p>
            <ul className="path-outcomes">
              {results.map((result) => <li key={result}><Check size={16} /><span>{result}</span></li>)}
            </ul>
            <Link href={href}>{cta} <ArrowRight size={16} /></Link>
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
  const href = `/logowanie?typ=${context === "launch" ? "operate" : context}`;
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
      {context === "discover" && (
        <p className="pricing-team-link">
          Masz już pomysł, klientów lub zespół? <Link href="/uruchom">Zobacz ofertę dla biznesu <ArrowRight size={14} /></Link>
        </p>
      )}
      <p className="pricing-context-note"><ShieldCheck size={15} /> {content.note}</p>
      <p className="trial-disclosure"><ShieldCheck size={15} /> <span><strong>3 dni bez opłat · karta wymagana.</strong> Jeśli nie anulujesz przed końcem próby, pobierzemy cenę wybranego planu za pierwszy miesiąc. Abonament odnawia się co miesiąc do rezygnacji.</span></p>
      <p className="pricing-disclaimer">Przed podpięciem karty zobaczysz 0 zł dzisiaj, wybrany plan i dokładny termin pierwszej opłaty.</p>
    </section>
  );
}

function PricingOverview() {
  return (
    <section className="marketing-section pricing-section pricing-overview" id="cennik">
      <div className="section-intro">
        <p className="marketing-kicker">JEDEN ABONAMENT · CAŁA DROGA</p>
        <h2>Wybierz plan do swojego tempa pracy.</h2>
        <p>Lite jest dla osób budujących biznes od zera, Pro pasuje do obu punktów startu, a Firma obsługuje właściciela i zespół.</p>
      </div>
      <div className="pricing-grid">
        {(Object.keys(plans) as PublicPlanId[]).map((planId) => (
          <PricingCard
            key={planId}
            planId={planId}
            href={planId === "firma" ? "/logowanie?typ=operate" : "/logowanie?typ=discover"}
            featured={planId === "pro"}
          />
        ))}
      </div>
      <p className="pricing-context-note"><ShieldCheck size={15} /> Rozwijasz pomysł i firmę w tym samym abonamencie. Twoje ustalenia oraz historia zostają na koncie.</p>
      <p className="trial-disclosure"><ShieldCheck size={15} /> <span><strong>3 dni bez opłat · karta wymagana.</strong> Jeśli nie anulujesz przed końcem próby, pobierzemy cenę wybranego planu za pierwszy miesiąc. Abonament odnawia się co miesiąc do rezygnacji.</span></p>
      <p className="pricing-disclaimer">Przed podpięciem karty zobaczysz dokładny termin pierwszej opłaty i zasady rezygnacji.</p>
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
            <p className="marketing-kicker hero-kicker"><Sparkles size={14} /> ASYSTENT AI, KTÓRY POMAGA DZIAŁAĆ</p>
            <h1>Ustal cel 10 000 zł przychodu miesięcznie. <em>Zamieniaj go w konkretne działania.</em></h1>
            <p className="hero-lead">SmartFach pomaga wybrać kierunek, zdobywać klientów i prowadzić codzienną pracę firmy. Pamięta ustalenia i podpowiada następny krok — nie kończy na jednorazowym planie.</p>
            <div className="hero-actions">
              <Link className="hero-primary" href="/logowanie?typ=discover&plan=pro">Zacznij budować biznes <ArrowRight size={18} /></Link>
              <Link className="hero-secondary" href="/logowanie?typ=operate&plan=pro">Mam pomysł lub firmę</Link>
            </div>
            <div className="hero-trust">
              <span><Check size={15} /> 3 dni bez opłat</span>
              <span><Check size={15} /> Jedna historia i pamięć ustaleń</span>
              <span><Check size={15} /> 10 000 zł to cel, nie gwarancja wyniku</span>
            </div>
          </div>
          <ProductPreview />
        </section>
        <section className="input-strip">
          <p>Mówisz. Piszesz. Robisz zdjęcie.</p>
          <div><span><MessageCircle size={18} /> Tekst</span><span><Mic size={18} /> Głos</span><span><ImageIcon size={18} /> Zdjęcie</span></div>
          <strong>SmartFach przygotowuje rezultat.</strong>
        </section>
        <section className="workflow-ribbon" id="jak-dziala" aria-label="Jak działa SmartFach">
          <div><span>01</span><p><strong>Powiedz, czego potrzebujesz</strong><small>Tekstem, głosem albo zdjęciem</small></p></div>
          <i><ArrowRight size={18} /></i>
          <div><span>02</span><p><strong>SmartFach wykonuje pracę</strong><small>Wykorzystuje właściwy kontekst</small></p></div>
          <i><ArrowRight size={18} /></i>
          <div><span>03</span><p><strong>Sprawdzasz gotowy rezultat</strong><small>I przechodzisz do kolejnego zadania</small></p></div>
        </section>
        <Paths />
        <HonestGoalPlan />
        <ContinuityLoop />
        <section className="marketing-section operations-showcase">
          <div>
            <p className="marketing-kicker">NIE KOLEJNY OGÓLNY CZAT</p>
            <h2>Nie kończy na poradzie. Pomaga wykonać pracę.</h2>
            <p>SmartFach korzysta z kontekstu Twojej firmy, przygotowuje gotowy rezultat i pozwala Ci go sprawdzić przed zapisem.</p>
            <Link href="/uruchom">Zobacz, jak pomaga w biznesie <ArrowRight size={16} /></Link>
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
          <h2>Nie potrzebujesz kolejnego kursu. Potrzebujesz asystenta do działania.</h2>
          <p>Zacznij od celu, pomysłu albo zadania w firmie. SmartFach będzie pracował z Tobą dalej, gdy pojawią się prawdziwe wyniki.</p>
          <Link href="/logowanie?typ=discover&plan=pro">Zacznij 3 dni bez opłat <ArrowRight size={18} /></Link>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

const landingData = {
  discover: {
    kicker: "ZACZYNASZ OD ZERA?",
    title: "Ustal cel 10 000 zł przychodu miesięcznie i zacznij działać krok po kroku.",
    lead: "SmartFach pomoże Ci znaleźć kierunek online lub usługowy dopasowany do Twoich możliwości, policzyć drogę do celu i regularnie wybierać następne działanie.",
    cta: "Zacznij pracować nad celem",
    href: "/logowanie?typ=discover",
    icon: Compass,
    trust: "10 000 zł to cel do regularnego sprawdzania, nie gwarancja wyniku.",
    resultLabel: "SmartFach pomaga Ci ustalić:",
    items: ["Co możesz realnie sprzedawać", "Komu i za ile", "Jak dojść do celu na liczbach", "Co zrobić jako następne"],
    benefitTitle: "To nie jest generator jednego planu. To asystent do regularnego działania.",
    benefitLead: "SmartFach zapamiętuje zatwierdzone ustalenia, dzięki czemu po każdym teście możesz podjąć kolejną decyzję bez zaczynania od zera.",
    benefits: [
      ["Aktualizuj zamiast zaczynać od nowa", "Wracaj do pomysłu po każdym teście i poprawiaj cenę, koszty, grupę klientów albo sposób dotarcia."],
      ["Decyzje oparte na wynikach", "Zapisuj, co zadziałało, co nie i czego dowiedziałeś się od klientów. Kolejny krok wykorzysta te informacje."],
      ["Rozwijaj bez zaczynania od nowa", "Gdy pomysł zacznie działać, w tym samym abonamencie przechodzisz do ofert, klientów i codziennej pracy firmy."],
    ],
  },
  launch: {
    kicker: "MASZ POMYSŁ LUB JUŻ DZIAŁASZ?",
    title: "Zdobywaj klientów i prowadź firmę z jednym asystentem AI.",
    lead: "Od pierwszej oferty po wyceny, protokoły, wiadomości i historię klientów. SmartFach pomaga wykonać pracę i pamięta, co było wcześniej.",
    cta: "Zacznij rozwijać biznes",
    href: "/logowanie?typ=operate",
    icon: BriefcaseBusiness,
    trust: "Jeden abonament dla pomysłu, jednoosobowej działalności i zespołu.",
    resultLabel: "SmartFach pomaga przygotować:",
    items: ["Ofertę i działania sprzedażowe", "Wycenę do sprawdzenia i PDF", "Protokół lub wiadomość do klienta", "Następny krok w rozwoju firmy"],
    benefitTitle: "Od pozyskania klienta po obsługę zlecenia — bez skakania między narzędziami.",
    benefitLead: "SmartFach łączy doradztwo biznesowe z wykonywaniem codziennych zadań firmy. Wracasz z wynikiem i od razu pracujesz nad kolejnym krokiem.",
    benefits: [
      ["Od pomysłu do pierwszej oferty", "Doprecyzuj klienta, problem, cenę i najprostszy sposób rozpoczęcia sprzedaży."],
      ["Codzienna praca bez pustej kartki", "Przygotuj wycenę, protokół albo wiadomość krótkim poleceniem i sprawdź gotowy rezultat."],
      ["Rozwój oparty na wynikach", "Aktualizuj ofertę, marketing i następne działania na podstawie tego, co wydarzyło się naprawdę."],
    ],
  },
  operate: {
    kicker: "SMARTFACH DLA ZESPOŁU",
    title: "Jedna pamięć klientów i jeden sposób pracy całej firmy.",
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

function ContinuityLoop({ entry = "discover" }: { entry?: "discover" | "operate" }) {
  const steps = [
    ["PLANUJESZ", "Ustalasz najbliższy krok"],
    ["DZIAŁASZ", "Wykonujesz go w praktyce"],
    ["WRACASZ Z WYNIKIEM", "Zapisujesz liczby i wnioski"],
    ["AKTUALIZUJESZ", "Dostosowujesz dalsze działania"],
  ] as const;
  return (
    <section className="marketing-section continuity-section">
      <div className="section-intro">
        <p className="marketing-kicker">WARTOŚĆ CO TYDZIEŃ, NIE TYLKO NA STARCIE</p>
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
        <p><strong>Jeden abonament rośnie razem z Tobą.</strong><span>Zaczynasz od celu lub pomysłu, a później korzystasz z ofert, klientów, wycen i historii firmy — bez utraty wcześniejszych ustaleń.</span></p>
        <Link href={`/logowanie?typ=${entry}&plan=pro`}>Zacznij 3 dni bez opłat <ArrowRight size={16} /></Link>
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
        <p className="marketing-kicker">TWÓJ CEL · KONKRETNE LICZBY</p>
        <h2>10 000 zł miesięcznie to cel. SmartFach pomaga rozłożyć go na realne działania.</h2>
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
              <Link className="hero-primary" href={page.href}>{page.cta} <ArrowRight size={18} /></Link>
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
        <ContinuityLoop entry={mode === "discover" ? "discover" : "operate"} />
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
          <p className="marketing-kicker"><Sparkles size={14} /> PROSTE PLANY · BEZ DODATKOWEJ OPŁATY ZA ROZWÓJ</p>
          <h1>Jeden abonament od pomysłu po codzienną pracę firmy.</h1>
          <p>Lite i Pro są dla jednej osoby, a Firma dla zespołu. Każdy plan obejmuje pomoc SmartFach na całej drodze.</p>
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
        <Link href="/odkryj">Buduję od zera</Link>
        <Link href="/uruchom">Mam pomysł lub firmę</Link>
        <Link href="/dla-firm">Dla zespołów</Link>
        <Link href="/cennik">Cennik</Link>
        <Link href="/kontakt">Kontakt</Link>
        <Link href="/regulamin">Regulamin</Link>
        <Link href="/polityka-prywatnosci">Prywatność</Link>
      </div>
    </footer>
  );
}
