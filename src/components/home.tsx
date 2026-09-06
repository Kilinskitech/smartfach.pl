"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Building2,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  ClipboardCheck,
  Compass,
  FileText,
  LoaderCircle,
  MessageCircle,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Rocket,
  Upload,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import { BrandMark } from "./brand";
import { useWorkspace } from "./use-workspace";
import { ChatPanel } from "./chat-panel";
import { ClientForm, PriceForm, TeamMemberForm } from "./entity-forms";
import { ReportEditor } from "./report-editor";
import { QuoteEditor } from "./quote-editor";
import { CatalogImport } from "./catalog-import";
import { DocumentViewer } from "./document-viewer";
import { Dialog } from "./dialog";
import { SettingsPanel } from "./settings-panel";
import { BillingDialog } from "./billing-dialog";
import {
  documentClient,
  documentClientId,
  documentTitle,
  newQuote,
  newReport,
  type Client,
  type PriceItem,
  type WorkDocument,
  type VisitReport,
  type Conversation,
  type TeamMember,
} from "@/domain/workspace";
import { plans } from "@/domain/billing";
import { parseMoneyCents, formatPln } from "@/domain/quotes/calculate";
import { validateDraft, type QuoteDraft } from "@/domain/quotes/draft";
import { catalogKey } from "@/domain/catalog-csv";

type View =
  | "chat"
  | "quotes"
  | "reports"
  | "clients"
  | "team"
  | "catalog"
  | "settings";
type AiConfiguration = {
  available: boolean;
  webSearch: boolean;
};
type Modal =
  | { type: "quote"; draft: QuoteDraft; id: string }
  | { type: "report"; report: VisitReport; id: string }
  | { type: "client"; client: Client }
  | { type: "price"; item: PriceItem }
  | { type: "team-member"; member: TeamMember }
  | { type: "import" }
  | { type: "document"; id: string }
  | { type: "client-detail"; id: string }
  | { type: "conversations" }
  | { type: "billing" }
  | null;
const navItems = [
  { id: "chat", label: "Asystent", icon: MessageCircle },
  { id: "quotes", label: "Wyceny", icon: FileText },
  { id: "reports", label: "Protokoły", icon: ClipboardCheck },
  { id: "clients", label: "Klienci", icon: Users },
  { id: "team", label: "Zespół", icon: UsersRound },
  { id: "catalog", label: "Cennik", icon: BookOpen },
] as const;
const titles: Record<View, string> = {
  chat: "Asystent",
  quotes: "Wyceny",
  reports: "Protokoły",
  clients: "Klienci",
  team: "Zespół",
  catalog: "Cennik",
  settings: "Ustawienia",
};
const journeyOptions = [
  {
    id: "discover",
    label: "Buduję przychód",
    description: "Wybieraj usługę i zdobywaj klientów",
    icon: Compass,
  },
  {
    id: "launch",
    label: "Rozwijam ofertę",
    description: "Zamieniaj pomysł w sprzedaż",
    icon: Rocket,
  },
  {
    id: "operate",
    label: "Prowadzę firmę",
    description: "Obsługuj i rozwijaj firmę",
    icon: BriefcaseBusiness,
  },
] as const;
const teamRoleLabels: Record<TeamMember["role"], string> = {
  technician: "Fachowiec",
  office: "Biuro",
  manager: "Kierownik",
};
const normalize = (value: string) => value.trim().toLocaleLowerCase("pl");
function dateLabel(value: string) {
  return new Date(value).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "short",
  });
}
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  label,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
  action: () => void;
  label: string;
}) {
  return (
    <div className="empty-state">
      <span>
        <Icon size={29} strokeWidth={1.6} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      <button className="button button-primary" onClick={action}>
        <Plus size={18} />
        {label}
      </button>
    </div>
  );
}
export function Home() {
  const router = useRouter();
  const { data, error, saving, commit } = useWorkspace();
  const [view, setView] = useState<View>("chat"),
    [modal, setModal] = useState<Modal>(null),
    [search, setSearch] = useState(""),
    [notice, setNotice] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null),
    [chatBusy, setChatBusy] = useState(false),
    [chatInstance, setChatInstance] = useState(0);
  const [available, setAvailable] = useState<boolean | null>(null),
    [checking, setChecking] = useState(false),
    [webSearch, setWebSearch] = useState(false);
  function applyAiConfiguration(json: AiConfiguration) {
    setAvailable(json.available === true);
    setWebSearch(json.webSearch === true);
  }
  async function checkConnection() {
    setChecking(true);
    try {
      const response = await fetch("/api/assistant", { cache: "no-store" });
      const json = (await response.json()) as AiConfiguration;
      if (response.ok) applyAiConfiguration(json);
      else setAvailable(false);
    } catch {
      setAvailable(false);
    } finally {
      setChecking(false);
    }
  }
  useEffect(() => {
    window.localStorage.removeItem("smartfach-test-model");
    const controller = new AbortController();
    fetch("/api/assistant", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const json = (await response.json()) as AiConfiguration;
        if (response.ok) applyAiConfiguration(json);
        return response.ok && json.available === true;
      })
      .then(setAvailable)
      .catch(() => {
        if (!controller.signal.aborted) setAvailable(false);
      });
    return () => controller.abort();
  }, []);
  function navigate(next: View) {
    setView(next);
    setSearch("");
    setNotice("");
  }
  function openQuote(draft?: QuoteDraft, id?: string, client?: Client) {
    const saved = data?.documents.find((doc) => doc.id === id);
    setModal({
      type: "quote",
      draft:
        saved?.kind === "quote" ? saved.draft : (draft ?? newQuote(client)),
      id: id ?? crypto.randomUUID(),
    });
  }
  function openReport(report?: VisitReport, id?: string, client?: Client) {
    const saved = data?.documents.find((doc) => doc.id === id);
    setModal({
      type: "report",
      report:
        saved?.kind === "report" ? saved.report : (report ?? newReport(client)),
      id: id ?? crypto.randomUUID(),
    });
  }
  function openClient(client?: Client) {
    setModal({
      type: "client",
      client: client ?? {
        id: crypto.randomUUID(),
        name: "",
        phone: "",
        email: "",
        address: "",
        notes: "",
      },
    });
  }
  function openPrice(item?: PriceItem) {
    setModal({
      type: "price",
      item: item ?? {
        id: crypto.randomUUID(),
        name: "",
        unit: "szt.",
        price: "",
      },
    });
  }
  function openTeamMember(member?: TeamMember) {
    setModal({
      type: "team-member",
      member: member ?? {
        id: crypto.randomUUID(),
        name: "",
        email: "",
        phone: "",
        role: "technician",
      },
    });
  }
  function editDocument(doc: WorkDocument) {
    if (doc.kind === "quote") openQuote(doc.draft, doc.id);
    else openReport(doc.report, doc.id);
  }
  async function saveDocument(
    value:
      | { kind: "quote"; draft: QuoteDraft }
      | { kind: "report"; report: VisitReport },
    id: string,
  ) {
    await commit((current) => {
      const details = value.kind === "quote" ? value.draft : value.report;
      let clientId = details.clientId ?? "";
      let clients = current.clients;
      if (!clientId) {
        if (
          clients.some(
            (client) => normalize(client.name) === normalize(details.client),
          )
        )
          throw new Error(
            "Klient o tej nazwie jest już w kartotece. Wybierz go z listy „Klient z kartoteki”, aby nie pomylić historii.",
          );
        const client: Client = {
          id: crypto.randomUUID(),
          name: details.client.trim(),
          phone: "",
          email: "",
          address: "",
          notes: "",
        };
        clients = [...clients, client];
        clientId = client.id;
      }
      const previous = current.documents.find((doc) => doc.id === id),
        now = new Date().toISOString();
      const doc: WorkDocument =
        value.kind === "quote"
          ? {
              id,
              createdAt: previous?.createdAt ?? now,
              updatedAt: now,
              kind: "quote",
              draft: { ...value.draft, clientId },
            }
          : {
              id,
              createdAt: previous?.createdAt ?? now,
              updatedAt: now,
              kind: "report",
              report: { ...value.report, clientId },
            };
      return {
        ...current,
        clients,
        documents: previous
          ? current.documents.map((item) => (item.id === id ? doc : item))
          : [...current.documents, doc],
      };
    });
    setModal({ type: "document", id });
    setNotice("Dokument zapisany na Twoim koncie. Możesz go sprawdzić i pobrać PDF.");
  }
  async function saveClient(client: Client) {
    await commit((current) => ({
      ...current,
      clients: current.clients.some((item) => item.id === client.id)
        ? current.clients.map((item) => (item.id === client.id ? client : item))
        : [...current.clients, client],
    }));
    setModal(null);
    setNotice("Zapisano klienta na Twoim koncie.");
  }
  async function savePrice(item: PriceItem) {
    await commit((current) => {
      if (
        current.catalog.some(
          (entry) =>
            entry.id !== item.id && catalogKey(entry) === catalogKey(item),
        )
      )
        throw new Error(
          "Taka nazwa i jednostka już są w cenniku. Edytuj istniejącą pozycję.",
        );
      return {
        ...current,
        catalog: current.catalog.some((entry) => entry.id === item.id)
          ? current.catalog.map((entry) =>
              entry.id === item.id ? item : entry,
            )
          : [...current.catalog, item],
      };
    });
    setModal(null);
    setNotice("Zapisano pozycję w cenniku.");
  }
  async function saveTeamMember(member: TeamMember) {
    await commit((current) => {
      if (
        member.email &&
        current.team.some(
          (entry) =>
            entry.id !== member.id &&
            normalize(entry.email) === normalize(member.email),
        )
      )
        throw new Error("Osoba z tym adresem e-mail jest już w zespole.");
      return {
        ...current,
        team: current.team.some((entry) => entry.id === member.id)
          ? current.team.map((entry) =>
              entry.id === member.id ? member : entry,
            )
          : [...current.team, member],
      };
    });
    setModal(null);
    setNotice("Zaktualizowano listę zespołu na koncie.");
  }
  async function deleteRecord(
    kind: "client" | "price" | "document" | "team-member",
    id: string,
  ) {
    await commit((current) => {
      if (kind === "client") {
        if (current.documents.some((doc) => documentClientId(doc) === id))
          throw new Error(
            "Klient ma dokumenty w historii. Najpierw usuń przypisane dokumenty.",
          );
        return {
          ...current,
          clients: current.clients.filter((client) => client.id !== id),
        };
      }
      if (kind === "price")
        return {
          ...current,
          catalog: current.catalog.filter((item) => item.id !== id),
        };
      if (kind === "team-member")
        return {
          ...current,
          team: current.team.filter((member) => member.id !== id),
        };
      return {
        ...current,
        documents: current.documents.filter((doc) => doc.id !== id),
      };
    });
    setModal(null);
    setNotice(
      "Usunięto wpis z tego komputera. Nie można tego cofnąć w aplikacji.",
    );
  }
  async function saveConversation(
    conversation: Conversation,
    creditsUsed = 0,
  ) {
    await commit((current) => ({
      ...current,
      conversations: current.conversations.some(
        (item) => item.id === conversation.id,
      )
        ? current.conversations.map((item) =>
            item.id === conversation.id ? conversation : item,
          )
        : [...current.conversations, conversation],
      billing: {
        ...current.billing,
        usedCredits: current.billing.usedCredits + creditsUsed,
      },
    }));
    setConversationId(conversation.id);
  }
  function selectConversation(id: string | null) {
    setConversationId(id);
    setChatInstance((value) => value + 1);
    setModal(null);
    navigate("chat");
  }
  const activeConversation = data?.conversations.find(
    (item) => item.id === conversationId,
  );
  const documentKind =
    view === "quotes" ? "quote" : view === "reports" ? "report" : null;
  const filteredDocs =
    data?.documents
      .filter((doc) => !documentKind || doc.kind === documentKind)
      .filter((doc) =>
        normalize(documentTitle(doc) + " " + documentClient(doc)).includes(
          normalize(search),
        ),
      )
      .toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt)) ?? [];
  const hasDocumentsForView =
    documentKind !== null &&
    Boolean(data?.documents.some((doc) => doc.kind === documentKind));
  const selectedDocument =
    modal?.type === "document"
      ? data?.documents.find((doc) => doc.id === modal.id)
      : undefined;
  const selectedClient =
    modal?.type === "client-detail"
      ? data?.clients.find((client) => client.id === modal.id)
      : undefined;
  const clientDocuments = selectedClient
    ? (data?.documents
        .filter((doc) => documentClientId(doc) === selectedClient.id)
        .toReversed() ?? [])
    : [];
  const headerAction =
    view === "clients"
      ? () => openClient()
      : view === "team"
        ? () => openTeamMember()
        : () => openPrice();
  const productData = data
    ? { ...data, journey: { ...data.journey, mode: "discover" as const } }
    : undefined;
  const activeAccountType = data
    ? journeyOptions.find((option) => option.id === "discover")
    : undefined;
  const ActiveAccountTypeIcon = activeAccountType?.icon;

  return (
    <div className="product-app">
      <a className="skip-link" href="#main">
        Przejdź do treści
      </a>
      <aside className="app-sidebar">
        <button
          className="sidebar-brand"
          onClick={() => navigate("chat")}
          aria-label="SmartFach — asystent"
        >
          <BrandMark size={40} />
          <span>
            Smart<b>Fach</b>
            <small>TWÓJ ASYSTENT DO DZIAŁANIA</small>
          </span>
        </button>
        {activeAccountType && ActiveAccountTypeIcon && (
          <button className="account-type-summary" onClick={() => navigate("settings")}>
            <ActiveAccountTypeIcon size={18} />
            <span><small>TWÓJ KIERUNEK</small><strong>{activeAccountType.label}</strong></span>
            <Settings size={15} />
          </button>
        )}
        <button
          className="new-chat-button"
          disabled={chatBusy}
          onClick={() => {
            setConversationId(null);
            setChatInstance((value) => value + 1);
            navigate("chat");
          }}
        >
          <Plus size={18} />
          Nowa rozmowa
        </button>
        <p className="nav-label">ASYSTENT</p>
        <nav aria-label="Asystent">
          {navItems.slice(0, 1).map(({ id, label, icon: Icon }) => (
            <button
              className={view === id ? "selected" : ""}
              aria-current={view === id ? "page" : undefined}
              onClick={() => navigate(id)}
              key={id}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        {!!data?.conversations.length && (
          <div className="recent-conversations">
            <p className="nav-label">ROZMOWY</p>
            {data.conversations
              .toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt))
              .map((conversation) => (
                <button
                  key={conversation.id}
                  className={
                    conversation.id === conversationId ? "selected" : ""
                  }
                  aria-current={
                    conversation.id === conversationId ? "page" : undefined
                  }
                  disabled={chatBusy}
                  onClick={() => selectConversation(conversation.id)}
                  title={conversation.title}
                >
                  <MessageCircle size={14} />
                  <span>{conversation.title}</span>
                </button>
              ))}
          </div>
        )}
        <div className="sidebar-bottom">
          <button
            className={"company-nav" + (view === "settings" ? " selected" : "")}
            onClick={() => navigate("settings")}
          >
            <span className="company-avatar">
              <Building2 size={19} />
            </span>
            <span>
              {data?.company.name || "Twoje konto"}
              <small>{data ? `Plan ${plans[data.billing.plan].name} · ustawienia i dane` : "Ustawienia i dane"}</small>
            </span>
            <Settings size={17} />
          </button>
          <p>
            <ShieldCheck size={13} />
            Prywatna przestrzeń konta
          </p>
        </div>
      </aside>
      <div className="app-content">
        <header className="workspace-header">
          <div className="mobile-brand">
            <BrandMark size={31} />
          </div>
          <div className="breadcrumb">
            <span>SmartFach</span>
            <ChevronRight size={14} />
            <h1>{titles[view]}</h1>
          </div>
          <div className="topbar-actions">
            <span className="local-badge">
              <span />
              {saving ? "Zapisuję…" : "Zapisano"}
            </span>
            {view === "chat" && (
              <>
                {!!data?.conversations.length && (
                  <button
                    className="mobile-conversations"
                    disabled={chatBusy}
                    onClick={() => setModal({ type: "conversations" })}
                    aria-label="Otwórz rozmowy"
                  >
                    <MessageCircle size={20} />
                  </button>
                )}
                <button
                  className="topbar-new-chat"
                  disabled={chatBusy}
                  onClick={() => selectConversation(null)}
                  aria-label="Rozpocznij nową rozmowę"
                >
                  <Plus size={19} />
                  <span>Nowa rozmowa</span>
                </button>
              </>
            )}
            <button
              className="mobile-settings"
              onClick={() => navigate("settings")}
              aria-label="Ustawienia"
            >
              <Settings size={21} />
            </button>
          </div>
        </header>
        <main
          id="main"
          className={"main-content " + (view === "chat" ? "main-chat" : "")}
        >
          {error && (
            <div className="global-error" role="alert">
              <strong>Nie udało się wykonać operacji.</strong>
              <span>{error}</span>
              <button onClick={() => window.location.reload()}>
                Odśwież widok
              </button>
            </div>
          )}
          {notice && (
            <div className="toast" role="status">
              <Check size={17} />
              <span>{notice}</span>
              <button
                aria-label="Zamknij powiadomienie"
                onClick={() => setNotice("")}
              >
                <X size={17} />
              </button>
            </div>
          )}
          {!data ? (
            <div className="loading-workspace">
              <LoaderCircle size={22} />
              <p>
                {error
                  ? "Nie można otworzyć danych konta."
                  : "Otwieram Twój warsztat…"}
              </p>
            </div>
          ) : (
            <>
              <div hidden={view !== "chat"} className="chat-view">
                <ChatPanel
                  key={chatInstance}
                  data={productData!}
                  conversation={activeConversation}
                  available={available}
                  webSearch={webSearch}
                  checking={checking}
                  checkConnection={checkConnection}
                  onSaveConversation={saveConversation}
                  onNewQuote={openQuote}
                  onNewReport={openReport}
                  onSettings={() => navigate("settings")}
                  onBusy={setChatBusy}
                  onOpenBilling={() => setModal({ type: "billing" })}
                />
              </div>
              {view !== "chat" && (
                <section className="module-view" aria-label={titles[view]}>
                  <div className="module-heading">
                    <div>
                      <p className="eyebrow">
                        {view === "settings"
                          ? "TWOJE USTAWIENIA"
                          : view === "team"
                            ? "PLAN FIRMA"
                          : "WSZYSTKO NA SWOIM MIEJSCU"}
                      </p>
                      <h2>{titles[view]}</h2>
                      <p>
                        {view === "quotes"
                          ? "Gotowe wyceny w jednym miejscu — do sprawdzenia, edycji i pobrania."
                          : view === "reports"
                            ? "Protokoły z wizyt zapisane w historii klientów."
                            : view === "clients"
                            ? "Kontakty i dokumenty — bez szukania w wiadomościach."
                            : view === "team"
                              ? "Osoby pracujące w firmie, ich stanowiska i miejsca w planie."
                            : view === "catalog"
                              ? "Twoje usługi, materiały i stawki. Bez zgadywania cen."
                              : "Twoje preferencje, dane, płatność i prywatny eksport."}
                      </p>
                    </div>
                    {view !== "settings" &&
                      (view !== "team" || data.billing.plan === "firma") && (
                      <div className="module-heading-actions">
                        {view === "catalog" && (
                          <button
                            className="button button-secondary"
                            onClick={() => setModal({ type: "import" })}
                          >
                            <Upload size={18} />
                            <span>Import CSV</span>
                          </button>
                        )}
                        {view === "quotes" || view === "reports" ? (
                          <button
                            className="button button-primary"
                            onClick={() => {
                              setConversationId(null);
                              setChatInstance((value) => value + 1);
                              navigate("chat");
                            }}
                          >
                            <MessageCircle size={18} />
                            {view === "quotes"
                              ? "Stwórz wycenę"
                              : "Stwórz protokół"}
                          </button>
                        ) : (
                          <button
                            className="button button-primary"
                            onClick={headerAction}
                          >
                            <Plus size={19} />
                            {view === "clients"
                              ? "Dodaj klienta"
                              : view === "team"
                                ? "Dodaj osobę"
                                : "Dodaj pozycję"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {view !== "settings" &&
                    (view !== "team" || data.billing.plan === "firma") && (
                    <div className="search-bar">
                      <Search size={18} />
                      <input
                        aria-label={"Szukaj: " + titles[view]}
                        placeholder={
                          view === "catalog"
                            ? "Szukaj usługi lub materiału…"
                            : view === "team"
                              ? "Szukaj osoby lub stanowiska…"
                            : view === "clients"
                              ? "Szukaj klienta…"
                              : view === "quotes"
                                ? "Szukaj wyceny lub klienta…"
                                : "Szukaj protokołu lub klienta…"
                        }
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                      />
                      {search && (
                        <button
                          onClick={() => setSearch("")}
                          aria-label="Wyczyść wyszukiwanie"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  )}
                  {(view === "quotes" || view === "reports") &&
                    (filteredDocs.length ? (
                      <div className="document-list">
                        {filteredDocs.map((doc) => (
                          <button
                            className="document-row"
                            key={doc.id}
                            onClick={() =>
                              setModal({ type: "document", id: doc.id })
                            }
                          >
                            <span className={"record-icon " + doc.kind}>
                              {doc.kind === "quote" ? (
                                <FileText size={22} />
                              ) : (
                                <ClipboardCheck size={22} />
                              )}
                            </span>
                            <span className="document-row-description">
                              <small>
                                {doc.kind === "quote" ? "WYCENA" : "PROTOKÓŁ"}
                              </small>
                              <strong>{documentTitle(doc)}</strong>
                              <span>
                                {documentClient(doc)}
                                <i /> {dateLabel(doc.updatedAt)}
                              </span>
                            </span>
                            <span className="document-row-value">
                              {doc.kind === "quote" ? (
                                <>
                                  <strong>
                                    {formatPln(
                                      validateDraft(doc.draft).quote!
                                        .grossCents,
                                    )}
                                  </strong>
                                  <small>brutto</small>
                                </>
                              ) : (
                                <small>Protokół wizyty</small>
                              )}
                            </span>
                            <ChevronRight size={18} />
                          </button>
                        ))}
                      </div>
                    ) : search && hasDocumentsForView ? (
                      <div className="no-results">
                        {view === "quotes"
                          ? `Nie znaleziono wyceny dla „${search}”.`
                          : `Nie znaleziono protokołu dla „${search}”.`}
                      </div>
                    ) : (
                      <EmptyState
                        icon={view === "quotes" ? FileText : ClipboardCheck}
                        title={
                          view === "quotes"
                            ? "Tutaj pojawią się Twoje wyceny"
                            : "Tutaj pojawią się protokoły z wizyt"
                        }
                        description={
                          view === "quotes"
                            ? "Napisz asystentowi, co trzeba wycenić. Po sprawdzeniu i zapisaniu wycena trafi na tę listę."
                            : "Po wizycie opisz wykonane prace. Po sprawdzeniu i zapisaniu protokół trafi na tę listę."
                        }
                        label="Wróć do asystenta"
                        action={() => navigate("chat")}
                      />
                    ))}
                  {view === "clients" &&
                    (data.clients.length ? (
                      <div className="clients-grid">
                        {data.clients
                          .filter((client) =>
                            normalize(
                              client.name +
                                " " +
                                client.phone +
                                " " +
                                client.address,
                            ).includes(normalize(search)),
                          )
                          .map((client) => (
                            <button
                              className="client-card"
                              onClick={() =>
                                setModal({
                                  type: "client-detail",
                                  id: client.id,
                                })
                              }
                              key={client.id}
                            >
                              <span className="client-avatar">
                                {client.name
                                  .split(/\s+/)
                                  .slice(0, 2)
                                  .map((word) => word[0])
                                  .join("")
                                  .toUpperCase()}
                              </span>
                              <div>
                                <h3>{client.name}</h3>
                                <p>
                                  {client.address ||
                                    client.phone ||
                                    "Dane kontaktowe możesz uzupełnić później"}
                                </p>
                                <span>
                                  Dokumenty w historii:{" "}
                                  {
                                    data.documents.filter(
                                      (doc) =>
                                        documentClientId(doc) === client.id,
                                    ).length
                                  }
                                </span>
                              </div>
                              <ChevronRight size={18} />
                            </button>
                          ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={Users}
                        title="Poznajmy Twoich klientów"
                        description="Dodaj kontakt lub stwórz pierwszy dokument. Klient wpisany ręcznie na nowym dokumencie zostanie dodany do kartoteki."
                        label="Dodaj pierwszego klienta"
                        action={() => openClient()}
                      />
                    ))}
                  {view === "clients" &&
                    data.clients.length > 0 &&
                    !data.clients.some((client) =>
                      normalize(
                        client.name + " " + client.phone + " " + client.address,
                      ).includes(normalize(search)),
                    ) && (
                      <div className="no-results">Nie znaleziono klienta.</div>
                    )}
                  {view === "team" && data.billing.plan !== "firma" && (
                    <section className="team-upgrade">
                      <span><UsersRound size={28} /></span>
                      <p className="eyebrow">SMARTFACH FIRMA</p>
                      <h3>Wspólna przestrzeń zaczyna się od zespołu.</h3>
                      <p>
                        Plan Firma obejmuje właściciela i 3 członków. Kolejne
                        miejsce zwiększa miesięczną cenę o 49,99 zł.
                      </p>
                      <button
                        className="button button-primary"
                        onClick={() => router.push("/platnosc")}
                      >
                        Przejdź do planu Firma
                        <ArrowRight size={17} />
                      </button>
                    </section>
                  )}
                  {view === "team" && data.billing.plan === "firma" && (
                    <>
                      <div className="team-summary">
                        <div>
                          <span><UsersRound size={21} /></span>
                          <p>
                            <small>AKTYWNE MIEJSCA</small>
                            <strong>{data.team.length + 1}</strong>
                            <em>właściciel + {data.team.length} członków</em>
                          </p>
                        </div>
                        <div>
                          <small>MIESIĘCZNIE</small>
                          <strong>
                            {formatPln(
                              29_900 + Math.max(0, data.team.length - 3) * 4_999,
                            )}
                          </strong>
                          <em>
                            {data.team.length <= 3
                              ? `${3 - data.team.length} wolne ${3 - data.team.length === 1 ? "miejsce" : "miejsca"} w cenie`
                              : `${data.team.length - 3} dodatkowe ${data.team.length - 3 === 1 ? "miejsce" : "miejsca"}`}
                          </em>
                        </div>
                      </div>
                      <div className="team-list">
                        <article className="team-card owner-card">
                          <span className="team-avatar"><Building2 size={20} /></span>
                          <div>
                            <small>WŁAŚCICIEL</small>
                            <strong>{data.company.name || "Właściciel konta"}</strong>
                            <p>Pełna odpowiedzialność za przestrzeń firmy</p>
                          </div>
                          <span className="team-included">W planie</span>
                        </article>
                        {data.team
                          .map((member, index) => ({ member, index }))
                          .filter(({ member }) =>
                            normalize(
                              `${member.name} ${member.email} ${member.phone} ${teamRoleLabels[member.role]}`,
                            ).includes(normalize(search)),
                          )
                          .map(({ member, index }) => (
                            <button
                              className="team-card"
                              key={member.id}
                              onClick={() => openTeamMember(member)}
                            >
                              <span className="team-avatar">
                                {member.name
                                  .split(/\s+/)
                                  .slice(0, 2)
                                  .map((word) => word[0])
                                  .join("")
                                  .toUpperCase()}
                              </span>
                              <div>
                                <small>{teamRoleLabels[member.role].toUpperCase()}</small>
                                <strong>{member.name}</strong>
                                <p>{member.email || member.phone || "Bez danych kontaktowych"}</p>
                              </div>
                              <span className={index < 3 ? "team-included" : "team-extra"}>
                                {index < 3 ? "W planie" : "+49,99 zł"}
                              </span>
                              <ChevronRight size={18} />
                            </button>
                          ))}
                      </div>
                      {data.team.length === 0 && (
                        <EmptyState
                          icon={UsersRound}
                          title="Dodaj pierwszą osobę do zespołu"
                          description="Plan Firma obejmuje 3 członków poza właścicielem. Dodaj osoby, które mają pracować na wspólnych klientach i dokumentach."
                          label="Dodaj osobę"
                          action={() => openTeamMember()}
                        />
                      )}
                      {data.team.length > 0 &&
                        !data.team.some((member) =>
                          normalize(
                            `${member.name} ${member.email} ${member.phone} ${teamRoleLabels[member.role]}`,
                          ).includes(normalize(search)),
                        ) && (
                          <div className="no-results">Nie znaleziono osoby.</div>
                        )}
                      <p className="team-account-note">
                        <ShieldCheck size={15} /> Lista zespołu nie wysyła jeszcze
                        zaproszeń i nie tworzy osobnych loginów;
                        te operacje wymagają wdrożenia bezpiecznych kont firmowych.
                      </p>
                    </>
                  )}
                  {view === "catalog" &&
                    (data.catalog.length ? (
                      <div className="catalog-list">
                        <div className="catalog-list-heading">
                          <span>USŁUGA / MATERIAŁ</span>
                          <span>CENA SPRZEDAŻY NETTO</span>
                        </div>
                        {data.catalog
                          .filter((item) =>
                            normalize(item.name).includes(normalize(search)),
                          )
                          .map((item) => (
                            <button
                              className="catalog-row"
                              key={item.id}
                              onClick={() => openPrice(item)}
                            >
                              <span className="record-icon">
                                <BookOpen size={19} />
                              </span>
                              <strong>{item.name}</strong>
                              <span>
                                <b>{formatPln(parseMoneyCents(item.price))}</b>
                                <small>/ {item.unit}</small>
                              </span>
                              <ChevronRight size={17} />
                            </button>
                          ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={BookOpen}
                        title="Twoje stawki. Twoje zasady."
                        description="Dodaj kilka najczęstszych usług i materiałów albo zaimportuj CSV. Nie musisz od razu budować pełnego cennika."
                        label="Dodaj pierwszą pozycję"
                        action={() => openPrice()}
                      />
                    ))}
                  {view === "catalog" &&
                    data.catalog.length > 0 &&
                    !data.catalog.some((item) =>
                      normalize(item.name).includes(normalize(search)),
                    ) && (
                      <div className="no-results">Nie znaleziono pozycji.</div>
                    )}
                  {view === "settings" && (
                    <SettingsPanel
                      data={productData!}
                      available={available}
                      webSearch={webSearch}
                      onSave={async (company) => {
                        await commit((current) => ({ ...current, company }));
                      }}
                      onSaveJourney={async (journey) => {
                        await commit((current) => ({ ...current, journey }));
                      }}
                    />
                  )}
                  <p className="module-footnote">
                    <ShieldCheck size={14} />
                    Dane są przypisane do Twojego konta i chronione prywatną sesją.
                  </p>
                </section>
              )}
            </>
          )}
        </main>
      </div>
      <nav className="mobile-navigation" aria-label="Nawigacja telefonu">
        <>
              <button
                className={view === "chat" ? "selected" : ""}
                aria-current={view === "chat" ? "page" : undefined}
                onClick={() => navigate("chat")}
              >
                <MessageCircle size={21} />
                <span>Asystent</span>
              </button>
              <button
                className={view === "settings" ? "selected" : ""}
                aria-current={view === "settings" ? "page" : undefined}
                onClick={() => navigate("settings")}
              >
                <Settings size={21} />
                <span>Ustawienia</span>
              </button>
        </>
      </nav>
      {data && modal?.type === "billing" && (
        <BillingDialog billing={data.billing} onClose={() => setModal(null)} />
      )}
      {data && modal?.type === "quote" && (
        <QuoteEditor
          initialDraft={modal.draft}
          clients={data.clients}
          catalog={data.catalog}
          title={
            data.documents.some((doc) => doc.id === modal.id)
              ? "Edytuj wycenę"
              : "Nowa wycena"
          }
          onClose={() => setModal(null)}
          onApply={(draft) => saveDocument({ kind: "quote", draft }, modal.id)}
        />
      )}
      {data && modal?.type === "report" && (
        <ReportEditor
          initial={modal.report}
          clients={data.clients}
          onClose={() => setModal(null)}
          onSave={(report) =>
            saveDocument({ kind: "report", report }, modal.id)
          }
        />
      )}
      {modal?.type === "client" && (
        <ClientForm
          initial={modal.client}
          onClose={() => setModal(null)}
          onSave={saveClient}
          onDelete={
            data?.clients.some((client) => client.id === modal.client.id)
              ? () => deleteRecord("client", modal.client.id)
              : undefined
          }
          deleteBlocked={
            data?.documents.some(
              (doc) => documentClientId(doc) === modal.client.id,
            )
              ? "Ten klient ma dokumenty w historii. Usunięcie jest zablokowane do czasu ich usunięcia."
              : undefined
          }
        />
      )}
      {modal?.type === "price" && (
        <PriceForm
          initial={modal.item}
          onClose={() => setModal(null)}
          onSave={savePrice}
          onDelete={
            data?.catalog.some((item) => item.id === modal.item.id)
              ? () => deleteRecord("price", modal.item.id)
              : undefined
          }
        />
      )}
      {modal?.type === "team-member" && (
        <TeamMemberForm
          initial={modal.member}
          onClose={() => setModal(null)}
          onSave={saveTeamMember}
          onDelete={
            data?.team.some((member) => member.id === modal.member.id)
              ? () => deleteRecord("team-member", modal.member.id)
              : undefined
          }
        />
      )}
      {data && modal?.type === "import" && (
        <CatalogImport
          catalog={data.catalog}
          onClose={() => setModal(null)}
          onSave={async (items) => {
            await commit((current) => {
              const keys = new Set(current.catalog.map(catalogKey));
              if (items.some((item) => keys.has(catalogKey(item))))
                throw new Error(
                  "Cennik zmienił się od podglądu. Sprawdź import ponownie.",
                );
              return { ...current, catalog: [...current.catalog, ...items] };
            });
            setModal(null);
            setNotice("Dodano " + items.length + " pozycji do cennika.");
          }}
        />
      )}
      {data && selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          company={data.company}
          onClose={() => setModal(null)}
          onEdit={() => editDocument(selectedDocument)}
          onDelete={() => deleteRecord("document", selectedDocument.id)}
        />
      )}
      {selectedClient && (
        <Dialog
          title={selectedClient.name}
          description="Kartoteka klienta i historia zapisanych dokumentów."
          onClose={() => setModal(null)}
          wide
        >
          <div className="client-detail">
            <dl>
              <div>
                <dt>Telefon</dt>
                <dd>{selectedClient.phone || "Nie podano"}</dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>{selectedClient.email || "Nie podano"}</dd>
              </div>
              <div>
                <dt>Adres</dt>
                <dd>{selectedClient.address || "Nie podano"}</dd>
              </div>
            </dl>
            {selectedClient.notes && (
              <p className="client-notes">{selectedClient.notes}</p>
            )}
            <div className="client-detail-actions">
              <button
                className="button button-primary"
                onClick={() => openQuote(undefined, undefined, selectedClient)}
              >
                <Plus size={17} />
                Wycena
              </button>
              <button
                className="button button-secondary"
                onClick={() => openReport(undefined, undefined, selectedClient)}
              >
                <ClipboardCheck size={17} />
                Protokół
              </button>
              <button
                className="text-button"
                onClick={() => openClient(selectedClient)}
              >
                Edytuj dane
                <ArrowRight size={15} />
              </button>
            </div>
            <h3>Historia klienta</h3>
            {clientDocuments.length ? (
              <div className="client-history">
                {clientDocuments.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setModal({ type: "document", id: doc.id })}
                  >
                    <span className="record-icon">
                      {doc.kind === "quote" ? (
                        <FileText size={19} />
                      ) : (
                        <ClipboardCheck size={19} />
                      )}
                    </span>
                    <span>
                      <strong>{documentTitle(doc)}</strong>
                      <small>
                        {dateLabel(doc.updatedAt)} ·{" "}
                        {doc.kind === "quote" ? "Wycena" : "Protokół"}
                      </small>
                    </span>
                    <ChevronRight size={17} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="client-history-empty">
                <FileText size={23} />
                <p>
                  Jeszcze bez dokumentów. Dodaj wycenę lub protokół powyżej.
                </p>
              </div>
            )}
          </div>
        </Dialog>
      )}
      {data && modal?.type === "conversations" && (
        <Dialog
          title="Rozmowy"
          description="Wybierz rozmowę albo rozpocznij nową."
          onClose={() => setModal(null)}
        >
          <div className="conversation-dialog-list">
            <button onClick={() => selectConversation(null)}>
              <span className="conversation-dialog-icon new">
                <Plus size={18} />
              </span>
              <span>
                <strong>Nowa rozmowa</strong>
                <small>Zacznij od pustego czatu</small>
              </span>
              <ChevronRight size={17} />
            </button>
            {data.conversations
              .toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt))
              .map((conversation) => (
                <button
                  key={conversation.id}
                  className={
                    conversation.id === conversationId ? "selected" : ""
                  }
                  onClick={() => selectConversation(conversation.id)}
                >
                  <span className="conversation-dialog-icon">
                    <MessageCircle size={17} />
                  </span>
                  <span>
                    <strong>{conversation.title}</strong>
                    <small>{dateLabel(conversation.updatedAt)}</small>
                  </span>
                  <ChevronRight size={17} />
                </button>
              ))}
          </div>
        </Dialog>
      )}
    </div>
  );
}
