import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AssistantMessage } from "./assistant-message";

const render = (content: string) => renderToStaticMarkup(createElement(AssistantMessage, { content }));

describe("czytelne i bezpieczne odpowiedzi asystenta", () => {
  it("renderuje akapity, nagłówki, listy i ofertę zamiast ściany tekstu", () => {
    const html = render("### Kierunki dla Ciebie\n\n1. **Administracja** online\n2. Opisy produktów\n\n### Pierwszy krok\n\nPrzygotuj ofertę.\n\n> Pomogę uporządkować dokumenty.\n\nWyślij ją do trzech osób.");
    expect(html).toContain("<h3>Kierunki dla Ciebie</h3>");
    expect(html).toContain("<ol>");
    expect(html).toContain("<li><strong>Administracja</strong> online</li>");
    expect(html).toContain("<blockquote>");
    expect(html).toContain("<p>Przygotuj ofertę.</p>");
    expect(html).toContain("<p>Wyślij ją do trzech osób.</p>");
  });
  it("zachowuje zwykłe historyczne odpowiedzi i listy punktowane", () => {
    expect(render("Dzień dobry, przyjadę godzinę później.")).toContain("<p>Dzień dobry, przyjadę godzinę później.</p>");
    expect(render("- Pierwszy krok\n- Drugi krok")).toContain("<ul>");
    expect(render("# Tytuł")).toContain("<h3>Tytuł</h3>");
    expect(render("Cena < 100 zł")).toContain("Cena &lt; 100 zł");
  });
  it("nie osadza surowego HTML ani obrazów z odpowiedzi AI", () => {
    const html = render('Przed\n\n<script>alert(1)</script>\n\n<img src="x" onerror="alert(1)">\n\n![tracking](https://example.com/pixel)\n\nPo');
    expect(html).not.toMatch(/<script|<img|onerror|src=/i);
    expect(html).toContain("<p>Przed</p>");
    expect(html).toContain("<p>Po</p>");
    expect(render('`<script>alert(1)</script>`')).toContain("&lt;script&gt;");
  });
  it("dopuszcza wyłącznie linki HTTP(S), bez wykonywalnych adresów", () => {
    for (const url of ["javascript:alert%281%29", "data:text/html,test", "/admin", "//example.com"]) {
      expect(render(`[Link](${url})`)).not.toContain("href=");
    }
    const html = render("[Źródło](https://example.com)");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('rel="noopener noreferrer nofollow"');
  });
});
