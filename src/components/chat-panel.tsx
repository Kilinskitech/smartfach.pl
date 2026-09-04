"use client";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowUp,
  FileText,
  ClipboardCheck,
  MessageCircle,
  Sparkles,
  ArrowRight,
  LoaderCircle,
  RefreshCw,
  ImagePlus,
  Mic,
  Square,
  X,
  AudioLines,
  TrendingUp,
  Compass,
  Rocket,
  Target,
} from "lucide-react";
import { BrandMark } from "./brand";
import type { Conversation, Workspace, VisitReport } from "@/domain/workspace";
import type { QuoteDraft } from "@/domain/quotes/draft";
import type { AssistantAttachment, AssistantResult } from "@/domain/assistant";
import { estimateRequestCredits, remainingCredits } from "@/domain/billing";

type PendingAttachment = AssistantAttachment & {
  id: string;
  size: number;
  preview?: string;
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
    creditsUsed?: number,
  ) => Promise<void>;
  onNewQuote: (draft?: QuoteDraft, id?: string) => void;
  onNewReport: (report?: VisitReport, id?: string) => void;
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
  onNewQuote,
  onNewReport,
  onSettings,
  onBusy,
  onOpenBilling,
}: Props) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const lastMessage = useRef<HTMLDivElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const recordingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const messages = conversation?.messages ?? [];
  const activeProposal = conversation?.pendingDocument;
  const creditsLeft = remainingCredits(data.billing);
  const requestCost = estimateRequestCredits(attachments);
  const creditExhausted = creditsLeft < requestCost;
  useEffect(
    () => () => {
      if (recordingTimer.current) clearInterval(recordingTimer.current);
      mediaStream.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );
  function startTask(text: string) {
    setInput(text);
    requestAnimationFrame(() => {
      textarea.current?.focus();
      textarea.current?.setSelectionRange(text.length, text.length);
    });
  }
  function clientMemory(name: string, clientId?: string) {
    const known = clientId
      ? data.clients.find((client) => client.id === clientId)
      : undefined;
    if (known) return "Klient z pamięci firmy: " + known.name;
    if (name.trim())
      return (
        "Nowy klient: " +
        name.trim() +
        ". Karta powstanie dopiero po zapisie dokumentu."
      );
    return "Brakuje klienta — uzupełnisz go przed zapisem.";
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
  function stopRecording() {
    if (mediaRecorder.current?.state === "recording")
      mediaRecorder.current.stop();
  }
  async function startRecording() {
    if (recording || busy) return;
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError("Ta przeglądarka nie obsługuje nagrywania głosu.");
      return;
    }
    if (attachments.length >= 3) {
      setError("Do jednej wiadomości możesz dodać maksymalnie 3 pliki.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferred = [
        "audio/webm;codecs=opus",
        "audio/mp4",
        "audio/ogg;codecs=opus",
      ].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(
        stream,
        preferred ? { mimeType: preferred } : undefined,
      );
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onstop = async () => {
        if (recordingTimer.current) clearInterval(recordingTimer.current);
        recordingTimer.current = null;
        stream.getTracks().forEach((track) => track.stop());
        mediaStream.current = null;
        mediaRecorder.current = null;
        setRecording(false);
        const mime = recorder.mimeType.split(";")[0] || "audio/webm";
        const blob = new Blob(chunks, { type: mime });
        if (!blob.size) {
          setError("Nie udało się nagrać głosu. Spróbuj ponownie.");
          return;
        }
        if (blob.size > 6_000_000) {
          setError("Nagranie jest za duże. Nagraj krótszą wiadomość.");
          return;
        }
        try {
          const dataUrl = await readDataUrl(blob);
          const data = dataUrl.split(",")[1] ?? "";
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
              kind: "audio",
              name: "Notatka głosowa",
              mediaType: mime as AssistantAttachment["mediaType"],
              data,
              size: blob.size,
            },
          ]);
          setError("");
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Nie udało się dodać nagrania.",
          );
        }
      };
      mediaStream.current = stream;
      mediaRecorder.current = recorder;
      setRecordingSeconds(0);
      setRecording(true);
      setError("");
      recorder.start(500);
      recordingTimer.current = setInterval(() => {
        setRecordingSeconds((seconds) => {
          if (seconds >= 59) {
            stopRecording();
            return 60;
          }
          return seconds + 1;
        });
      }, 1000);
    } catch {
      setError(
        "Nie udało się uruchomić mikrofonu. Sprawdź zgodę przeglądarki.",
      );
    }
  }
  async function send() {
    const typedText = input.trim();
    const text =
      typedText ||
      (attachments.some((item) => item.kind === "audio")
        ? "Przeanalizuj tę notatkę głosową i wykonaj wynikające z niej zadanie."
        : "Przeanalizuj dodane zdjęcie i odpowiedz na moje pytanie.");
    if (
      (!typedText && !attachments.length) ||
      busy ||
      !available ||
      recording ||
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
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        }),
        signal: AbortSignal.timeout(55_000),
      });
      const result: AssistantResult & { error?: string; code?: string } =
        await response.json();
      if (!response.ok) {
        if (result.code === "credit_limit") onOpenBilling();
        throw new Error(result.error ?? "Asystent nie odpowiedział.");
      }
      if (typeof result.reply !== "string")
        throw new Error("Odpowiedź nie została poprawnie odczytana.");
      const id = conversation?.id ?? crypto.randomUUID();
      const pendingDocument =
        result.quote || result.report
          ? {
              id: crypto.randomUUID(),
              quote: result.quote,
              report: result.report,
            }
          : conversation?.pendingDocument;
      const updated: Conversation = {
        id,
        title: conversation?.title ?? text.slice(0, 70),
        updatedAt: new Date().toISOString(),
        mode: conversation?.mode ?? data.journey.mode,
        messages: [
          ...messages,
          {
            id: crypto.randomUUID(),
            role: "user",
            content: [
              typedText,
              ...attachments.map((item) =>
                item.kind === "image"
                  ? `📷 ${item.name}`
                  : "🎙️ Notatka głosowa",
              ),
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
        pendingDocument,
      };
      await onSaveConversation(updated, result.creditsUsed ?? requestCost);
      setInput("");
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
          {data.journey.mode === "discover" ? (
            <>
              <p className="eyebrow">OD CELU DO KOLEJNYCH DZIAŁAŃ</p>
              <h2>Rozwijaj kierunek na podstawie tego, co działa</h2>
              <p className="welcome-copy">
                Ustal cel, wykonaj test i wróć z wynikiem. Kolejne decyzje
                wykorzystają zapisany kontekst — nie zaczynasz od zera.
              </p>
              <div className="chat-shortcuts">
                <button onClick={() => startTask("Pomóż mi znaleźć pomysł na biznes. Zacznij od pytań o moją sytuację.")}>
                  <Compass size={18} /> Znajdź kierunek
                </button>
                <button onClick={() => startTask("Pomóż mi sprawdzić ten pomysł na biznes: ")}>
                  <Target size={18} /> Sprawdź mój pomysł
                </button>
                <button onClick={() => startTask("Ułóż najmniejszy test rynku dla pomysłu: ")}>
                  <Rocket size={18} /> Zaplanuj test rynku
                </button>
                <button onClick={() => startTask("Porównaj dla mnie te kierunki biznesowe: ")}>
                  <TrendingUp size={18} /> Porównaj możliwości
                </button>
              </div>
            </>
          ) : data.journey.mode === "launch" ? (
            <>
              <p className="eyebrow">OD POMYSŁU DO REGULARNEGO DZIAŁANIA</p>
              <h2>Testuj ofertę i planuj następny krok</h2>
              <p className="welcome-copy">
                Ustal, co sprzedajesz, wykonaj działanie i wróć z odpowiedzią
                rynku. SmartFach pomoże dostosować kolejne zadanie.
              </p>
              <div className="chat-shortcuts">
                <button onClick={() => startTask("Pomóż mi zbudować prostą ofertę dla biznesu: ")}>
                  <Rocket size={18} /> Zbuduj ofertę
                </button>
                <button onClick={() => startTask("Pomóż mi określić pierwszego klienta dla: ")}>
                  <Target size={18} /> Określ klienta
                </button>
                <button onClick={() => startTask("Ułóż plan zdobycia pierwszych 10 rozmów sprzedażowych dla: ")}>
                  <TrendingUp size={18} /> Znajdź pierwsze rozmowy
                </button>
                <button onClick={() => startTask("Pomóż mi ustalić podstawy cennika dla: ")}>
                  <FileText size={18} /> Ustal podstawy ceny
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="eyebrow">TWÓJ ASYSTENT DO PRACY</p>
              <h2>Powiedz, co trzeba zrobić</h2>
              <p className="welcome-copy">
                Jedna wiadomość wystarczy. SmartFach przygotuje rezultat, a Ty
                tylko go sprawdzisz.
              </p>
              <div className="chat-shortcuts">
                <button onClick={() => startTask("Przygotuj wycenę: ")}>
                  <FileText size={18} /> Stwórz wycenę
                </button>
                <button onClick={() => startTask("Przygotuj protokół z wizyty: ")}>
                  <ClipboardCheck size={18} /> Stwórz protokół z wizyty
                </button>
                <button onClick={() => startTask("Stwórz wiadomość do klienta: ")}>
                  <MessageCircle size={18} /> Stwórz wiadomość do klienta
                </button>
                <button onClick={() => startTask("Pomóż mi w marketingu lub rozwoju firmy: ")}>
                  <TrendingUp size={18} /> Marketing i rozwój firmy
                </button>
              </div>
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
          {activeProposal?.quote && (
            <div className="proposal-card">
              <span className="proposal-icon">
                <FileText size={23} />
              </span>
              <div>
                <span>Szkic wyceny · do sprawdzenia</span>
                <strong>{activeProposal.quote.subject || "Nowa wycena"}</strong>
                <p className="proposal-memory">
                  {clientMemory(
                    activeProposal.quote.client,
                    activeProposal.quote.clientId,
                  )}
                </p>
                <p>
                  Sprawdź ceny i wybierz VAT. Nic nie zapisze się bez
                  potwierdzenia.
                </p>
                <button
                  onClick={() =>
                    onNewQuote(activeProposal.quote!, activeProposal.id)
                  }
                >
                  Sprawdź i zapisz
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          )}
          {activeProposal?.report && (
            <div className="proposal-card">
              <span className="proposal-icon">
                <ClipboardCheck size={23} />
              </span>
              <div>
                <span>Szkic protokołu · do sprawdzenia</span>
                <strong>
                  {activeProposal.report.subject || "Protokół wizyty"}
                </strong>
                <p className="proposal-memory">
                  {clientMemory(
                    activeProposal.report.client,
                    activeProposal.report.clientId,
                  )}
                </p>
                <p>Sprawdź czynności i pomiary przed zapisem.</p>
                <button
                  onClick={() =>
                    onNewReport(activeProposal.report!, activeProposal.id)
                  }
                >
                  Sprawdź i zapisz
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          )}
          <div ref={lastMessage} />
        </div>
      )}
      <div className="composer-area">
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
            placeholder="Napisz, nagraj albo dodaj zdjęcie…"
            disabled={busy}
          />
          {attachments.length > 0 && (
            <div className="attachment-tray" aria-label="Dodane pliki">
              {attachments.map((attachment) => (
                <div className="attachment-chip" key={attachment.id}>
                  {attachment.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={attachment.preview} alt="" />
                  ) : (
                    <AudioLines size={18} />
                  )}
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
                disabled={busy || recording || attachments.length >= 3}
                onClick={() => imageInput.current?.click()}
                aria-label="Dodaj zdjęcie"
              >
                <ImagePlus size={20} />
                <span>Zdjęcie</span>
              </button>
              <button
                type="button"
                className={recording ? "recording" : ""}
                disabled={busy || (!recording && attachments.length >= 3)}
                onClick={() =>
                  recording ? stopRecording() : void startRecording()
                }
                aria-label={
                  recording ? "Zakończ nagrywanie" : "Nagraj wiadomość"
                }
              >
                {recording ? <Square size={17} /> : <Mic size={20} />}
                <span>
                  {recording
                    ? `Stop · 0:${String(recordingSeconds).padStart(2, "0")}`
                    : "Nagraj"}
                </span>
              </button>
            </div>
            <button
              className="send-button"
              disabled={
                !available ||
                creditExhausted ||
                busy ||
                recording ||
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
            <div className="manual-fallback">
              <span>Tryb awaryjny</span>
              <button onClick={() => onNewQuote()}>Wycena ręczna</button>
              <button onClick={() => onNewReport()}>Protokół ręcznie</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
