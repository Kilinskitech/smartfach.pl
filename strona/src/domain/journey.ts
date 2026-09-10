import type { GuidedStart } from "./assistant";
import type { Workspace } from "./workspace";

const situationFocus: Record<GuidedStart["situation"], string> = {
  unknown: "Wybór pierwszej sprzedawalnej usługi",
  idea: "Sprawdzenie i uruchomienie własnego pomysłu",
  skills: "Usługa oparta na moich umiejętnościach",
};

const situationExperience: Record<GuidedStart["situation"], string> = {
  unknown: "Zaczynam od zera i nie wiem jeszcze, co mogę sprzedawać.",
  idea: "Mam wstępny pomysł i chcę sprawdzić go na rynku.",
  skills: "Chcę oprzeć usługę na umiejętnościach, które już mam.",
};

const priorityLabels: Record<GuidedStart["priorities"][number], string> = {
  fast: "szybko przejść do pierwszego testu",
  low_cost: "zacząć małym kosztem",
  after_hours: "działać po godzinach",
  full_income: "docelowo utrzymywać się z własnej usługi",
};

const boundaryLabels: Record<GuidedStart["boundaries"][number], string> = {
  phone: "bez sprzedaży telefonicznej",
  camera: "bez pokazywania twarzy i nagrywania filmów",
  budget: "bez dużych wydatków na start",
};

function joinUnique(
  existing: string,
  additions: Array<string | undefined>,
  maxLength: number,
) {
  const values = [existing, ...additions]
    .map((value) => value?.trim() ?? "")
    .filter(Boolean);
  return [...new Set(values)].join(" ").slice(0, maxLength).trim();
}

export function completeJourneyOnboarding(
  current: Workspace["journey"],
  start: GuidedStart,
): Workspace["journey"] {
  const priorities = start.priorities.map((item) => priorityLabels[item]);
  const constraints = [
    ...start.boundaries.map((item) => boundaryLabels[item]),
    start.customBoundary,
  ];

  return {
    ...current,
    workStyle: start.workStyle,
    focus: current.focus.trim() || situationFocus[start.situation],
    goal:
      current.goal.trim() ||
      (priorities.length
        ? joinUnique("", priorities, 500)
        : "Znaleźć pierwszą usługę i zdobyć pierwszego klienta"),
    experience: joinUnique(
      current.experience,
      [situationExperience[start.situation], start.additionalInfo],
      1200,
    ),
    constraints: joinUnique(current.constraints, constraints, 1200),
    onboardingCompleted: true,
  };
}
