import Link from "next/link";
import {
  ArrowRight,
  Ban,
  Check,
  ChevronDown,
  Compass,
  Image as ImageIcon,
  Laptop,
  ListChecks,
  LogIn,
  MapPin,
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
    icon: Laptop,
    label: "WOLĘ PRACOWAĆ ZDALNIE",
    title: "Znajdziemy usługę, którą możesz realizować z domu",
    copy: "Bez wciskania Ci pracy w terenie, jeśli nie tego szukasz.",
  },
  {
    icon: MapPin,
    label: "WOLĘ DZIAŁAĆ LOKALNIE",
    title: "Wykorzystamy popyt i klientów w Twojej okolicy",
    copy: "Kierunek może opierać się na praktycznej usłudze, nie tylko pracy przy komputerze.",
  },
  {
    icon: Compass,
    label: "NIE WIEM, CO UMIEM SPRZEDAĆ",
    title: "Zaczniemy od tego, co już potrafisz lub szybko opanujesz",
    copy: "Nie musisz przychodzić z gotowym pomysłem ani imponującym CV.",
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
    "Co, jeśli nie mam żadnych wyjątkowych umiejętności?",
    "Nie potrzebujesz eksperckiego poziomu na starcie. SmartFach może wskazać usługi wykorzystujące to, co już umiesz, albo kierunki z małym progiem wejścia. Zawsze powinien również pokazać, czego trzeba się nauczyć przed przyjęciem zlecenia.",
  ],
  [
    "Czy muszę pracować zdalnie?",
    "Nie. Możesz wybrać pracę zdalną, lokalną albo połączenie obu. To Twoje preferencje są filtrem dla propozycji, a nie gotowa lista modnych biznesów z internetu.",
  ],
  [
    "Czy SmartFach zdobędzie klienta za mnie?",
    "Nie może zagwarantować klienta ani wykonać za Ciebie wszystkich działań. Pomoże przygotować ofertę, wyszukać informacje, opracować sposób dotarcia, napisać wiadomości i wybrać następny krok. Ty decydujesz i działasz.",
  ],
  [
    "Czy SmartFach gwarantuje 10 000 zł miesięcznie?",
    "Nie. 10 000 zł może być Twoim celem, który rozłożymy na cenę, liczbę klientów i działania sprzedażowe. Wynik zależy od rynku, oferty, jakości realizacji i konsekwencji użytkownika.",
  ],
  [
    "Czy to jest kurs albo zbiór nagrań?",
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
        <Link href="/#dla-ciebie">Dla Ciebie</Link>
        <Link href="/cennik">Cennik</Link>
        <Link href="/kontakt">Kontakt</Link>
      </nav>
      <div className="marketing-header-actions">
        <Link className="marketing-login" href="/logowanie?plan=pro">
          <span>Wypróbuj 3 dni bez opłat</span>
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
            <Link href="/#co-dostajesz">Co dostajesz</Link>
            <Link href="/cennik">Cennik</Link>
            <Link href="/kontakt">Kontakt</Link>
            <Link className="mobile-menu-login" href="/logowanie"><LogIn size={16} /> Mam już konto — zaloguj się</Link>
            <Link className="mobile-menu-start" href="/logowanie?plan=pro">Zacznij 3 dni bez opłat <ArrowRight size={15} /></Link>
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
        <SearchCheck size={14} /> Dopasowane do Ciebie
      </div>
      <div className="preview-float preview-float-bottom" aria-hidden="true">
        <ListChecks size={14} /> Następny krok gotowy
      </div>
      <div className="product-preview" aria-label="Podgląd działania SmartFach">
        <div className="preview-top">
          <span><BrandMark size={25} /> SmartFach</span>
          <small><i /> Asystent gotowy</small>
        </div>
        <div className="preview-question">
          <span>Ty</span>
          Chcę dorabiać zdalnie około 6 godzin tygodniowo. Nie wiem, co mogę sprzedawać i nie chcę nagrywać filmów.
        </div>
        <div className="preview-card start-result-card">
          <div><Target size={20} /><span><small>TWÓJ PIERWSZY KIERUNEK</small><strong>Usługa dopasowana do Twoich warunków</strong></span></div>
          <dl>
            <div><dt>Sposób pracy</dt><dd>Zdalnie</dd></div>
            <div><dt>Czas</dt><dd>6 h / tydzień</dd></div>
            <div><dt>Bez</dt><dd>Nagrywania</dd></div>
          </dl>
          <button>Zobacz ofertę i pierwszy test <ArrowRight size={15} /></button>
        </div>
        <p><ShieldCheck size={14} /> Propozycje uwzględniają Twoje granice i możliwości.</p>
      </div>
    </div>
  );
}

function FitSection() {
  return (
    <section className="marketing-section fit-section" id="dla-ciebie">
      <div className="section-intro">
        <p className="marketing-kicker">ZACZYNAMY OD CIEBIE, NIE OD MODNEGO POMYSŁU</p>
        <h2>Powiedz, jak chcesz pracować. Resztę poukładamy razem.</h2>
        <p>Nie wciskamy każdemu tego samego biznesu. Twoje możliwości, ograniczenia i rzeczy, których nie chcesz robić, pomagają wybrać właściwy kierunek.</p>
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

function ActionSystem() {
  const steps = [
    ["POZNAJEMY CIEBIE", "Czas, budżet, doświadczenie i granice"],
    ["WYBIERAMY USŁUGĘ", "Realny problem, klient i sposób realizacji"],
    ["BUDUJEMY OFERTĘ", "Zakres, cena i prosta wiadomość sprzedażowa"],
    ["RUSZASZ DO KLIENTÓW", "Konkretne działania i poprawki po wynikach"],
  ] as const;
  return (
    <section className="marketing-section action-system" id="jak-dziala">
      <div className="section-intro">
        <p className="marketing-kicker">NIE KOLEJNY KURS · SYSTEM DO DZIAŁANIA</p>
        <h2>Od „nie wiem, co robić” do oferty, którą możesz pokazać klientowi.</h2>
        <p>SmartFach zadaje potrzebne pytania, ogranicza liczbę opcji i prowadzi do najmniejszego sensownego testu — bez tygodni planowania.</p>
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
        <p className="marketing-kicker">SMARTFACH POMAGA WYKONAĆ PRACĘ</p>
        <h2>Nie zostajesz z dokumentem „biznesplan.pdf”.</h2>
        <p>Każdy etap kończy się czymś, co możesz wykorzystać: decyzją, ofertą, wiadomością, listą klientów albo zadaniem do wykonania.</p>
        <Link href="/logowanie?plan=pro">Zbuduj pierwszą ofertę <ArrowRight size={16} /></Link>
      </div>
      <div className="outcome-grid builder-outcome-grid">
        {outcomes.map(([Icon, title, copy]) => (
          <article key={title}><Icon size={23} /><strong>{title}</strong><span>{copy}</span></article>
        ))}
      </div>
    </section>
  );
}

function GoalSection() {
  const steps = [
    ["CEL", "10 000 zł przychodu"],
    ["OFERTA", "Cena za usługę"],
    ["SPRZEDAŻ", "Potrzebna liczba klientów"],
    ["DZISIAJ", "Jedno konkretne działanie"],
  ] as const;
  return (
    <section className="marketing-section honest-goal builder-goal">
      <div>
        <p className="marketing-kicker">MARZENIE ZAMIENIONE W LICZBY</p>
        <h2>Cel może wynosić 10 000 zł. Zaczynamy od pierwszej sprzedaży.</h2>
        <p>Nie obiecujemy magicznego wyniku. Pomagamy przełożyć go na ofertę, cenę, potrzebną liczbę klientów i działania, które możesz rzeczywiście wykonać.</p>
      </div>
      <div className="goal-steps">
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

function ContinuityLoop() {
  return (
    <section className="marketing-section continuity-section builder-loop">
      <div className="section-intro">
        <p className="marketing-kicker">DLATEGO TO ABONAMENT, A NIE JEDNORAZOWY PLAN</p>
        <h2>Wracasz z wynikiem. SmartFach pomaga zdecydować, co dalej.</h2>
        <p>Oferta rzadko jest idealna za pierwszym razem. SmartFach pamięta ustalenia, analizuje odpowiedzi klientów i pomaga poprawiać kierunek, cenę oraz kolejne działania.</p>
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
              {planId === "pro" && <span className="plan-ribbon">NAJCZĘŚCIEJ WYBIERANY</span>}
              <small>{details.audience}</small>
              <h3>SmartFach {plan.name}</h3>
              <p>{details.description}</p>
              <strong>{plan.price}<span> / miesiąc</span></strong>
              <ul>{details.features.map((feature) => <li key={feature}><Check size={15} /> {feature}</li>)}</ul>
              <Link href={`/logowanie?plan=${planId}`}>Rozpocznij 3 dni próbne <ArrowRight size={15} /></Link>
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
    <div className="marketing-site builder-marketing">
      <MarketingHeader />
      <main>
        <section className="marketing-hero builder-hero">
          <div className="hero-orb hero-orb-one" aria-hidden="true" />
          <div className="hero-orb hero-orb-two" aria-hidden="true" />
          <div className="hero-copy">
            <p className="marketing-kicker hero-kicker"><Sparkles size={14} /> NIE KOLEJNY KURS. ASYSTENT DO DZIAŁANIA.</p>
            <h1>Nie potrzebujesz idealnego pomysłu. <em>Potrzebujesz pierwszego klienta.</em></h1>
            <p className="hero-lead">Powiedz, czy wolisz działać zdalnie czy lokalnie, co już umiesz, czego nie chcesz robić i ile masz czasu. SmartFach pomoże wybrać realną usługę, zbudować ofertę i ruszyć po klientów.</p>
            <div className="hero-actions">
              <Link className="hero-primary" href="/logowanie?plan=pro">Zbuduj pierwszą ofertę <ArrowRight size={18} /></Link>
              <Link className="hero-secondary" href="/#jak-dziala">Zobacz, jak to działa</Link>
            </div>
            <div className="hero-trust">
              <span><Check size={15} /> Zdalnie, lokalnie albo po swojemu</span>
              <span><Check size={15} /> Nie musisz mieć gotowego pomysłu</span>
              <span><Check size={15} /> 3 dni bez opłat</span>
            </div>
          </div>
          <ProductPreview />
        </section>
        <section className="input-strip">
          <p>Opisujesz swoją sytuację.</p>
          <div><span><MessageCircle size={18} /> Tekst</span><span><ImageIcon size={18} /> Zdjęcie</span><span><SearchCheck size={18} /> Internet</span></div>
          <strong>SmartFach układa następne działanie.</strong>
        </section>
        <FitSection />
        <ActionSystem />
        <Outcomes />
        <GoalSection />
        <ContinuityLoop />
        <PricingSection />
        <FAQSection />
        <section className="marketing-cta builder-cta">
          <BrandMark size={50} />
          <p className="marketing-kicker">TWÓJ PIERWSZY KROK</p>
          <h2>Nie musisz dziś wiedzieć, jaki biznes zbudujesz.</h2>
          <p>Wystarczy, że powiesz, jak chcesz pracować i czego chcesz uniknąć. SmartFach pomoże Ci wybrać pierwszy kierunek i zamienić go w działanie.</p>
          <Link href="/logowanie?plan=pro">Zacznij 3 dni bez opłat <ArrowRight size={18} /></Link>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

export function PricingLanding() {
  return (
    <div className="marketing-site path-landing builder-marketing">
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
      </div>
    </footer>
  );
}
