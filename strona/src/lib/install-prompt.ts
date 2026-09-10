export interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Several install buttons share one browser event. It can be used only once.
const consumed = new WeakSet<InstallPromptEvent>();
export function consumeInstallPrompt(event: InstallPromptEvent) {
  if (consumed.has(event)) return false;
  consumed.add(event);
  return true;
}
