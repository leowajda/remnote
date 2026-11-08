import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import postcss, { type Root, type AtRule, type AnyNode } from "postcss";
import selectorParser from "postcss-selector-parser";
import stylelint from "stylelint";
import imports from "postcss-import";
import valueParser from "postcss-value-parser";

export function assertCSS(css: string): void {
  const root = postcss.parse(css);
  const declared = new Set<string>();
  const used = new Set<string>();
  root.walkAtRules("import", () => {
    throw new Error("Unresolved CSS import");
  });
  root.walkDecls((decl) => {
    if (decl.important) throw new Error(`Important declaration: ${decl.prop}`);
    if (decl.prop.startsWith("--cosmic-")) declared.add(decl.prop);
    valueParser(decl.value).walk((node) => {
      if (node.type === "function" && node.value === "var") {
        const name = node.nodes[0];
        if (name?.type === "word" && name.value.startsWith("--cosmic-"))
          used.add(name.value);
      }
    });
  });
  for (const name of used)
    if (!declared.has(name)) throw new Error(`Undefined token: ${name}`);
}

export function assertOwnership(root: Root): void {
  const owners = new Map<string, string>();
  root.walkRules((rule) => {
    const file = rule.source?.input.file ?? "";
    if (!file.includes("/components/")) return;
    const scope: string[] = [];
    for (
      let parent: AnyNode | undefined = rule.parent;
      parent;
      parent = parent.parent
    ) {
      if (parent.type === "atrule") {
        const at = parent as AtRule;
        scope.push(`${at.name} ${at.params}`);
      }
    }
    const selectors = selectorParser()
      .astSync(rule.selector)
      .nodes.map((node) => node.toString().trim());
    rule.each((decl) => {
      if (decl.type !== "decl") return;
      for (const selector of selectors) {
        const key = JSON.stringify([scope, selector, decl.prop]);
        const previous = owners.get(key);
        if (previous && previous !== file)
          throw new Error(
            `Competing declaration ${selector} / ${decl.prop}: ${previous}, ${file}`,
          );
        owners.set(key, file);
      }
    });
  });
}

export async function compileCSS(): Promise<string> {
  const from = resolve("src/index.css");
  const result = await postcss([imports()]).process(
    await readFile(from, "utf8"),
    { from, map: false },
  );
  assertCSS(result.css);
  assertOwnership(result.root);
  const lint = await stylelint.lint({
    code: result.css,
    config: {
      rules: {
        "property-no-unknown": true,
        "declaration-property-value-no-unknown": true,
        "color-no-invalid-hex": true,
        "declaration-no-important": true,
      },
    },
  });
  if (lint.errored) throw new Error(lint.report);
  return result.css;
}
