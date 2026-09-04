import { mkdir, readFile, rename, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import {
  emptyWorkspace,
  workspaceSchema,
  type Workspace,
} from "../domain/workspace";
import { RevisionConflict } from "./repository-errors";

export { RevisionConflict };
export function createLocalRepository(directory: string) {
  const filename = path.join(directory, "workspace.json");
  let pending: Promise<unknown> = Promise.resolve();
  async function read(): Promise<Workspace> {
    try {
      return workspaceSchema.parse(
        JSON.parse(await readFile(filename, "utf8")),
      );
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "ENOENT"
      )
        return structuredClone(emptyWorkspace);
      // Uszkodzone dane nigdy nie są zastępowane pustą kartoteką.
      throw new Error(
        "Nie można odczytać zapisanych danych. Plik pozostał bez zmian.",
      );
    }
  }
  function write(input: unknown): Promise<Workspace> {
    const operation = pending.then(async () => {
      const next = workspaceSchema.parse(input);
      const current = await read();
      if (next.revision !== current.revision)
        throw new RevisionConflict(
          "Dane zmieniły się w innym oknie. Odśwież widok przed zapisem.",
        );
      const saved = { ...next, revision: current.revision + 1 };
      const contents = JSON.stringify(saved);
      if (Buffer.byteLength(contents) > 2_000_000)
        throw new Error("Osiągnięto limit lokalnego podglądu.");
      await mkdir(directory, { recursive: true, mode: 0o700 });
      const temporary = path.join(
        directory,
        "workspace-" + crypto.randomUUID() + ".tmp",
      );
      try {
        await writeFile(temporary, contents, {
          encoding: "utf8",
          mode: 0o600,
          flag: "wx",
        });
        await rename(temporary, filename);
      } catch (error) {
        await unlink(temporary).catch(() => {});
        throw error;
      }
      return saved;
    });
    pending = operation.catch(() => {});
    return operation;
  }
  return { read, write };
}
export const localRepository = createLocalRepository(
  path.join(process.cwd(), ".local"),
);
