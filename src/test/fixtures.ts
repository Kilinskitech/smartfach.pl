import {
  emptyWorkspace,
  type Workspace,
  type WorkDocument,
} from "../domain/workspace";

export const fixtureClient = {
  id: "client-qa",
  name: "Łukasz Żółć",
  phone: "",
  email: "",
  address: "",
  notes: "",
};
export const fixturePrice = {
  id: "price-qa",
  name: "Przegląd klimatyzacji",
  unit: "usł." as const,
  price: "430",
};
export function fixtureDocument(): WorkDocument {
  return {
    id: "quote-qa",
    kind: "quote",
    createdAt: "2026-08-31T10:00:00Z",
    updatedAt: "2026-08-31T10:00:00Z",
    draft: {
      client: fixtureClient.name,
      clientId: fixtureClient.id,
      subject: "Przegląd i wymiana części",
      vatBasisPoints: 2300,
      lines: [
        {
          id: "line-qa",
          label: fixturePrice.name,
          unit: fixturePrice.unit,
          quantity: "2",
          price: fixturePrice.price,
          source: "catalog",
        },
      ],
    },
  };
}
export function fixtureWorkspace(): Workspace {
  return {
    ...structuredClone(emptyWorkspace),
    clients: [{ ...fixtureClient }],
    catalog: [{ ...fixturePrice }],
    documents: [fixtureDocument()],
  };
}
