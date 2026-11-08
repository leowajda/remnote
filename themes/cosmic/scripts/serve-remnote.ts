import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { build } from "esbuild";
import { compileCSS } from "./css.ts";

const host = "127.0.0.1";
const port = Number(process.env["PORT"] ?? 8080);
const origin = `http://${host}:${port}`;
const manifest = JSON.parse(await readFile("manifest.json", "utf8")) as Record<
  string,
  unknown
>;
manifest["id"] = "cosmic-development";
manifest["name"] = "COSMIC development";
manifest["theme"] = [];
const bundles = new Map<string, Uint8Array>();
for (const sandbox of [false, true]) {
  const result = await build({
    entryPoints: ["dev/remnote/index.ts"],
    bundle: true,
    write: false,
    format: sandbox ? "iife" : "esm",
    platform: "browser",
    target: "es2022",
    define: { COSMIC_DEV_ORIGIN: JSON.stringify(origin) },
    banner: sandbox ? {} : { js: "const IMPORT_META = import.meta;" },
  });
  bundles.set(
    sandbox ? "/index-sandbox.js" : "/index.js",
    result.outputFiles[0]!.contents,
  );
}
const html =
  '<!doctype html><html><body><script src="/index-sandbox.js"></script></body></html>';
const server = createServer((request, response) => {
  void (async () => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Cache-Control", "no-store");
    const route = new URL(request.url ?? "/", origin).pathname;
    if (route === "/theme.css" || route === "/status") {
      const css = await compileCSS();
      response.setHeader(
        "Content-Type",
        route === "/theme.css" ? "text/css" : "application/json",
      );
      response.end(
        route === "/theme.css"
          ? css
          : JSON.stringify({
              sha256: createHash("sha256").update(css).digest("hex"),
            }),
      );
    } else if (route === "/manifest.json") {
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify(manifest));
    } else if (bundles.has(route)) {
      response.setHeader("Content-Type", "text/javascript");
      response.end(bundles.get(route));
    } else if (route === "/" || route === "/index.html") {
      response.setHeader("Content-Type", "text/html");
      response.end(html);
    } else if (route === "/logo.png") {
      response.setHeader("Content-Type", "image/png");
      response.end(await readFile("logo.png"));
    } else {
      response.statusCode = 404;
      response.end("Not found");
    }
  })().catch((error: unknown) => {
    console.error(error);
    response.statusCode = 503;
    response.end(String(error));
  });
});
server.listen(port, host, () => {
  console.log(`COSMIC development: ${origin}`);
});
server.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () => {
    server.close();
  });
