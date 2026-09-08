"use client";

import { useEffect, useState } from "react";
import {
  ChevronRight,
  Gauge,
  LoaderCircle,
  MessageCircle,
  Plus,
  Settings,
  ShieldCheck,
  Target,
  UserRound,
} from "lucide-react";
import { BrandMark } from "./brand";
import { BillingDialog } from "./billing-dialog";
import { ChatPanel } from "./chat-panel";
import { Dialog } from "./dialog";
import { SettingsPanel } from "./settings-panel";
import { useWorkspace } from "./use-workspace";
import { monthlyUsagePercentage, plans } from "@/domain/billing";
import type { Conversation } from "@/domain/workspace";

type View = "chat" | "settings";
type Modal = "conversations" | "billing" | null;
type AiConfiguration = { available: boolean; webSearch: boolean };

export function Home() {
  const { data, error, saving, commit } = useWorkspace();
  const [view, setView] = useState<View>("chat");
  const [modal, setModal] = useState<Modal>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [chatBusy, setChatBusy] = useState(false);
  const [chatInstance, setChatInstance] = useState(0);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [webSearch, setWebSearch] = useState(false);

  function applyAiConfiguration(configuration: AiConfiguration) {
    setAvailable(configuration.available === true);
    setWebSearch(configuration.webSearch === true);
  }

  async function checkConnection() {
    setChecking(true);
    try {
      const response = await fetch("/api/assistant", { cache: "no-store" });
      const configuration = (await response.json()) as AiConfiguration;
      if (response.ok) applyAiConfiguration(configuration);
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
        const configuration = (await response.json()) as AiConfiguration;
        if (response.ok) applyAiConfiguration(configuration);
        else setAvailable(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) setAvailable(false);
      });
    return () => controller.abort();
  }, []);

  function navigate(next: View) {
    setView(next);
    setModal(null);
  }

  function newConversation() {
    setConversationId(null);
    setChatInstance((value) => value + 1);
    navigate("chat");
  }

  function selectConversation(id: string | null) {
    setConversationId(id);
    setChatInstance((value) => value + 1);
    navigate("chat");
  }

  async function saveConversation(
    conversation: Conversation,
    billing: NonNullable<typeof data>["billing"],
    workspaceRevision: number,
  ) {
    await commit((current) => ({
      ...current,
      revision: workspaceRevision,
      conversations: current.conversations.some(
        (item) => item.id === conversation.id,
      )
        ? current.conversations.map((item) =>
            item.id === conversation.id ? conversation : item,
          )
        : [...current.conversations, conversation],
      billing: {
        ...billing,
      },
    }));
    setConversationId(conversation.id);
  }

  const activeConversation = data?.conversations.find(
    (conversation) => conversation.id === conversationId,
  );
  const conversations =
    data?.conversations.toSorted((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt),
    ) ?? [];

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

        {data && (
          <button
            className="goal-summary"
            onClick={() => navigate("settings")}
          >
            <Target size={18} />
            <span>
              <small>TWÓJ CEL</small>
              <strong>{data.journey.goal || "Zbuduj własny przychód"}</strong>
            </span>
            <Settings size={15} />
          </button>
        )}

        <button
          className="new-chat-button"
          disabled={chatBusy}
          onClick={newConversation}
        >
          <Plus size={18} />
          Nowa rozmowa
        </button>

        <p className="nav-label">SMARTFACH</p>
        <nav aria-label="Główna nawigacja">
          <button
            className={view === "chat" ? "selected" : ""}
            aria-current={view === "chat" ? "page" : undefined}
            onClick={() => navigate("chat")}
          >
            <MessageCircle size={19} />
            <span>Asystent</span>
          </button>
        </nav>

        {conversations.length > 0 && (
          <div className="recent-conversations">
            <p className="nav-label">ROZMOWY</p>
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                className={conversation.id === conversationId ? "selected" : ""}
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
              <UserRound size={19} />
            </span>
            <span>
              Twoje konto
              <small>
                {data
                  ? `Plan ${plans[data.billing.plan].name} · preferencje i dane`
                  : "Preferencje i dane"}
              </small>
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
            <h1>{view === "chat" ? "Asystent" : "Twoje konto"}</h1>
          </div>
          <div className="topbar-actions">
            {data && (
              <button
                className="topbar-credits"
                onClick={() => setModal("billing")}
                aria-label={`Wykorzystano ${monthlyUsagePercentage(data.billing)}% miesięcznego limitu`}
              >
                <Gauge size={16} />
                <span>{monthlyUsagePercentage(data.billing)}%</span>
              </button>
            )}
            <span className="local-badge">
              <span />
              {saving ? "Zapisuję…" : "Zapisano"}
            </span>
            {view === "chat" && (
              <>
                {conversations.length > 0 && (
                  <button
                    className="mobile-conversations"
                    disabled={chatBusy}
                    onClick={() => setModal("conversations")}
                    aria-label="Otwórz rozmowy"
                  >
                    <MessageCircle size={20} />
                  </button>
                )}
                <button
                  className="topbar-new-chat"
                  disabled={chatBusy}
                  onClick={newConversation}
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

          {!data ? (
            <div className="loading-workspace">
              <LoaderCircle size={22} />
              <p>
                {error
                  ? "Nie można otworzyć danych konta."
                  : "Otwieram Twojego asystenta…"}
              </p>
            </div>
          ) : view === "chat" ? (
            <div className="chat-view">
              <ChatPanel
                key={chatInstance}
                data={data}
                conversation={activeConversation}
                available={available}
                webSearch={webSearch}
                checking={checking}
                checkConnection={checkConnection}
                onSaveConversation={saveConversation}
                onSettings={() => navigate("settings")}
                onBusy={setChatBusy}
                onOpenBilling={() => setModal("billing")}
              />
            </div>
          ) : (
            <section className="module-view" aria-label="Twoje konto">
              <div className="module-heading">
                <div>
                  <p className="eyebrow">USTAWIENIA I PLAN</p>
                  <h2>Twoje konto</h2>
                  <p>
                    Ustaw sposób działania, kontroluj plan i zarządzaj swoimi danymi.
                  </p>
                </div>
              </div>
              <SettingsPanel
                data={data}
                available={available}
                webSearch={webSearch}
                onOpenBilling={() => setModal("billing")}
                onSaveJourney={async (journey) => {
                  await commit((current) => ({ ...current, journey }));
                }}
              />
              <p className="module-footnote">
                <ShieldCheck size={14} />
                Dane są przypisane do Twojego konta i chronione prywatną sesją.
              </p>
            </section>
          )}
        </main>
      </div>

      <nav className="mobile-navigation" aria-label="Nawigacja telefonu">
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
      </nav>

      {data && modal === "billing" && (
        <BillingDialog billing={data.billing} onClose={() => setModal(null)} />
      )}

      {modal === "conversations" && (
        <Dialog
          title="Rozmowy"
          description="Wybierz rozmowę albo rozpocznij nową."
          onClose={() => setModal(null)}
        >
          <div className="conversation-dialog-list">
            <button onClick={newConversation}>
              <span className="conversation-dialog-icon new">
                <Plus size={18} />
              </span>
              <span>
                <strong>Nowa rozmowa</strong>
                <small>Zacznij od aktualnej sytuacji</small>
              </span>
              <ChevronRight size={17} />
            </button>
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                className={conversation.id === conversationId ? "selected" : ""}
                onClick={() => selectConversation(conversation.id)}
              >
                <span className="conversation-dialog-icon">
                  <MessageCircle size={17} />
                </span>
                <span>
                  <strong>{conversation.title}</strong>
                  <small>
                    {new Date(conversation.updatedAt).toLocaleDateString("pl-PL")}
                  </small>
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
