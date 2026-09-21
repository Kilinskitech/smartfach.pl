import { isProductionDeployment, productionOrigin } from "@/lib/seo";

const content = `# SmartFach

> SmartFach to osobisty asystent biznesowy, który pomaga budować własne źródło przychodu: wybrać realny kierunek, przygotować ofertę, znaleźć sposób dotarcia do klientów i ustalić następne działanie.

## Najważniejsze strony

- [Strona główna](${productionOrigin}/): czym jest SmartFach, dla kogo powstał i jak działa.
- [Cennik](${productionOrigin}/cennik): plany Lite i Pro oraz warunki 3-dniowego okresu próbnego.
- [Kontakt](${productionOrigin}/kontakt): kontakt w sprawie produktu, planu i pomocy technicznej.

## Dokumenty

- [Regulamin](${productionOrigin}/regulamin)
- [Polityka prywatności](${productionOrigin}/polityka-prywatnosci)

## Zakres dostępu

Publiczne materiały można indeksować i cytować z podaniem adresu źródłowego. Prywatne rozmowy, konto użytkownika, panel administratora, API, logowanie i płatności nie są publiczne i nie są przeznaczone do indeksowania.
`;

export function GET() {
  if (!isProductionDeployment()) {
    return new Response("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
