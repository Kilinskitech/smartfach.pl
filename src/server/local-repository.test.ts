import { afterEach, describe, it, expect } from "vitest";
import {
  mkdtemp,
  readFile,
  writeFile,
  readdir,
  rm,
  stat,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createLocalRepository, RevisionConflict } from "./local-repository";
import { emptyWorkspace } from "../domain/workspace";
import { fixtureWorkspace } from "../test/fixtures";
const directories: string[] = [];
async function setup() {
  const directory = await mkdtemp(
    path.join(tmpdir(), "smartfach-repository-test-"),
  );
  directories.push(directory);
  return { directory, repo: createLocalRepository(directory) };
}
afterEach(async () => {
  for (const directory of directories.splice(0))
    await rm(directory, { recursive: true });
});
describe("lokalny zapis bez utraty historii", () => {
  it("pusty odczyt niczego nie tworzy", async () => {
    const { directory, repo } = await setup();
    expect(await repo.read()).toEqual(emptyWorkspace);
    expect(await readdir(directory)).toEqual([]);
  });
  it("zapisuje i odczytuje rekordy z nowej instancji", async () => {
    const { directory, repo } = await setup();
    const saved = await repo.write(fixtureWorkspace());
    expect(saved.revision).toBe(1);
    expect(await createLocalRepository(directory).read()).toEqual(saved);
    expect(
      (await stat(path.join(directory, "workspace.json"))).mode & 0o777,
    ).toBe(0o600);
  });
  it("nie nadpisuje równoczesnej zmiany ze starej karty", async () => {
    const { repo } = await setup();
    const results = await Promise.allSettled([
      repo.write(fixtureWorkspace()),
      repo.write(fixtureWorkspace()),
    ]);
    expect(results[0]?.status).toBe("fulfilled");
    expect(results[1]).toMatchObject({
      status: "rejected",
      reason: expect.any(RevisionConflict),
    });
    expect((await repo.read()).revision).toBe(1);
  });
  it("uszkodzony plik pozostaje nienaruszony", async () => {
    const { directory, repo } = await setup();
    const filename = path.join(directory, "workspace.json");
    await writeFile(filename, "broken-json");
    await expect(repo.read()).rejects.toThrow();
    await expect(repo.write(fixtureWorkspace())).rejects.toThrow();
    expect(await readFile(filename, "utf8")).toBe("broken-json");
  });
  it("błędny zapis nie psuje poprawnej historii ani kolejki", async () => {
    const { repo } = await setup();
    const first = await repo.write(fixtureWorkspace());
    await expect(repo.write({ ...first, clients: [] })).rejects.toThrow();
    expect(await repo.read()).toEqual(first);
    expect((await repo.write(first)).revision).toBe(2);
  });
});
