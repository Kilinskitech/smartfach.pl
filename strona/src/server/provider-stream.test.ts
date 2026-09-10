import { describe, expect, it, vi } from "vitest";
import { collectProviderStream } from "./provider-stream";
import { partialReply, readSse } from "@/lib/sse";
import { readAssistantResponse } from "@/lib/assistant-response";

function stream(value: string) {
  const bytes = new TextEncoder().encode(value);
  return new ReadableStream<Uint8Array>({ start(c) { for (const b of bytes) c.enqueue(Uint8Array.of(b)); c.close(); } });
}
const frame = (value: unknown) => `data: ${JSON.stringify(value)}\r\n\r\n`;
describe("streaming without prematurely committing output", () => {
  it("handles split UTF8, comments, accounting frames and hidden reasoning", async () => {
    const onReply = vi.fn();
    const text = ': OPENROUTER PROCESSING\r\n\r\n' + frame({id:"gen-test",model:"google/test",provider:"Google",choices:[{delta:{content:'{"reply":"Cześć ',reasoning:"PRIVATE"}}]})
      + frame({choices:[{delta:{content:'świat!\\n\\n**Hej**"}'},finish_reason:"stop"}]})
      + frame({choices:[],usage:{cost:0.002,prompt_tokens:10,completion_tokens:20}}) + 'data: [DONE]\r\n\r\n';
    const result = await collectProviderStream(stream(text), onReply);
    expect(result).toMatchObject({id:"gen-test",usage:{cost:0.002},choices:[{message:{content:'{"reply":"Cześć świat!\\n\\n**Hej**"}'}}]});
    expect(onReply).toHaveBeenLastCalledWith("Cześć świat!\n\n**Hej**");
    expect(JSON.stringify(onReply.mock.calls)).not.toContain("PRIVATE");
  });
  it.each([frame({choices:[{delta:{content:'{"reply":"part'}}]}), frame({error:{message:"provider failure"}}), frame({choices:[{delta:{content:'{"reply":"x"}'},finish_reason:"error"}]}) + 'data: [DONE]\n\n'])
    ("rejects incomplete or errored upstream streams", async (value) => { await expect(collectProviderStream(stream(value), vi.fn())).rejects.toThrow(); });
  it("decodes partial escapes and exposes no other fields", () => {
    expect(partialReply('{"reply":"Cześć\\nNowe\\u0')).toBe("Cześć\nNowe");
    expect(partialReply('{"reasoning":"secret"')).toBeNull();
    expect(partialReply('{"reply":"Tak","secret":"hidden"}')).toBe("Tak");
  });
  it("handles multiline SSE data fields", async () => {
    const receive = vi.fn(); await readSse(stream('event: result\ndata: {"a":\ndata: 1}\n\n'), receive);
    expect(receive).toHaveBeenCalledWith('{"a":\n1}');
  });
  it("client does not treat a preview as a saved answer", async () => {
    const response = new Response(stream(frame({type:"preview",reply:"Partial"})), {headers:{"content-type":"text/event-stream"}});
    await expect(readAssistantResponse(response,vi.fn())).rejects.toThrow("przed zapisaniem");
  });
  it("supports JSON responses and streamed final usage", async () => {
    expect(await readAssistantResponse(Response.json({reply:"Saved"}),vi.fn())).toEqual({reply:"Saved"});
    const result = {reply:"Saved",billing:{usedCredits:3},workspaceRevision:9};
    const response = new Response(stream(frame({type:"result",result})), {headers:{"content-type":"text/event-stream"}});
    expect(await readAssistantResponse(response,vi.fn())).toEqual(result);
  });
  it("client assembles deltas without repeatedly transferring the whole reply", async () => {
    const preview = vi.fn();
    const response = new Response(stream(frame({type:"delta",delta:"Cześć "}) + frame({type:"delta",delta:"świat!"}) + frame({type:"result",result:{reply:"Cześć świat!"}})), {headers:{"content-type":"text/event-stream"}});
    expect(await readAssistantResponse(response,preview)).toEqual({reply:"Cześć świat!"});
    expect(preview).toHaveBeenLastCalledWith("Cześć świat!");
  });
});
