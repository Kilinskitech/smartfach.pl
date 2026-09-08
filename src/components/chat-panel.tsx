"use client";
import { useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowLeft,
  ArrowUp,
  Sparkles,
  ArrowRight,
  Clock3,
  LoaderCircle,
  RefreshCw,
  ImagePlus,
  MessageCircle,
  Rocket,
  TrendingUp,
  Wallet,
  X,
  Compass,
  Laptop,
  MapPin,
  Ban,
} from "lucide-react";
import { BrandMark } from "./brand";
import type { Conversation, Workspace } from "@/domain/workspace";
import type { AssistantAttachment, AssistantResult, GuidedStart } from "@/domain/assistant";
import { estimateRequestCredits, remainingCredits } from "@/domain/billing";
import { completeJourneyOnboarding } from "@/domain/journey";

type PendingAttachment = AssistantAttachment & {
  id: string;
  size: number;
  preview?: string;
};
type StartBoundary = "phone" | "camera" | "budget";
type StartPriority = "fast" | "low_cost" | "after_hours" | "full_income";
type StartMode = "guided" | "tasks" | "question" | "result";
type TaskStart = "clients" | "offer" | "plan";
type SendOptions = {
  text?: string;
  displayText?: string;
  mode?: "chat" | "guided_start";
  guidedStart?: GuidedStart;
  title?: string;
};
const acceptedImages = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const readDataUrl = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Nie udało się odczytać pliku."));
    reader.readAsDataURL(file);
  });

type Props = {
  data: Workspace;
  conversation: Conversation | undefined;
  available: boolean | null;
  webSearch: boolean;
  checking: boolean;
  checkConnection: () => void;
  onSaveConversation: (
    conversation: Conversation,
    billing: Workspace["billing"],
    workspaceRevision: number,
  ) => Promise<void>;
  onSaveJourney: (journey: Workspace["journey"]) => Promise<void>;
  onSettings: () => void;
  onBusy: (busy: boolean) => void;
  onOpenBilling: () => void;
};
export function ChatPanel({
  data,
  conversation,
  available,
  webSearch,
  checking,
  checkConnection,
  onSaveConversation,
  onSaveJourney,
  onSettings,
  onBusy,
  onOpenBilling,
}: Props) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const lastMessage = useRef<HTMLDivElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const pendingRequest = useRef<{ payload: string; key: string; conversationId: string } | null>(null);
  const messages = conversation?.messages ?? [];
  const creditsLeft = remainingCredits(data.billing);
  const requestCost = estimateRequestCredits(attachments);
  const creditExhausted = creditsLeft < requestCost;
  const profileHasMeaningfulData = Boolean(
    data.journey.focus.trim() ||
      data.journey.goal.trim() ||
      data.journey.weeklyHours.trim() ||
      data.journey.experience.trim() ||
      data.journey.constraints.trim() ||
      data.journey.workStyle !== "open",
  );
  const onboardingCompleted =
    data.journey.onboardingCompleted || profileHasMeaningfulData;
  const [startStyle, setStartStyle] = useState<"remote" | "local" | "open">(
    data.journey.workStyle === "remote" || data.journey.workStyle === "local"
      ? data.journey.workStyle
      : "open",
  );
  const [startSituation, setStartSituation] = useState<"unknown" | "idea" | "skills">("unknown");
  const [startPriorities, setStartPriorities] = useState<StartPriority[]>([]);
  const [startBoundaries, setStartBoundaries] = useState<StartBoundary[]>([]);
  const [customBoundary, setCustomBoundary] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [startMode, setStartMode] = useState<StartMode>(
    onboardingCompleted ? "tasks" : "guided",
  );
  const [profileBusy, setProfileBusy] = useState(false);
  function toggleBoundary(boundary: StartBoundary) {
    setStartBoundaries((current) =>
      current.includes(boundary)
        ? current.filter((item) => item !== boundary)
        : [...current, boundary],
    );
  }
  function togglePriority(priority: StartPriority) {
    setStartPriorities((current) =>
      current.includes(priority)
        ? current.filter((item) => item !== priority)
        : [...current, priority],
    );
  }
  async function preparePersonalStart() {
    if (busy || profileBusy || !available || creditExhausted) return;
    const guidedStart: GuidedStart = {
      workStyle: startStyle,
      situation: startSituation,
      priorities: startPriorities,
      boundaries: startBoundaries,
      customBoundary: customBoundary.trim(),
      additionalInfo: additionalInfo.trim(),
    };
    const workStyle = {
      remote: "chcę pracować zdalnie",
      local: "wolę działać lokalnie",
      open: "jestem otwarty na pracę zdalną albo lokalną",
    }[startStyle];
    const situation = {
      unknown: "nie wiem jeszcze, co mogę sprzedawać",
      idea: "mam już wstępny pomysł, ale chcę go sprawdzić",
      skills: "chcę zacząć od tego, co już umiem",
    }[startSituation];
    const boundaryLabels: Record<StartBoundary, string> = {
      phone: "sprzedaży telefonicznej",
      camera: "pokazywania twarzy i nagrywania filmów",
      budget: "dużych wydatków na start",
    };
    const selectedBoundaries = startBoundaries.map(
      (boundary) => boundaryLabels[boundary],
    );
    if (customBoundary.trim()) selectedBoundaries.push(customBoundary.trim());
    const priorityLabels: Record<StartPriority, string> = {
      fast: "szybko przejść do pierwszego testu",
      low_cost: "zacząć małym kosztem",
      after_hours: "działać po godzinach",
      full_income: "docelowo utrzymywać się z własnego biznesu",
    };
    const selectedPriorities = startPriorities.map(
      (priority) => priorityLabels[priority],
    );
    const details = [
      `Preferencja pracy: ${workStyle}.`,
      `Punkt startu: ${situation}.`,
      selectedPriorities.length
        ? `Najważniejsze: ${selectedPriorities.join(", ")}.`
        : "Nie wskazuję jeszcze dodatkowego priorytetu.",
      selectedBoundaries.length
        ? `Chcę uniknąć: ${selectedBoundaries.join(", ")}.`
        : "Nie wskazuję dodatkowych ograniczeń.",
      additionalInfo.trim()
        ? `Dodatkowe informacje: ${additionalInfo.trim()}`
        : "",
    ]
      .filter(Boolean)
      .join(" ");
    setProfileBusy(true);
    onBusy(true);
    setError("");
    try {
      await onSaveJourney(
        completeJourneyOnboarding(data.journey, guidedStart),
      );
      await send({
        text: details,
        displayText: "Zaczynamy — przygotuj mój pierwszy kierunek działania",
        mode: "guided_start",
        guidedStart,
        title: "Mój pierwszy kierunek",
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Nie zapisano profilu. Spróbuj ponownie.",
      );
    } finally {
      setProfileBusy(false);
      onBusy(false);
    }
  }
  function openQuestion(mode: "question" | "result") {
    setStartMode(mode);
    setError("");
    requestAnimationFrame(() => textarea.current?.focus());
  }
  function startTask(task: TaskStart) {
    const tasks: Record<
      TaskStart,
      { text: string; displayText: string; title: string }
    > = {
      clients: {
        text: "Pomóż mi wybrać najlepszy sposób dotarcia do pierwszych klientów dla usługi dopasowanej do mojego profilu. Uwzględnij mój aktualny etap i zakończ jednym działaniem do wykonania dzisiaj.",
        displayText: "Chcę znaleźć klientów",
        title: "Jak znaleźć klientów",
      },
      offer: {
        text: "Pomóż mi dopracować ofertę usługi na podstawie mojego profilu i aktualnego kierunku. Zacznij od najważniejszej decyzji, którą możemy podjąć teraz, i przygotuj konkretną propozycję.",
        displayText: "Chcę dopracować ofertę",
        title: "Dopracowanie oferty",
      },
      plan: {
        text: "Ułóż mi konkretny plan najbliższych działań na podstawie mojego profilu, celu i dostępnego czasu. Zacznij od zadania, które mam wykonać jako pierwsze.",
        displayText: "Chcę zaplanować działania",
        title: "Plan najbliższych działań",
      },
    };
    void send({ ...tasks[task], mode: "chat" });
  }
  async function addImage(file: File | undefined) {
    if (!file) return;
    if (!acceptedImages.has(file.type)) {
      setError("Dodaj zdjęcie JPG, PNG, WEBP albo GIF.");
      return;
    }
    if (file.size > 5_500_000) {
      setError("Zdjęcie jest za duże. Maksymalny rozmiar to 5,5 MB.");
      return;
    }
    if (attachments.length >= 3) {
      setError("Do jednej wiadomości możesz dodać maksymalnie 3 pliki.");
      return;
    }
    try {
      const preview = await readDataUrl(file);
      const data = preview.split(",")[1] ?? "";
      const total = attachments.reduce(
        (sum, item) => sum + item.data.length,
        0,
      );
      if (total + data.length > 10_000_000)
        throw new Error("Łączny rozmiar załączników jest za duży.");
      setAttachments((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          kind: "image",
          name: file.name,
          mediaType: file.type as AssistantAttachment["mediaType"],
          data,
          preview,
          size: file.size,
        },
      ]);
      setError("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Nie udało się dodać zdjęcia.",
      );
    } finally {
      if (imageInput.current) imageInput.current.value = "";
    }
  }
  async function send(options: SendOptions = {}) {
    const typedText = (options.text ?? input).trim();
    const text =
      typedText ||
      "Przeanalizuj dodane zdjęcie i odpowiedz na moje pytanie.";
    if (
      (!typedText && !attachments.length) ||
      busy ||
      !available ||
      creditExhausted
    )
      return;
    if (messages.length >= 58) {
      setError(
        "Ta rozmowa osiągnęła limit długości. Rozpocznij nową rozmowę; historia pozostanie zapisana.",
      );
      return;
    }
    if (!conversation && data.conversations.length >= 30) {
      setError(
        "Osiągnięto limit 30 rozmów. Wybierz wcześniejszą rozmowę z historii.",
      );
      return;
    }
    setBusy(true);
    onBusy(true);
    setError("");
    try {
      const payload = JSON.stringify({
          mode: options.mode ?? "chat",
          ...(options.guidedStart ? { guidedStart: options.guidedStart } : {}),
          messages: [
            ...messages
              .slice(-11)
              .map(({ role, content }) => ({ role, content })),
            { role: "user", content: text },
          ],
          conversationId: conversation?.id ?? null,
          clientId: null,
          attachments: attachments.map(({ kind, name, mediaType, data }) => ({
            kind,
            name,
            mediaType,
            data,
          })),
        });
      if (pendingRequest.current?.payload !== payload) {
        pendingRequest.current = { payload, key: crypto.randomUUID(), conversationId: conversation?.id ?? crypto.randomUUID() };
      }
      const attempt = pendingRequest.current;
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...JSON.parse(payload), idempotencyKey: attempt.key }),
        signal: AbortSignal.timeout(55_000),
      });
      const result: AssistantResult & { error?: string; code?: string } =
        await response.json();
      if (!response.ok) {
        if (["failed", "expired", "conflict", "provider_failed"].includes(result.code ?? "")) pendingRequest.current = null;
        if (result.code === "credit_limit") onOpenBilling();
        throw new Error(result.error ?? "Asystent nie odpowiedział.");
      }
      if (typeof result.reply !== "string")
        throw new Error("Odpowiedź nie została poprawnie odczytana.");
      const id = attempt.conversationId;
      const updated: Conversation = {
        id,
        title: conversation?.title ?? options.title ?? text.slice(0, 70),
        updatedAt: new Date().toISOString(),
        messages: [
          ...messages,
          {
            id: crypto.randomUUID(),
            role: "user",
            content: [
              options.displayText ?? typedText,
              ...attachments.map((item) => `📷 ${item.name}`),
            ]
              .filter(Boolean)
              .join("\n"),
          },
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: result.reply,
            model: result.model,
            usage: result.usage,
            sources: result.sources?.length ? result.sources : undefined,
          },
        ],
      };
      await onSaveConversation(
        updated,
        result.billing,
        result.workspaceRevision,
      );
      pendingRequest.current = null;
      if (!options.text) setInput("");
      setAttachments([]);
      requestAnimationFrame(() =>
        lastMessage.current?.scrollIntoView({ block: "nearest" }),
      );
    } catch (error) {
      setError(
        error instanceof Error && error.name !== "TimeoutError"
          ? error.message
          : "AI nie odpowiedziało w czasie. Treść pozostaje w polu — możesz spróbować ponownie.",
      );
    } finally {
      setBusy(false);
      onBusy(false);
    }
  }
  function keydown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing &&
      available &&
      !creditExhausted &&
      !busy &&
      (input.trim() || attachments.length > 0)
    ) {
      event.preventDefault();
      void send();
    }
  }
  return (
    <div className={"chat-panel" + (!messages.length ? " chat-empty" : "")}>
      {messages.length === 0 ? (
        <div className="chat-welcome">
          <div className="welcome-mark">
            <BrandMark size={58} />
            <span className="welcome-dot">
              <Sparkles size={13} />
            </span>
          </div>
          {startMode === "guided" ? (
            <>
              <p className="eyebrow">SMARTFACH ZACZYNA DZIAŁAĆ</p>
              <h2>Powiedz, jak chcesz pracować.</h2>
              <p className="welcome-copy">
                Zaznacz odpowiedzi najbliższe Twojej sytuacji. Po zatwierdzeniu
                SmartFach wybierze kierunek i od razu przeprowadzi Cię do
                pierwszego konkretnego działania.
              </p>
              <form
                className="start-profile"
                aria-label="Rozpoczęcie pracy ze SmartFach"
                onSubmit={(event) => {
                  event.preventDefault();
                  void preparePersonalStart();
                }}
              >
                <fieldset>
                  <legend>Gdzie chcesz pracować?</legend>
                  <div>
                    <button type="button" aria-pressed={startStyle === "remote"} className={startStyle === "remote" ? "selected" : ""} onClick={() => setStartStyle("remote")}><Laptop size={17} /> Zdalnie</button>
                    <button type="button" aria-pressed={startStyle === "local"} className={startStyle === "local" ? "selected" : ""} onClick={() => setStartStyle("local")}><MapPin size={17} /> Lokalnie</button>
                    <button type="button" aria-pressed={startStyle === "open"} className={startStyle === "open" ? "selected" : ""} onClick={() => setStartStyle("open")}><Compass size={17} /> Bez znaczenia</button>
                  </div>
                </fieldset>
                <fieldset>
                  <legend>Od czego zaczynasz?</legend>
                  <div>
                    <button type="button" aria-pressed={startSituation === "unknown"} className={startSituation === "unknown" ? "selected" : ""} onClick={() => setStartSituation("unknown")}>Nie wiem, co sprzedawać</button>
                    <button type="button" aria-pressed={startSituation === "skills"} className={startSituation === "skills" ? "selected" : ""} onClick={() => setStartSituation("skills")}>Mam umiejętności</button>
                    <button type="button" aria-pressed={startSituation === "idea"} className={startSituation === "idea" ? "selected" : ""} onClick={() => setStartSituation("idea")}>Mam pomysł</button>
                  </div>
                </fieldset>
                <fieldset className="start-profile-wide">
                  <legend>Co jest dla Ciebie ważne? Możesz wybrać kilka.</legend>
                  <div className="start-profile-options start-priority-options">
                    <button type="button" aria-pressed={startPriorities.includes("fast")} className={startPriorities.includes("fast") ? "selected" : ""} onClick={() => togglePriority("fast")}><Rocket size={16} /> Szybko zacząć</button>
                    <button type="button" aria-pressed={startPriorities.includes("low_cost")} className={startPriorities.includes("low_cost") ? "selected" : ""} onClick={() => togglePriority("low_cost")}><Wallet size={16} /> Mały koszt startu</button>
                    <button type="button" aria-pressed={startPriorities.includes("after_hours")} className={startPriorities.includes("after_hours") ? "selected" : ""} onClick={() => togglePriority("after_hours")}><Clock3 size={16} /> Działanie po godzinach</button>
                    <button type="button" aria-pressed={startPriorities.includes("full_income")} className={startPriorities.includes("full_income") ? "selected" : ""} onClick={() => togglePriority("full_income")}><TrendingUp size={16} /> Docelowo pełny dochód</button>
                  </div>
                </fieldset>
                <fieldset className="start-profile-wide">
                  <legend>Czego chcesz uniknąć? Możesz wybrać kilka.</legend>
                  <div className="start-profile-options">
                    <button type="button" aria-pressed={startBoundaries.includes("phone")} className={startBoundaries.includes("phone") ? "selected" : ""} onClick={() => toggleBoundary("phone")}><Ban size={16} /> Telefonów</button>
                    <button type="button" aria-pressed={startBoundaries.includes("camera")} className={startBoundaries.includes("camera") ? "selected" : ""} onClick={() => toggleBoundary("camera")}><Ban size={16} /> Pokazywania twarzy</button>
                    <button type="button" aria-pressed={startBoundaries.includes("budget")} className={startBoundaries.includes("budget") ? "selected" : ""} onClick={() => toggleBoundary("budget")}><Ban size={16} /> Dużych wydatków</button>
                  </div>
                  <label className="start-profile-custom" htmlFor="start-custom-boundary">
                    <span>Inne ograniczenie</span>
                    <input id="start-custom-boundary" value={customBoundary} onChange={(event) => setCustomBoundary(event.target.value)} maxLength={180} placeholder="np. dojazdy, praca wieczorami, social media" />
                  </label>
                </fieldset>
                <fieldset className="start-profile-wide start-additional-info">
                  <legend>Dodatkowe informacje — opcjonalnie</legend>
                  <textarea
                    value={additionalInfo}
                    onChange={(event) => setAdditionalInfo(event.target.value)}
                    maxLength={600}
                    rows={3}
                    placeholder="Napisz, co umiesz, ile masz czasu, jaki masz budżet albo jaki pomysł chodzi Ci po głowie."
                  />
                </fieldset>
                {error && <div className="chat-error start-profile-wide" role="alert">{error}</div>}
                <div className="start-profile-actions">
                  <button className="start-profile-submit" type="submit" disabled={busy || profileBusy || !available || creditExhausted}>
                    {busy || profileBusy ? <><LoaderCircle size={17} /> SmartFach zaczyna…</> : <>Przejdź do działania <ArrowRight size={17} /></>}
                  </button>
                  <button
                    className="start-question-button"
                    type="button"
                    disabled={busy || profileBusy}
                    onClick={() => openQuestion("question")}
                  >
                    <MessageCircle size={17} /> Chcę tylko zadać pytanie
                  </button>
                </div>
              </form>
            </>
          ) : startMode === "tasks" ? (
            <>
              <p className="eyebrow">CO ROBIMY TERAZ?</p>
              <h2>Nad czym chcesz teraz pracować?</h2>
              <p className="welcome-copy">
                SmartFach pamięta Twój profil. Wybierz aktualne zadanie, a od
                razu przejdzie do konkretnego działania.
              </p>
              <div className="task-start-grid" aria-label="Wybierz zadanie">
                <button type="button" disabled={busy || !available || creditExhausted} onClick={() => startTask("clients")}>
                  <span><Compass size={20} /></span>
                  <strong>Znajdź klientów</strong>
                  <small>Wybierz kanał dotarcia i wykonaj pierwszy krok</small>
                  <ArrowRight size={17} />
                </button>
                <button type="button" disabled={busy || !available || creditExhausted} onClick={() => startTask("offer")}>
                  <span><Sparkles size={20} /></span>
                  <strong>Dopracuj ofertę</strong>
                  <small>Ułóż usługę, wartość, zakres i cenę testową</small>
                  <ArrowRight size={17} />
                </button>
                <button type="button" disabled={busy || !available || creditExhausted} onClick={() => startTask("plan")}>
                  <span><Clock3 size={20} /></span>
                  <strong>Zaplanuj działania</strong>
                  <small>Zamień cel i dostępny czas w konkretny plan</small>
                  <ArrowRight size={17} />
                </button>
                <button type="button" disabled={busy || !available || creditExhausted} onClick={() => openQuestion("result")}>
                  <span><TrendingUp size={20} /></span>
                  <strong>Przeanalizuj wynik</strong>
                  <small>Opisz, co się wydarzyło, i wybierz kolejny ruch</small>
                  <ArrowRight size={17} />
                </button>
              </div>
              {busy && <p className="task-start-working"><LoaderCircle size={17} /> SmartFach rozpoczyna działanie…</p>}
              {error && <div className="chat-error task-start-error" role="alert">{error}</div>}
              {creditExhausted && (
                <button className="task-start-billing" type="button" onClick={onOpenBilling}>
                  Zwiększ limit, aby kontynuować
                </button>
              )}
              <button className="start-question-button task-own-question" type="button" disabled={busy} onClick={() => openQuestion("question")}>
                <MessageCircle size={17} /> Zadaj własne pytanie
              </button>
            </>
          ) : (
            <>
              <p className="eyebrow">{startMode === "result" ? "SPRAWDŹMY, CO ZADZIAŁAŁO" : "ZAPYTAJ SMARTFACH"}</p>
              <h2>{startMode === "result" ? "Co się wydarzyło?" : "O co chcesz zapytać?"}</h2>
              <p className="welcome-copy">
                {startMode === "result"
                  ? "Opisz wykonane działanie, odpowiedź klienta albo wynik testu. SmartFach pomoże wyciągnąć wnioski i wybrać kolejny krok."
                  : "Możesz poprosić o wyjaśnienie, analizę pomysłu, przygotowanie treści albo dodać zdjęcie."}
              </p>
              <button className="start-back-button" type="button" onClick={() => setStartMode(onboardingCompleted ? "tasks" : "guided")}>
                <ArrowLeft size={16} /> {onboardingCompleted ? "Wróć do wyboru zadania" : "Wróć do rozpoczęcia działania"}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="chat-messages" aria-label="Historia rozmowy">
          {messages.map((message) => (
            <article
              className={"chat-message " + message.role}
              key={message.id}
            >
              {message.role === "assistant" && <BrandMark size={30} />}
              <div>
                <span className="message-author">
                  {message.role === "user" ? "Ty" : "SmartFach"}
                </span>
                <p>{message.content}</p>
                {message.role === "assistant" &&
                  message.sources &&
                  message.sources.length > 0 && (
                    <div className="message-sources" aria-label="Źródła internetowe">
                      <span>Źródła</span>
                      <div>
                        {message.sources.map((source) => (
                          <a
                            href={source.url}
                            key={source.url}
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            {source.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </article>
          ))}
          <div ref={lastMessage} />
        </div>
      )}
      {(messages.length > 0 || startMode === "question" || startMode === "result") && <div className="composer-area">
        {creditExhausted && (
          <div className="credit-limit-banner" role="alert">
            <Sparkles size={18} />
            <span>
              <strong>Limit Twojego planu został wykorzystany.</strong>
              Możesz zwiększyć go jednorazowo i od razu pracować dalej.
            </span>
            <button type="button" onClick={onOpenBilling}>Zwiększ limit</button>
          </div>
        )}
        {error && (
          <div className="chat-error" role="alert">
            {error}
          </div>
        )}
        {busy && (
          <p className="assistant-working" role="status">
            <LoaderCircle size={17} />
            SmartFach przygotowuje odpowiedź…
          </p>
        )}
        <form
          className="composer"
          onSubmit={(event) => {
            event.preventDefault();
            void send();
          }}
        >
          <label className="sr-only" htmlFor="chat-input">
            Wiadomość do SmartFach
          </label>
          <textarea
            id="chat-input"
            ref={textarea}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={keydown}
            maxLength={6000}
            rows={3}
            placeholder={startMode === "result" && messages.length === 0 ? "Opisz wykonane działanie i jego wynik…" : "Napisz wiadomość albo dodaj zdjęcie…"}
            disabled={busy}
          />
          {attachments.length > 0 && (
            <div className="attachment-tray" aria-label="Dodane pliki">
              {attachments.map((attachment) => (
                <div className="attachment-chip" key={attachment.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={attachment.preview} alt="" />
                  <span>
                    <strong>{attachment.name}</strong>
                    <small>
                      {Math.max(1, Math.round(attachment.size / 1024))} KB
                    </small>
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      setAttachments((current) =>
                        current.filter((item) => item.id !== attachment.id),
                      )
                    }
                    aria-label={`Usuń ${attachment.name}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="composer-bottom">
            <div className="composer-tools">
              <input
                ref={imageInput}
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) => void addImage(event.target.files?.[0])}
              />
              <button
                type="button"
                disabled={busy || attachments.length >= 3}
                onClick={() => imageInput.current?.click()}
                aria-label="Dodaj zdjęcie"
              >
                <ImagePlus size={20} />
                <span>Zdjęcie</span>
              </button>
            </div>
            <button
              className="send-button"
              disabled={
                !available ||
                creditExhausted ||
                busy ||
                (!input.trim() && attachments.length === 0)
              }
              aria-label="Wyślij wiadomość"
            >
              <ArrowUp size={22} />
            </button>
          </div>
        </form>
        <div className="composer-note">
          {available ? (
            <>
              <span className="connection-dot" />
              Asystent gotowy.
              {webSearch ? " Internet dostępny." : ""}
              Odpowiedź zawsze sprawdź.
            </>
          ) : (
            <>
              <span className="connection-dot offline" />
              {available === null
                ? "Sprawdzam połączenie…"
                : "AI czeka na podłączenie. Narzędzia ręczne działają."}
            </>
          )}
          <span className="keyboard-hint">Enter ↵</span>
        </div>
        {!available && available !== null && (
          <>
            <div className="connection-help">
              <button onClick={onSettings}>
                Jak podłączyć AI
                <ArrowRight size={14} />
              </button>
              <button disabled={checking} onClick={checkConnection}>
                <RefreshCw size={14} />
                {checking ? "Sprawdzanie…" : "Sprawdź połączenie"}
              </button>
            </div>
          </>
        )}
      </div>}
    </div>
  );
}
