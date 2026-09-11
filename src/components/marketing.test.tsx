import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MarketingHome } from "./marketing";

describe("landing SmartFach", () => {
  const html = renderToStaticMarkup(createElement(MarketingHome));

  it("prowadzi od krótkiej obietnicy do rozpoczęcia próby", () => {
    expect(html).toContain("Zbuduj usługę.");
    expect(html).toContain("Zdobądź pierwszego klienta.");
    expect(html).toContain("Zacznij 3 dni za 0 zł");
    expect(html).toContain("0 zł dzisiaj · karta wymagana · potem Pro 99 zł/mies.");
    expect(html).toContain('href="/logowanie?plan=pro"');
  });

  it("jawnie oznacza wszystkie przykłady i nie udaje wyniku klienta", () => {
    expect(html.match(/SCENARIUSZ PRZYKŁADOWY/g)).toHaveLength(4);
    expect(html.match(/Scenariusz przykładowy/g)).toHaveLength(1);
    expect(html).toContain("POSTAĆ FIKCYJNA");
    expect(html).toContain("nie historia klienta ani obietnica wyniku");
  });

  it("pokazuje prawdziwe ceny i pełne zasady próby", () => {
    expect(html).toContain("49 zł");
    expect(html).toContain("99 zł");
    expect(html).toContain("3 dni bez opłat · karta wymagana");
    expect(html).toContain("Jeśli nie anulujesz przed końcem próby");
  });

  it("nie renderuje nieaktywnego przycisku w demonstracji produktu", () => {
    expect(html).not.toContain("<button");
    expect(html).toContain("Każdy nowy czat może dotyczyć osobnego biznesu");
    expect(html).toContain("Kontekst jednego biznesu nie miesza się z innymi czatami");
  });
});
