import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Clock3,
  Compass,
  ListChecks,
  LogIn,
  MessageCircle,
  ShieldCheck,
  Target,
  UserRound,
} from "lucide-react";
import {
  plans,
  publicPlanIds,
  publicPlanLimitLabel,
  type PublicPlanId,
} from "@/domain/billing";
import { BrandMark } from "./brand";
import { TrackedPlanLink } from "./tracked-plan-link";

type FaqItem = readonly [question: string, answer: string];

const audienceOptions = [
  {
    icon: BriefcaseBusiness,
    label: "MASZ PRAKTYCZNE UMIEJĘTNOŚCI",
    title: "Nie wiesz, jak zrobić z nich ofertę",
    copy: "Zaczynasz od zadań i problemów, które już znasz — z pracy, branży albo codziennej praktyki.",
  },
  {
    icon: Clock3,
    label: "CHCESZ ZACZĄĆ PO GODZINACH",
    title: "Potrzebujesz planu na realny kalendarz",
    copy: "Zakres pierwszego testu dopasowujesz do czasu, budżetu i ryzyka, które możesz przyjąć.",
  },
  {
    icon: Compass,
    label: "MASZ KILKA POMYSŁÓW",
    title: "Chcesz wybrać jeden kierunek",
    copy: "Porównujesz kilka możliwości i wybierasz tę, którą najłatwiej sprawdzić bez dużej inwestycji.",
  },
  {
    icon: Target,
    label: "MASZ SWOJE OGRANICZENIA",
    title: "Nie każdy sposób działania Ci odpowiada",
    copy: "Uwzględniasz, czy chcesz pracować zdalnie lub lokalnie, z ludźmi lub bez pokazywania twarzy.",
  },
] as const;

const planDetails: Record<
  PublicPlanId,
  { audience: string; description: string }
> = {
  lite: {
    audience: "SPOKOJNY START",
    description:
      "Dla osoby, która chce wykonać najważniejsze działania i korzystać z asystenta w spokojnym tempie.",
  },
  pro: {
    audience: "REGULARNA PRACA",
    description:
      "Dla osoby, która chce częściej wracać z odpowiedziami klientów i regularnie dopracowywać działania.",
  },
};

const sharedPlanFeatures = [
  "Ten sam asystent i pełny sposób pracy",
  "Pomoc w wyborze usługi, ofercie i wiadomościach",
  "Osobny kontekst dla każdego biznesu",
  "Tekst, zdjęcia i research w internecie",
] as const;

const faqItems: readonly FaqItem[] = [
  [
    "Czym SmartFach różni się od ogólnego czatu AI?",
    "SmartFach prowadzi rozmowę wokół budowania własnej usługi: zaczyna od krótkiej ankiety, pozwala trzymać każdy biznes w osobnym czacie i pomaga przejść od sytuacji użytkownika do oferty, wiadomości oraz kolejnego działania. Nie twierdzimy, że model jest „lepszy” od innych czatów AI.",
  ],
  [
    "Czy muszę mieć gotowy pomysł?",
    "Nie. Możesz zacząć od swoich umiejętności, doświadczenia, czasu i ograniczeń. Jeżeli masz kilka pomysłów, asystent pomoże je porównać i wybrać jeden do małego testu.",
  ],
  [
    "Czy mogę korzystać, pracując na etacie?",
    "Tak. Możesz planować małe działania po godzinach i dopasować je do czasu, który naprawdę masz. SmartFach nie wymaga rzucania pracy ani podejmowania dużego ryzyka na starcie.",
  ],
  [
    "Co robię po przygotowaniu pierwszej oferty?",
    "To Ty pokazujesz ofertę potencjalnym klientom i prowadzisz rozmowy. Potem możesz wrócić do tego samego czatu z odpowiedzią lub obiekcją — bez danych osobowych klienta — i dopracować zakres, komunikat oraz następny krok.",
  ],
  [
    "Czym różnią się Lite i Pro oraz jak działają limity?",
    "Oba plany mają te same funkcje i jakość asystenta. Lite ma podstawową miesięczną pulę, a Pro około 2,4× większą. Zużycie zależy od długości rozmów, zdjęć i używanych narzędzi. Podstawowa pula odnawia się co miesiąc i nie kumuluje. Po wyczerpaniu możesz poczekać na odnowienie, ręcznie dokupić limit albo zmienić plan — nic nie dokupuje się automatycznie.",
  ],
  [
    "Jak działa próba, pierwsza opłata i anulowanie?",
    "Próba trwa 3 pełne dni i wymaga karty. Dzisiaj płacisz 0 zł. Jeśli nie anulujesz przed jej końcem, rozpocznie się płatny miesiąc wybranego planu: Lite 49 zł albo Pro 99 zł. Po zapisaniu karty potwierdzasz adres e-mail, aby korzystać z asystenta. Gdy adres nie zostanie potwierdzony przed końcem próby, subskrypcja kończy się bez płatnego odnowienia.",
  ],
  [
    "Czy SmartFach gwarantuje klientów lub zarobki?",
    "Nie. SmartFach pomaga przygotować ofertę, wiadomość i kolejny test, ale nie wysyła ich za Ciebie i nie może zagwarantować klienta, sprzedaży, kwoty ani terminu. Wynik zależy również od rynku, jakości realizacji i Twoich działań.",
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
        <Link href="/#przykladowa-oferta">Przykładowa oferta</Link>
        <Link href="/#jak-dziala">Jak to działa</Link>
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
          <summary aria-label="Otwórz menu"><MenuIcon /></summary>
          <nav aria-label="Nawigacja telefonu">
            <span className="mobile-menu-title">MENU</span>
            <Link href="/#przykladowa-oferta">Przykładowa oferta</Link>
            <Link href="/#jak-dziala">Jak to działa</Link>
            <Link href="/#dla-ciebie">Dla Ciebie</Link>
            <Link href="/cennik">Cennik</Link>
            <Link href="/kontakt">Kontakt</Link>
            <Link className="mobile-menu-login" href="/logowanie"><LogIn size={16} /> Mam już konto — zaloguj się</Link>
            <Link className="mobile-menu-start" href="/logowanie?plan=pro">Wypróbuj przez 3 dni <ArrowRight size={15} /></Link>
          </nav>
        </details>
      </div>
    </header>
  );
}

function MenuIcon() {
  return <span aria-hidden="true" className="marketing-menu-icon"><i /><i /><i /></span>;
}

function ProductPreview() {
  return (
    <div className="preview-stage start-preview-stage">
      <div className="preview-float preview-float-top" aria-hidden="true">
        <Target size={14} /> Kierunek wybrany
      </div>
      <div className="preview-float preview-float-bottom" aria-hidden="true">
        <ListChecks size={14} /> Następny krok gotowy
      </div>
      <div className="product-preview" aria-label="Przykład sposobu pracy ze SmartFach">
        <div className="preview-top">
          <span><BrandMark size={25} /> SmartFach</span>
          <small className="preview-scenario-label">MATERIAŁ PRZYKŁADOWY</small>
        </div>
        <div className="preview-question">
          <span>Ty</span>
          Znam Excel, mam 5 godzin tygodniowo i chcę dorobić po pracy. Co mogę sprzedać?
        </div>
        <div className="preview-card start-result-card">
          <div><Target size={20} /><span><small>PROPOZYCJA DO SPRAWDZENIA</small><strong>Porządkowanie arkuszy i prostych raportów dla mikrofirm</strong></span></div>
          <dl>
            <div><dt>Dla kogo</dt><dd>Małe firmy</dd></div>
            <div><dt>Problem</dt><dd>Ręczne raporty</dd></div>
            <div><dt>Test</dt><dd>3 rozmowy</dd></div>
          </dl>
          <div className="preview-next-step"><Check size={15} /> Dziś: zapytaj trzy znane firmy o najbardziej uciążliwy arkusz.</div>
        </div>
        <p><ShieldCheck size={14} /> Przykładowe dane, nie historia klienta ani obietnica wyniku.</p>
      </div>
    </div>
  );
}

function SectionTrialCta({
  eyebrow,
  title,
  onDark = false,
}: {
  eyebrow: string;
  title: string;
  onDark?: boolean;
}) {
  return (
    <aside className={onDark ? "section-trial-cta on-dark" : "section-trial-cta"} aria-label="Rozpocznij próbę SmartFach">
      <div>
        <small>{eyebrow}</small>
        <strong>{title}</strong>
        <span>3 dni za 0 zł · karta wymagana · potem Pro 99 zł/mies. · anuluj przed pierwszą opłatą</span>
      </div>
      <Link href="/logowanie?plan=pro">Wypróbuj SmartFach <ArrowRight size={17} /></Link>
    </aside>
  );
}

function OfferDemoSection() {
  const steps = [
    ["01", "Sytuacja", "Excel · 5 godzin tygodniowo · praca po godzinach"],
    ["02", "Usługa", "Porządkowanie arkuszy i prostych raportów dla mikrofirm"],
    ["03", "Oferta", "Odbiorca, problem i konkretny zakres pierwszego zlecenia"],
    ["04", "Wiadomość", "Krótki kontakt, który można dopasować i wysłać samodzielnie"],
    ["05", "Następny krok", "Trzy rozmowy i powrót z odpowiedziami"],
  ] as const;

  return (
    <section className="marketing-section offer-demo-section" id="przykladowa-oferta" aria-labelledby="demo-title">
      <span id="przykladowa-droga" className="legacy-anchor" aria-hidden="true" />
      <span id="produkt" className="legacy-anchor" aria-hidden="true" />
      <div className="section-intro">
        <p className="marketing-kicker">ZOBACZ, CO MOŻESZ PRZYGOTOWAĆ</p>
        <h2 id="demo-title">Od umiejętności do oferty i pierwszej wiadomości.</h2>
        <p>To rozwinięcie istniejącego scenariusza demonstracyjnego na przykładowych danych. Nie jest zapisem rozmowy klienta ani obietnicą zarobku.</p>
      </div>
      <div className="demo-workbench">
        <header>
          <span><BrandMark size={26} /> Przykładowy materiał roboczy</span>
          <small>NIE JEST TO HISTORIA KLIENTA</small>
        </header>
        <div className="demo-prompt">
          <small>SYTUACJA UŻYTKOWNIKA</small>
          <p>„Znam Excel, mam 5 godzin tygodniowo i chcę dorobić po pracy. Co mogę sprzedać?”</p>
        </div>
        <ol className="demo-flow" aria-label="Przebieg pracy nad przykładową ofertą">
          {steps.map(([number, title, copy]) => (
            <li key={number}><span>{number}</span><p><strong>{title}</strong><small>{copy}</small></p></li>
          ))}
        </ol>
        <div className="demo-output-grid">
          <article className="demo-offer-card">
            <small>PRZYKŁADOWA OFERTA DO DOPRACOWANIA</small>
            <h3>Porządek w arkuszach i prostsze raporty</h3>
            <dl>
              <div><dt>Dla kogo</dt><dd>Mikrofirmy, które ręcznie poprawiają arkusze i składają powtarzalne zestawienia.</dd></div>
              <div><dt>Problem</dt><dd>Niespójne dane i ręczne raporty zabierają czas oraz utrudniają codzienną pracę.</dd></div>
              <div><dt>Zakres</dt><dd>Uporządkowanie jednego arkusza, prosty szablon raportu i krótka instrukcja użycia.</dd></div>
            </dl>
          </article>
          <article className="demo-message-card">
            <small>PRZYKŁADOWY SZKIC WIADOMOŚCI</small>
            <blockquote>
              Dzień dobry, pomagam małym firmom uporządkować arkusze i uprościć powtarzalne raporty. Szukam teraz kilku osób, które pokażą mi najbardziej uciążliwy plik — w zamian przygotuję krótki pomysł usprawnienia. Czy możemy porozmawiać przez 15 minut?
            </blockquote>
            <p><ListChecks size={17} /><span><strong>Następny krok</strong> Dopasuj wiadomość do trzech znanych firm, wyślij ją samodzielnie i wróć z odpowiedziami.</span></p>
          </article>
        </div>
      </div>
      <SectionTrialCta
        eyebrow="ZOBACZYŁEŚ EFEKT"
        title="Teraz przygotuj własną wersję — zacznij od krótkiego opisu tego, co umiesz."
      />
    </section>
  );
}

function AudienceSection() {
  return (
    <section className="marketing-section audience-section" id="dla-ciebie">
      <div className="section-intro">
        <p className="marketing-kicker">DLA KOGO JEST SMARTFACH</p>
        <h2>Nie potrzebujesz wyjątkowego talentu ani gotowego biznesplanu.</h2>
        <p>Potrzebujesz punktu wyjścia i warunków, do których da się dopasować pierwszą usługę.</p>
      </div>
      <div className="audience-grid">
        {audienceOptions.map(({ icon: Icon, label, title, copy }) => (
          <article key={label}>
            <span><Icon size={22} /></span>
            <small>{label}</small>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
      <SectionTrialCta
        onDark
        eyebrow="NIE CZEKAJ NA IDEALNY POMYSŁ"
        title="Jedna praktyczna umiejętność wystarczy, żeby zacząć szukać usługi do sprawdzenia."
      />
    </section>
  );
}

function WorkProcessSection() {
  const steps = [
    {
      title: "Opisujesz swoją sytuację",
      user: "Podajesz umiejętności, czas, doświadczenie i ograniczenia.",
      assistant: "Asystent porządkuje informacje i dopytuje o brakujący kontekst.",
    },
    {
      title: "Wybierasz kierunek",
      user: "Oceniasz propozycje i decydujesz, którą chcesz sprawdzić.",
      assistant: "Pomaga porównać kilka usług i wskazuje ryzyka pierwszego testu.",
    },
    {
      title: "Dopracowujesz ofertę i materiały",
      user: "Zatwierdzasz zakres, cenę i komunikat zgodny z tym, co potrafisz dowieźć.",
      assistant: "Pomaga ułożyć ofertę, wiadomość i sposób dotarcia.",
    },
    {
      title: "Sprawdzasz zainteresowanie",
      user: "Samodzielnie rozmawiasz z rynkiem i wracasz z informacją zwrotną.",
      assistant: "Pomaga wyciągnąć wnioski i przygotować następne działanie.",
    },
  ] as const;

  return (
    <section className="marketing-section work-process-section" id="jak-dziala">
      <div className="section-intro">
        <p className="marketing-kicker">JAK WYGLĄDA PRACA Z APLIKACJĄ</p>
        <h2>Cztery kroki. Ty podejmujesz decyzje i działasz.</h2>
        <p>SmartFach pomaga analizować, pisać i planować. Nie kontaktuje się z klientami ani nie sprzedaje za Ciebie.</p>
      </div>
      <ol className="work-process-list">
        {steps.map((step, index) => (
          <li key={step.title}>
            <span>0{index + 1}</span>
            <h3>{step.title}</h3>
            <div><small>TY</small><p>{step.user}</p></div>
            <div><small>SMARTFACH</small><p>{step.assistant}</p></div>
          </li>
        ))}
      </ol>
      <SectionTrialCta
        eyebrow="ZACZNIJ OD KROKU 1"
        title="Opisz swoją sytuację. Pierwszy kierunek nie musi być idealny — ma być możliwy do sprawdzenia."
      />
    </section>
  );
}

function OngoingValueSection() {
  return (
    <section className="marketing-section ongoing-value-section" id="co-dostajesz" aria-labelledby="ongoing-title">
      <div className="ongoing-copy">
        <p className="marketing-kicker">DLACZEGO WRACASZ DO SMARTFACH</p>
        <h2 id="ongoing-title">Pierwsza oferta to początek. Potem dopracowujesz ją na podstawie odpowiedzi klientów.</h2>
        <p>Nie musisz za każdym razem zaczynać od pustej kartki. Każdy czat może dotyczyć osobnego biznesu, więc wracasz do właściwego kontekstu i pracujesz nad kolejnym ruchem.</p>
      </div>
      <div className="feedback-cycle" aria-label="Przykład dalszej pracy z ofertą">
        <article><small>01 · OFERTA</small><strong>Przygotowujesz pierwszy zakres usługi.</strong></article>
        <article><small>02 · ODPOWIEDŹ</small><strong>Klient pyta, czy może zacząć od mniejszego zakresu.</strong></article>
        <article><small>03 · POWRÓT</small><strong>Opisujesz obiekcję bez nazwiska, e-maila i innych danych osobowych.</strong></article>
        <article><small>04 · POPRAWKA</small><strong>Dopracowujesz zakres, komunikat i kolejny krok.</strong></article>
      </div>
      <p className="privacy-note"><ShieldCheck size={16} /> Nie wklejaj danych osobowych klienta. Do pracy nad odpowiedzią wystarczy sama treść problemu lub obiekcji.</p>
      <SectionTrialCta
        eyebrow="OFERTA NIE MUSI BYĆ GOTOWA RAZ NA ZAWSZE"
        title="Zacznij od pierwszej wersji, a potem poprawiaj ją na podstawie realnych odpowiedzi."
      />
    </section>
  );
}

function PricingSection() {
  return (
    <section className="marketing-section pricing-section" id="cennik">
      <div className="section-intro">
        <p className="marketing-kicker">TE SAME FUNKCJE · INNA WIELKOŚĆ PULI</p>
        <h2>Wybierz tempo pracy ze swoim biznesem.</h2>
        <p>Lite i Pro dają ten sam sposób pracy i jakość asystenta. Pro ma około 2,4× większą miesięczną pulę niż Lite.</p>
      </div>
      <div className="pricing-grid pricing-grid-two">
        {publicPlanIds.map((planId) => {
          const plan = plans[planId];
          const details = planDetails[planId];
          return (
            <article key={planId} className={planId === "pro" ? "featured" : ""}>
              {planId === "pro" && <span className="plan-ribbon">REKOMENDOWANY</span>}
              <small>{details.audience}</small>
              <h3>SmartFach {plan.name}</h3>
              <p>{details.description}</p>
              <strong>{plan.price}<span> / miesiąc</span></strong>
              <p className="plan-limit"><Target size={16} /> {publicPlanLimitLabel(planId)}</p>
              <ul>{sharedPlanFeatures.map((feature) => <li key={feature}><Check size={15} /> {feature}</li>)}</ul>
              <TrackedPlanLink plan={planId} href={`/logowanie?plan=${planId}`}>Wypróbuj {plan.name} przez 3 dni <ArrowRight size={15} /></TrackedPlanLink>
            </article>
          );
        })}
      </div>
      <div className="pricing-limit-explainer">
        <p><strong>Jak działa pula?</strong> Zużycie zależy od długości rozmowy, zdjęć i używanych narzędzi. Dlatego nie obiecujemy stałej liczby wiadomości.</p>
        <p><strong>Co po wyczerpaniu?</strong> Możesz poczekać na miesięczne odnowienie, ręcznie dokupić limit albo zmienić plan. Nic nie dokupuje się automatycznie.</p>
      </div>
      <p className="trial-disclosure"><ShieldCheck size={15} /> <span><strong>3 dni za 0 zł · karta wymagana.</strong> Jeśli nie anulujesz przed końcem próby, pobierzemy cenę wybranego planu za pierwszy miesiąc. Abonament odnawia się co miesiąc do rezygnacji.</span></p>
      <p className="pricing-disclaimer">Przed podpięciem karty zobaczysz 0 zł dzisiaj, wybrany plan i dokładny termin pierwszej opłaty.</p>
    </section>
  );
}

function FAQSection() {
  return (
    <section className="marketing-section faq-section" id="faq">
      <div className="faq-intro">
        <p className="marketing-kicker">PYTANIA PRZED STARTEM</p>
        <h2>Ważne odpowiedzi w jednym miejscu.</h2>
        <p>Sprawdź sposób pracy, limity i zasady próby, zanim podepniesz kartę.</p>
        <div className="faq-contact">
          <MessageCircle size={20} />
          <p><strong>Masz inne pytanie?</strong><span>Napisz do nas przed rozpoczęciem próby.</span></p>
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
      <SectionTrialCta
        eyebrow="MASZ JUŻ NAJWAŻNIEJSZE ODPOWIEDZI"
        title="Sprawdź na własnym przykładzie, jak szybko przejdziesz od umiejętności do oferty."
      />
    </section>
  );
}

function TrialTerms({ compact = false }: { compact?: boolean }) {
  return (
    <p className={compact ? "cta-trial-terms compact" : "cta-trial-terms"}>
      0 zł przez 3 dni. Karta wymagana. Następnie Pro 99 zł/mies., automatycznie do anulowania. Anuluj przed końcem próby, aby uniknąć pierwszej opłaty.
    </p>
  );
}

export function MarketingHome() {
  return (
    <div className="marketing-site builder-marketing landing-v3 landing-v4">
      <a className="skip-link" href="#landing-content">Przejdź do treści</a>
      <div className="landing-announcement" aria-label="Najważniejsze informacje o SmartFach">
        <span>LITE 49 ZŁ / MIES.</span>
        <i aria-hidden="true" />
        <span>PRO 99 ZŁ / MIES.</span>
        <i aria-hidden="true" />
        <span>3 DNI ZA 0 ZŁ · KARTA WYMAGANA</span>
      </div>
      <MarketingHeader />
      <main id="landing-content">
        <section className="marketing-hero builder-hero">
          <div className="hero-copy">
            <p className="marketing-kicker hero-kicker"><span aria-hidden="true" /> ASYSTENT AI DO PRACY NAD WŁASNĄ USŁUGĄ</p>
            <h1>Zamień to, co umiesz, <em>w usługę, którą możesz sprzedawać.</em></h1>
            <p className="hero-lead">SmartFach pomoże Ci wybrać usługę dopasowaną do umiejętności i czasu, przygotować ofertę oraz pierwszą wiadomość. Potem wracasz z odpowiedziami i dopracowujesz kolejne działania.</p>
            <div className="hero-actions">
              <Link className="hero-primary" href="/logowanie?plan=pro">Wypróbuj SmartFach przez 3 dni <ArrowRight size={18} /></Link>
              <Link className="hero-secondary" href="/#przykladowa-oferta">Zobacz przykładową ofertę</Link>
            </div>
            <TrialTerms />
            <div className="hero-path" aria-label="Droga ze SmartFach">
              <span><b>01</b> Usługa</span>
              <ArrowRight size={15} aria-hidden="true" />
              <span><b>02</b> Oferta</span>
              <ArrowRight size={15} aria-hidden="true" />
              <span><b>03</b> Pierwszy kontakt</span>
            </div>
          </div>
          <ProductPreview />
        </section>
        <OfferDemoSection />
        <AudienceSection />
        <WorkProcessSection />
        <OngoingValueSection />
        <PricingSection />
        <FAQSection />
        <section className="marketing-cta builder-cta">
          <BrandMark size={48} />
          <p className="marketing-kicker">OD UMIEJĘTNOŚCI DO KONKRETNEJ OFERTY</p>
          <h2>Zacznij od tego, co już umiesz.</h2>
          <p>Opisz swoją sytuację i przygotuj pierwszy kierunek do sprawdzenia.</p>
          <Link href="/logowanie?plan=pro">Wypróbuj SmartFach przez 3 dni <ArrowRight size={18} /></Link>
          <TrialTerms compact />
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

export function PricingLanding() {
  return (
    <div className="marketing-site path-landing builder-marketing landing-v3 landing-v4 public-v2">
      <MarketingHeader />
      <main>
        <section className="pricing-hero">
          <p className="marketing-kicker">LITE LUB PRO · TEN SAM ASYSTENT AI</p>
          <h1>Wybierz miesięczną pulę dopasowaną do tempa pracy.</h1>
          <p>Lite kosztuje 49 zł miesięcznie. Pro kosztuje 99 zł i ma około 2,4× większą miesięczną pulę. Oba plany mają te same funkcje.</p>
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
      <p>Asystent AI od Twoich umiejętności do konkretnej oferty i pierwszych działań sprzedażowych.</p>
      <div>
        <Link href="/#przykladowa-oferta">Przykładowa oferta</Link>
        <Link href="/#jak-dziala">Jak to działa</Link>
        <Link href="/#dla-ciebie">Dla Ciebie</Link>
        <Link href="/cennik">Cennik</Link>
        <Link href="/kontakt">Kontakt</Link>
        <Link href="/regulamin">Regulamin</Link>
        <Link href="/polityka-prywatnosci">Prywatność</Link>
        <Link href="/odstapienie">Odstąp od umowy tutaj</Link>
      </div>
    </footer>
  );
}
