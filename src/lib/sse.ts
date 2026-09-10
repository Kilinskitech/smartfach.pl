/** Bounded SSE framing shared by the provider adapter and browser. */
export async function readSse(stream: ReadableStream<Uint8Array>, onData: (data: string) => void) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "", data: string[] = [], bytes = 0;
  function line(value: string) {
    if (value.endsWith("\r")) value = value.slice(0, -1);
    if (!value) {
      if (data.length) onData(data.join("\n"));
      data = [];
    } else if (value.startsWith("data:")) data.push(value.slice(5).replace(/^ /, ""));
  }
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      bytes += part.value.byteLength;
      if (bytes > 2_000_000) throw new Error("Odpowiedź przekroczyła dopuszczalny rozmiar.");
      buffer += decoder.decode(part.value, { stream: true });
      let end;
      while ((end = buffer.indexOf("\n")) >= 0) {
        line(buffer.slice(0, end));
        buffer = buffer.slice(end + 1);
      }
    }
    // Unfinished SSE frames are not committed events.
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally { reader.releaseLock(); }
}

/** Decode only the reply string, never reasoning, tools or the JSON envelope. */
export function partialReply(raw: string): string | null {
  const prefix = /^\s*\{\s*"reply"\s*:\s*"/.exec(raw);
  if (!prefix) return null;
  let escaped = false;
  const start = prefix[0].length;
  for (let i = start; i < raw.length; i++) {
    if (!escaped && raw[i] === '"') {
      try { return String(JSON.parse(raw.slice(start - 1, i + 1))).slice(0, 4000); }
      catch { return null; }
    }
    if (!escaped && raw[i] === "\\") escaped = true;
    else escaped = false;
  }
  const value = raw.slice(start);
  // A chunk may end halfway through a JSON escape (including \uXXXX).
  for (let trim = 0; trim <= Math.min(6, value.length); trim++) {
    try { return String(JSON.parse('"' + value.slice(0, value.length - trim) + '"')).slice(0, 4000); }
    catch { /* wait for the remaining escape */ }
  }
  return null;
}
