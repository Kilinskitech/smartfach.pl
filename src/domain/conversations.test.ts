import { describe, expect, it } from "vitest";
import { deleteConversation } from "./conversations";
import { emptyWorkspace, workspaceSchema } from "./workspace";

describe("independent business conversations", () => {
  it("preserves old workspaces without the new optional fields", () => {
    expect(workspaceSchema.parse(emptyWorkspace).journey.aboutMe).toBeUndefined();
  });
  it("roundtrips business context separately from the general profile", () => {
    const workspace = workspaceSchema.parse({ ...emptyWorkspace, journey: { ...emptyWorkspace.journey, aboutMe: "Umiem pisać." }, conversations: [
      { id: "one", title: "Sklep", updatedAt: "2026-09-09T10:00:00Z", messages: [], businessContext: "Tylko lokalnie." },
      { id: "two", title: "Zdjęcia", updatedAt: "2026-09-09T10:00:00Z", messages: [], businessContext: "Tylko zdalnie." },
    ] });
    const next = deleteConversation(workspace, "one");
    expect(next.conversations.map(c => c.id)).toEqual(["two"]);
    expect(next.conversations[0]?.businessContext).toBe("Tylko zdalnie.");
    expect(next.journey).toEqual(workspace.journey);
    expect(next.billing).toEqual(workspace.billing);
    expect(workspace.conversations).toHaveLength(2);
    expect(deleteConversation(next, "one")).toEqual(next);
  });
});
