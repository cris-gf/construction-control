import { readdirSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname, relative } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const root = resolve("src");
const files = readdirSync(root, { recursive: true })
  .map(String)
  .filter((file) => /\.(ts|tsx)$/.test(file))
  .map((file) => resolve(root, file));
const graph = new Map<string, string[]>();
for (const file of files) {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  const dependencies: string[] = [];
  for (const statement of source.statements) {
    if (
      !ts.isImportDeclaration(statement) &&
      !ts.isExportDeclaration(statement)
    )
      continue;
    const specifier = statement.moduleSpecifier;
    if (!specifier || !ts.isStringLiteral(specifier)) continue;
    if (!specifier.text.startsWith(".")) {
      dependencies.push(specifier.text);
      continue;
    }
    const base = resolve(dirname(file), specifier.text);
    const found = [base + ".ts", base + ".tsx", resolve(base, "index.ts")].find(
      existsSync,
    );
    if (found) dependencies.push(found);
  }
  graph.set(file, dependencies);
}

describe("límites de arquitectura", () => {
  it("el dominio no depende de React, Firebase ni de las pantallas", () => {
    const violations: string[] = [];
    for (const [file, dependencies] of graph) {
      if (!relative(root, file).startsWith("domain/")) continue;
      for (const dependency of dependencies) {
        if (
          /^(react|firebase)(\/|$)/.test(dependency) ||
          /^(app|features|components|hooks|services)\//.test(
            relative(root, dependency),
          )
        ) {
          violations.push(
            `${relative(root, file)} -> ${relative(root, dependency)}`,
          );
        }
      }
    }
    expect(violations).toEqual([]);
  });
  it("los componentes compartidos y servicios no importan pantallas", () => {
    const violations: string[] = [];
    for (const [file, dependencies] of graph) {
      if (!/^(components|services)\//.test(relative(root, file))) continue;
      for (const dependency of dependencies) {
        if (/^(app|features)\//.test(relative(root, dependency)))
          violations.push(relative(root, file));
      }
    }
    expect(violations).toEqual([]);
  });
  it("los módulos no forman ciclos de importación", () => {
    const visiting = new Set<string>();
    const visited = new Set<string>();
    function visit(file: string, path: string[]) {
      if (visiting.has(file))
        throw new Error(
          path
            .concat(file)
            .map((f) => relative(root, f))
            .join(" -> "),
        );
      if (visited.has(file) || !graph.has(file)) return;
      visiting.add(file);
      for (const dependency of graph.get(file)!)
        visit(dependency, [...path, file]);
      visiting.delete(file);
      visited.add(file);
    }
    for (const file of files) visit(file, []);
  });
});
