import { z } from "zod";

export const emailConfirmationSchema = z.object({
  token_hash: z.string().min(20).max(300).regex(/^[a-zA-Z0-9_-]+$/),
  type: z.enum(["signup", "recovery"]),
});

export function confirmationDestination(type: "signup" | "recovery") {
  return type === "recovery" ? "/ustaw-haslo" : "/app";
}
