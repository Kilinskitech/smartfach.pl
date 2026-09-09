import type { AssistantResult } from "@/domain/assistant";
import { readSse } from "./sse";

type Result = AssistantResult & { error?: string; code?: string };
export async function readAssistantResponse(response: Response, onReply: (reply: string) => void): Promise<Result> {
  if (!response.headers.get("content-type")?.includes("text/event-stream")) return response.json();
  if (!response.body) throw new Error("Nie otwarto strumienia odpowiedzi.");
  let result: Result | undefined;
  let preview = "";
  await readSse(response.body, (data) => {
    const event = JSON.parse(data);
    if (result) return;
    if (event.type === "delta" && typeof event.delta === "string") {
      preview = (preview + event.delta).slice(0, 4000);
      onReply(preview);
    }
    if (event.type === "preview" && typeof event.reply === "string") { preview = event.reply.slice(0, 4000); onReply(preview); }
    if (event.type === "result") result = event.result;
    if (event.type === "error") result = { error: event.error, code: event.code } as Result;
  });
  if (!result) throw new Error("Połączenie przerwano przed zapisaniem odpowiedzi. Ponów tę samą wiadomość, aby sprawdzić wynik.");
  return result;
}
