import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ChatPanel } from "./chat-panel";
import { SettingsPanel } from "./settings-panel";
import { fixtureWorkspace } from "@/test/fixtures";

describe("new chat and general profile", () => {
  it("always offers its own questionnaire even when old onboarding is complete", () => {
    const data = fixtureWorkspace();
    data.journey = { ...data.journey, onboardingCompleted: true, focus: "Stary sklep", workStyle: "local" };
    const html = renderToStaticMarkup(<ChatPanel data={data} conversation={undefined} available={true} webSearch={true} checking={false} checkConnection={vi.fn()} onSaveConversation={vi.fn()} onSettings={vi.fn()} onBusy={vi.fn()} onOpenBilling={vi.fn()} />);
    expect(html).toContain("Nad jakim biznesem pracujemy?");
    expect(html).toContain("Chcę tylko zadać pytanie");
    expect(html).toContain("business-name");
    expect(html).not.toContain("Stary sklep");
    expect(html).not.toContain("task-start-grid");
  });
  it("shows only the explicit about-me field, not old business data", () => {
    const data = fixtureWorkspace();
    data.journey = { ...data.journey, aboutMe: "Lubię pisać", focus: "Stary sklep", experience: "Stary pomysł" };
    const html = renderToStaticMarkup(<SettingsPanel data={data} available={true} webSearch={true} onOpenBilling={vi.fn()} onSaveJourney={vi.fn()} />);
    expect(html).toContain("Lubię pisać");
    expect(html).not.toContain("Stary sklep");
    expect(html).not.toContain("Stary pomysł");
    expect(html).not.toContain("journey-goal");
    expect(html).not.toContain("journey-hours");
  });
});
