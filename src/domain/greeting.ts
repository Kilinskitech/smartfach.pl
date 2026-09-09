import type { z } from "zod";
import type { assistantRequestSchema } from "./assistant";

/** Exact greeting only: never intercept a task, image or guided onboarding. */
export function greetingReply(input: z.infer<typeof assistantRequestSchema>) {
  if (input.mode === "guided_start" || input.guidedStart || input.attachments?.length) return null;
  const last = input.messages.at(-1);
  if (last?.role !== "user" || !/^(hej|hejka|cześć|czesc|witaj|witam|dzień dobry|dzien dobry|siema|hello|hi)[!.\s]*$/iu.test(last.content.trim())) return null;
  return "Cześć! Nad czym dziś pracujemy — pomysłem na usługę, ofertą czy pozyskaniem klientów? Możesz też po prostu zadać pytanie.";
}
