import Link from "next/link";
import { Download, Mail, Phone, ShieldCheck } from "lucide-react";
import { MarketingFooter, MarketingHeader } from "./marketing";
import { ContactForm } from "./contact-form";
import { BrandMark } from "./brand";
import { legalDocumentUpdatedAt } from "@/domain/operator";
import { termsDocument, privacyDocument, type LegalDocument } from "@/domain/legal";
import { getOperator } from "@/server/operator-settings";

export async function ContactPage() {
  const smartFachOperator = await getOperator();
  return (
    <div className="marketing-site public-info-site">
      <MarketingHeader />
      <main>
        <section className="public-info-hero contact-hero">
          <div>
            <p className="marketing-kicker"><Mail size={14} /> KONTAKT</p>
            <h1>Porozmawiajmy o Twoim starcie.</h1>
            <p>
              Masz pytanie, nie wiesz, który plan wybrać albo chcesz sprawdzić,
              czy SmartFach pasuje do Twojej sytuacji? Napisz krótko.
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
            <a href={`tel:${smartFachOperator.phone.replace(/[^+\d]/g, "")}`}><Phone size={16} /> {smartFachOperator.phone}</a>
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
              Napisz, czy wolisz działać zdalnie czy lokalnie, co już umiesz i
              czego chcesz uniknąć. Jeśli masz pomysł, możesz dodać go od razu.
            </p>
          </div>
          <ContactForm email={smartFachOperator.email} />
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

function LegalPage({ document, lead, slug }: { document: LegalDocument; lead: string; slug: string }) {
  return (
    <div className="marketing-site public-info-site legal-site">
      <MarketingHeader />
      <main>
        <section className="public-info-hero legal-hero">
          <div>
            <p className="marketing-kicker"><ShieldCheck size={14} /> DOKUMENTY I ZASADY</p>
            <h1>{document.title}</h1>
            <p>{lead}</p>
            <small>Wersja dokumentu: {legalDocumentUpdatedAt}</small>
            <a className="button button-secondary legal-download" href={`/api/legal/${slug}`} download><Download size={17} /> Pobierz dokument</a>
          </div>
        </section>
        <article className="legal-document">
          <nav className="legal-contents" aria-label="Spis treści">
            <strong>W dokumencie</strong>
            {document.sections.map((section, index) => <a key={section.title} href={`#punkt-${index + 1}`}>{section.title}</a>)}
          </nav>
          {document.sections.map((section, index) => (
            <section key={section.title} id={`punkt-${index + 1}`}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
            </section>
          ))}
        </article>
      </main>
      <MarketingFooter />
    </div>
  );
}

export async function TermsPage() {
  const operator = await getOperator();
  return <LegalPage document={termsDocument(operator)} slug="regulamin" lead="Zasady konta, trzydniowej próby, płatności, limitów i Twoje prawa." />;
}

export async function PrivacyPage() {
  const operator = await getOperator();
  return <LegalPage document={privacyDocument(operator)} slug="polityka-prywatnosci" lead="Jak przetwarzamy dane, kto ma do nich dostęp i jak możesz zrealizować swoje prawa." />;
}
