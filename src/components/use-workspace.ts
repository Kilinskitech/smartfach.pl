"use client";
import { useEffect, useRef, useState } from "react";
import { workspaceSchema, type Workspace } from "@/domain/workspace";

export function useWorkspace() {
  const [data, setData] = useState<Workspace | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const latest = useRef<Workspace | null>(null);
  const busy = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/workspace", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const json: unknown = await response.json();
        if (!response.ok)
          throw new Error(
            json && typeof json === "object" && "error" in json
              ? String(json.error)
              : "Nie można wczytać danych konta. Odśwież stronę; zapis pozostaje zablokowany.",
          );
        return workspaceSchema.parse(json);
      })
      .then((workspace) => {
        latest.current = workspace;
        setData(workspace);
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setError(
            error instanceof Error
              ? error.message
              : "Nie można odczytać danych konta.",
          );
      });
    return () => controller.abort();
  }, []);
  async function commit(update: (current: Workspace) => Workspace) {
    if (!latest.current || busy.current)
      throw new Error("Poczekaj na zakończenie zapisu.");
    busy.current = true;
    setSaving(true);
    setError("");
    try {
      const next = workspaceSchema.parse(update(latest.current));
      const response = await fetch("/api/workspace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Nie zapisano zmian.");
      const saved = workspaceSchema.parse(json);
      latest.current = saved;
      setData(saved);
      return saved;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nie zapisano zmian.";
      setError(message);
      throw new Error(message);
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }
  return { data, error, saving, commit };
}
