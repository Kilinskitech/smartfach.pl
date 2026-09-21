import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MarketingHome } from "./marketing";

describe("landing SmartFach", () => {
  const html = renderToStaticMarkup(createElement(MarketingHome));

  it("prowadzi od umiejętności do próby planu Pro z pełnymi warunkami", () => {
    expect(html).toContain(
      "Zbudujmy razem <em>Twój wymarzony biznes.</em>",
    );
    expect(html).toContain("Nie potrzebujesz pomysłu ani doświadczenia.");
    expect(html).toContain("ASYSTENT AI DO BUDOWANIA WŁASNEGO BIZNESU");
    expect(html).toContain("Wypróbuj SmartFach przez 3 dni");
    expect(html).toContain(
      "0 zł przez 3 dni. Karta wymagana. Następnie Pro 99 zł/mies.",
    );
    expect(html).toContain('href="/logowanie?plan=pro"');
  });

  it("pokazuje konkretny, jawnie oznaczony materiał demonstracyjny", () => {
    expect(html).toContain("MATERIAŁ PRZYKŁADOWY");
    expect(html).toContain("NIE JEST TO HISTORIA KLIENTA");
    expect(html).toContain("PRZYKŁADOWA OFERTA DO DOPRACOWANIA");
    expect(html).toContain("PRZYKŁADOWY SZKIC WIADOMOŚCI");
    expect(html).toContain("Mikrofirmy, które ręcznie poprawiają arkusze");
    expect(html).toContain("Czy możemy porozmawiać przez 15 minut?");
    expect(html).toContain("nie historia klienta ani obietnica wyniku");
  });

  it("zachowuje sprzedażową kolejność sekcji", () => {
    const sections = [
      "ASYSTENT AI DO BUDOWANIA WŁASNEGO BIZNESU",
      "ZOBACZ, CO MOŻESZ PRZYGOTOWAĆ",
      "DLA KOGO JEST SMARTFACH",
      "JAK WYGLĄDA PRACA Z APLIKACJĄ",
      "DLACZEGO WRACASZ DO SMARTFACH",
      "TE SAME FUNKCJE · INNA WIELKOŚĆ PULI",
      "PYTANIA PRZED STARTEM",
    ];
    const positions = sections.map((section) => html.indexOf(section));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("pokazuje prawdziwe ceny, limity i poprawne cele planów", () => {
    expect(html).toContain("49 zł");
    expect(html).toContain("99 zł");
    expect(html).toContain("Około 2,4× większa miesięczna pula niż w Lite");
    expect(html).toContain("nic nie dokupuje się automatycznie");
    expect(html).toContain('href="/logowanie?plan=lite"');
    expect(html).toContain('href="/logowanie?plan=pro"');
  });

  it("powtarza czytelne wezwanie do próby po kluczowych sekcjach", () => {
    expect(html.match(/Wypróbuj SmartFach/g)).toHaveLength(6);
    expect(html).toContain("Wypróbuj 3 dni za 0 zł");
    expect(html.match(/3 dni za 0 zł/g)?.length).toBeGreaterThanOrEqual(5);
    expect(html).toContain("anuluj przed pierwszą opłatą");
    expect(html).toContain("ZACZNIJ OD KROKU 1");
    expect(html).toContain("MASZ JUŻ NAJWAŻNIEJSZE ODPOWIEDZI");
  });

  it("nie uruchamia konwersji ani nie renderuje fałszywej interakcji przy wejściu", () => {
    expect(html).not.toContain("sf_select_plan");
    expect(html).not.toContain("sf_sign_up");
    expect(html).not.toContain("sf_begin_checkout");
    expect(html).not.toContain("sf_start_trial");
    expect(html).not.toContain("<button");
    expect(html).toContain("Każdy czat może dotyczyć osobnego biznesu");
  });
});
