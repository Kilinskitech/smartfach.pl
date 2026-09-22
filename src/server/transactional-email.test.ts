import { afterEach, beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const m = vi.hoisted(() => ({ sendMail: vi.fn(), close: vi.fn() }));
vi.mock("nodemailer", () => ({ default: { createTransport: () => m } }));
import { sendContractEmail, sendCancellationEmail } from "./transactional-email";
const input = { recipient: "buyer@example.test", body: "contract", sessionId: "cs_test_synthetic", replyTo: "support@example.test" };
beforeEach(() => { vi.resetAllMocks(); vi.stubEnv("SMTP_HOST", "smtp.example.test"); vi.stubEnv("SMTP_USER", "sender@example.test"); vi.stubEnv("SMTP_PASSWORD", "synthetic"); vi.stubEnv("SMTP_PORT", "465"); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });
it("closes a stalled SMTP connection after 45 seconds", async () => {
  vi.useFakeTimers(); m.sendMail.mockReturnValue(new Promise(() => {}));
  const check = expect(sendContractEmail(input)).rejects.toThrow("timed out");
  await vi.advanceTimersByTimeAsync(45_000); await check;
  expect(m.close).toHaveBeenCalledTimes(1);
});
it("closes SMTP after successful delivery", async () => {
  m.sendMail.mockResolvedValue({ accepted: [input.recipient] });
  await sendContractEmail(input); expect(m.close).toHaveBeenCalledTimes(1);
});
it("sends escaped cancellation HTML and plain text with a stable Message-ID, without a contract attachment", async () => {
  m.sendMail.mockResolvedValue({ accepted: [input.recipient] });
  await sendCancellationEmail({ recipient: input.recipient, replyTo: input.replyTo, messageId: "sub_test-123", subject: "Anulowanie", body: "Plan <Pro>\nDostęp do końca próby." });
  expect(m.sendMail).toHaveBeenCalledWith(expect.objectContaining({
    messageId: "<cancellation-sub_test-123@smartfach.pl>",
    text: "Plan <Pro>\nDostęp do końca próby.",
    html: expect.stringContaining("Plan &lt;Pro&gt;<br>Dostęp"),
  }));
  expect(m.sendMail.mock.calls[0]![0].attachments).toBeUndefined();
  expect(m.close).toHaveBeenCalledTimes(1);
});
it("treats a rejected cancellation email as retryable failure", async () => {
  m.sendMail.mockResolvedValue({ accepted: [] });
  await expect(sendCancellationEmail({ recipient: input.recipient, replyTo: input.replyTo, messageId: "sub_test-123", subject: "Anulowanie", body: "Test" })).rejects.toThrow("nie przyjął");
});
