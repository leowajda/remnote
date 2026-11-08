import { test } from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import { setImmediate } from "node:timers/promises";
import { build } from "esbuild";

test("development adapter replaces CSS, clears errors, and stops on deactivate", async () => {
  const bundle = await build({
    entryPoints: ["dev/remnote/index.ts"],
    bundle: true,
    write: false,
    format: "iife",
    define: { COSMIC_DEV_ORIGIN: JSON.stringify("http://localhost:8080") },
    plugins: [
      {
        name: "mock-remnote",
        setup(builder) {
          builder.onResolve({ filter: /^@remnote\/plugin-sdk$/ }, () => ({
            path: "sdk",
            namespace: "mock",
          }));
          builder.onLoad({ filter: /.*/, namespace: "mock" }, () => ({
            contents:
              "export function declareIndexPlugin(activate, deactivate) { globalThis.hooks = {activate, deactivate}; }",
          }));
        },
      },
    ],
  });
  type Plugin = {
    app: { registerCSS: (key: string, css: string) => Promise<void> };
  };
  let css = ".rn-button { color: red; }";
  let broken = false;
  let poll: (() => void) | undefined;
  let stopped = false;
  let intervals = 0;
  const calls: Array<[string, string]> = [];
  const context: {
    hooks?: {
      activate: (p: Plugin) => Promise<void>;
      deactivate: (p: Plugin) => Promise<void>;
    };
    [key: string]: unknown;
  } = {
    console: { info() {}, error() {} },
    fetch: async () =>
      new Response(broken ? "Invalid CSS" : css, {
        status: broken ? 503 : 200,
      }),
    setInterval: (callback: () => void) => {
      intervals += 1;
      poll = callback;
      return 1;
    },
    clearInterval: () => {
      stopped = true;
    },
  };
  runInNewContext(bundle.outputFiles[0]!.text, context);
  const plugin: Plugin = {
    app: {
      registerCSS: async (key, value) => {
        calls.push([key, value]);
      },
    },
  };
  await context.hooks!.activate(plugin);
  assert.deepEqual(calls, [["cosmic-development", css]]);
  poll!();
  await setImmediate();
  assert.equal(calls.length, 1, "unchanged CSS is not re-registered");
  css = ".rn-button { color: blue; }";
  poll!();
  await setImmediate();
  assert.deepEqual(calls.at(-1), ["cosmic-development", css]);
  broken = true;
  poll!();
  await setImmediate();
  assert.deepEqual(calls.at(-1), ["cosmic-development", ""]);
  broken = false;
  poll!();
  await setImmediate();
  assert.deepEqual(calls.at(-1), ["cosmic-development", css]);
  await context.hooks!.deactivate(plugin);
  assert.ok(stopped);
  const count = calls.length;
  poll!();
  await setImmediate();
  assert.equal(calls.length, count);
  assert.deepEqual(calls.at(-1), ["cosmic-development", ""]);
  let finishRegistration: (() => void) | undefined;
  let applied = "";
  const slowPlugin: Plugin = {
    app: {
      registerCSS: async (_key, value) => {
        if (value)
          await new Promise<void>((resolve) => {
            finishRegistration = resolve;
          });
        applied = value;
      },
    },
  };
  const intervalCount = intervals;
  const activation = context.hooks!.activate(slowPlugin);
  await setImmediate();
  assert.ok(finishRegistration, "registration is pending");
  const deactivation = context.hooks!.deactivate(slowPlugin);
  finishRegistration!();
  await Promise.all([activation, deactivation]);
  assert.equal(
    intervals,
    intervalCount,
    "deactivation prevents a late polling timer",
  );
  assert.equal(
    applied,
    "",
    "deactivation clears an in-flight registration last",
  );
});
