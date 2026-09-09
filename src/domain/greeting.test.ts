import { describe, expect, it } from "vitest";
import { greetingReply } from "./greeting";
describe("non-generative greeting", () => {
  it.each(["Hej!", " cześć ", "dzień dobry", "hi."])("handles %s", (content) => {
    expect(greetingReply({clientId:null,messages:[{role:"user",content}]})).toContain("Cześć!");
  });
  it.each(["hej, przygotuj ofertę", "cześć co polecasz", "porównaj pomysły"])("does not intercept tasks: %s", (content) => {
    expect(greetingReply({clientId:null,messages:[{role:"user",content}]})).toBeNull();
  });
  it("does not intercept onboarding or images", () => {
    const messages = [{role:"user" as const,content:"hej"}];
    expect(greetingReply({clientId:null,messages,mode:"guided_start"})).toBeNull();
    expect(greetingReply({clientId:null,messages,attachments:[{kind:"image",mediaType:"image/png",data:"YWJj",name:"x"}]})).toBeNull();
  });
});
