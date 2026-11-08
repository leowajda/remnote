import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdtemp, writeFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { unzipSync, strFromU8 } from "fflate";
import stylelint from "stylelint";
import postcss from "postcss";
import { assertCSS, assertOwnership, compileCSS } from "../../scripts/css.ts";
import { assertManifest } from "../../scripts/manifest.ts";
import { archive, cleanArchives, releaseFiles } from "../../scripts/build.ts";

test("CSS contract rejects important, missing tokens and unresolved imports", () => {
  assert.throws(
    () => assertCSS(".rn-button { color: red !important }"),
    /Important/,
  );
  assert.throws(
    () => assertCSS(".rn-button { color: var(--cosmic-typo) }"),
    /Undefined/,
  );
  assert.throws(() => assertCSS('@import "missing.css";'), /Unresolved/);
  assert.doesNotThrow(() =>
    assertCSS(".rn-button { color: var(--rn-host-owned) }"),
  );
});
test("standard linter rejects malformed values, unknown properties and duplicates", async () => {
  for (const code of [
    ".x { color: #ggg; }",
    ".x { colro: red; }",
    ".x { color: red; color: blue; }",
    ".x { color: red !important; }",
  ]) {
    const result = await stylelint.lint({
      code,
      configFile: "stylelint.config.mjs",
    });
    assert.ok(result.errored, code);
  }
});
test("manifest preserves identity, both modes and mobile", async () => {
  const manifest: unknown = JSON.parse(await readFile("manifest.json", "utf8"));
  assertManifest(manifest);
  for (const mutation of [
    { id: "new-id" },
    { enableOnMobile: false },
    { theme: ["dark"] },
    { requiredScopes: ["All"] },
    { version: { major: -1, minor: 0, patch: 0 } },
  ]) {
    assert.throws(() => assertManifest({ ...manifest, ...mutation }));
  }
});
test("release is deterministic and contains the exact compiled CSS only with theme assets", async () => {
  const files = await releaseFiles();
  const zipped = archive(files);
  assert.deepEqual(zipped, archive(files));
  const extracted = unzipSync(zipped);
  assert.deepEqual(Object.keys(extracted).sort(), [
    "README.md",
    "logo.png",
    "manifest.json",
    "theme.css",
  ]);
  assert.equal(strFromU8(extracted["theme.css"]!), await compileCSS());
});

test("component ownership rejects duplicate properties across modules", () => {
  const root = postcss.parse(".rn-button { color: red; }", {
    from: "/src/components/a.css",
  });
  root.append(
    postcss.parse(".rn-button { color: blue; }", {
      from: "/src/components/b.css",
    }),
  );
  assert.throws(() => assertOwnership(root), /Competing declaration/);
});

test("build cleanup removes old generated ZIPs and retains unrelated files", async () => {
  const directory = await mkdtemp(join(tmpdir(), "cosmic-build-"));
  try {
    for (const name of [
      "cosmic-0.1.0.zip",
      "cosmic-0.2.0.zip.tmp",
      "notes.txt",
    ])
      await writeFile(join(directory, name), "test");
    await cleanArchives(directory);
    assert.deepEqual(await readdir(directory), ["notes.txt"]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
