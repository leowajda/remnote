import {
  readFile,
  mkdir,
  writeFile,
  rename,
  readdir,
  rm,
} from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { strToU8, zipSync, type Zippable } from "fflate";
import { compileCSS } from "./css.ts";
import { assertManifest } from "./manifest.ts";

export async function releaseFiles(): Promise<Record<string, Uint8Array>> {
  const manifest: unknown = JSON.parse(await readFile("manifest.json", "utf8"));
  assertManifest(manifest);
  const readme = await readFile("README.md", "utf8");
  for (const match of readme.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
    if (!match[1]?.startsWith("https://"))
      throw new Error("Images need HTTPS URLs");
  }
  const logo = await readFile("logo.png");
  if (
    !logo.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    throw new Error("Invalid PNG");
  return {
    "theme.css": strToU8(await compileCSS()),
    "manifest.json": strToU8(JSON.stringify(manifest, null, 2) + "\n"),
    "README.md": strToU8(readme),
    "logo.png": logo,
  };
}
export function archive(files: Record<string, Uint8Array>): Uint8Array {
  const entries: Zippable = {};
  for (const [name, data] of Object.entries(files))
    entries[name] = [data, { mtime: new Date(1980, 0, 1), level: 9 }];
  return zipSync(entries);
}
export async function cleanArchives(directory: string): Promise<void> {
  for (const file of await readdir(directory)) {
    if (/^cosmic-\d+\.\d+\.\d+\.zip(?:\.tmp)?$/.test(file))
      await rm(`${directory}/${file}`);
  }
}
export async function build(): Promise<void> {
  const files = await releaseFiles();
  const manifest = JSON.parse(
    new TextDecoder().decode(files["manifest.json"]),
  ) as { version: { major: number; minor: number; patch: number } };
  const { major, minor, patch } = manifest.version;
  const version = [major, minor, patch].join(".");
  await mkdir("dist", { recursive: true });
  await cleanArchives("dist");
  for (const [name, data] of Object.entries(files))
    await writeFile(`dist/${name}`, data);
  const target = `dist/cosmic-${version}.zip`;
  await writeFile(`${target}.tmp`, archive(files));
  await rename(`${target}.tmp`, target);
  console.log(target);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await build();
