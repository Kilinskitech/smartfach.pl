import { readSse, partialReply } from "@/lib/sse";

export async function collectProviderStream(body: ReadableStream<Uint8Array>, onReply: (reply: string) => void) {
  let content = "", refusal = "", finished = false, finishReason: string | null = null, previous = "";
  const metadata: Record<string, unknown> = {};
  const annotations: unknown[] = [];
  await readSse(body, (data) => {
    if (finished) return;
    if (data === "[DONE]") { finished = true; return; }
    const chunk = JSON.parse(data);
    if (!chunk || typeof chunk !== "object" || chunk.error) throw new Error("Przerwano odpowiedź dostawcy AI.");
    for (const key of ["id", "model", "provider", "usage"]) if (chunk[key] != null) metadata[key] = chunk[key];
    const choice = chunk.choices?.[0];
    if (!choice) return; // usage-only accounting frame
    if (choice.finish_reason === "error") throw new Error("Przerwano odpowiedź dostawcy AI.");
    if (choice.finish_reason) finishReason = choice.finish_reason;
    const delta = choice.delta;
    if (typeof delta?.content === "string") content += delta.content;
    if (typeof delta?.refusal === "string") refusal += delta.refusal;
    if (Array.isArray(delta?.annotations)) annotations.push(...delta.annotations);
    if (Array.isArray(choice.message?.annotations)) annotations.push(...choice.message.annotations);
    if (content.length > 100_000 || annotations.length > 100) throw new Error("Odpowiedź AI jest zbyt duża.");
    const reply = partialReply(content);
    if (reply && reply !== previous) { previous = reply; onReply(reply); }
  });
  if (!finished || !finishReason) throw new Error("Nie otrzymano zakończenia odpowiedzi AI.");
  return { ...metadata, choices: [{ finish_reason: finishReason, message: { content, refusal: refusal || null, annotations } }] };
}
