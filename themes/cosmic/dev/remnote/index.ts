import { declareIndexPlugin, type ReactRNPlugin } from "@remnote/plugin-sdk";
declare const COSMIC_DEV_ORIGIN: string;
const key = "cosmic-development";
let timer: ReturnType<typeof setInterval> | undefined;
let lastCSS: string | undefined;
let active = false;
let pending: Promise<void> | undefined;
async function update(plugin: ReactRNPlugin): Promise<void> {
  if (!active || pending) return;
  pending = applyCSS(plugin);
  try {
    await pending;
  } finally {
    pending = undefined;
  }
}
async function applyCSS(plugin: ReactRNPlugin): Promise<void> {
  try {
    const response = await fetch(`${COSMIC_DEV_ORIGIN}/theme.css`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error(await response.text());
    const css = await response.text();
    if (active && css !== lastCSS) {
      await plugin.app.registerCSS(key, css);
      lastCSS = css;
      console.info("[COSMIC dev] stylesheet updated");
    }
  } catch (error) {
    console.error("[COSMIC dev] build unavailable; see local server", error);
    if (active && lastCSS !== undefined) {
      await plugin.app.registerCSS(key, "");
      lastCSS = undefined;
    }
  }
}
declareIndexPlugin(
  async (plugin) => {
    active = true;
    await update(plugin);
    if (!active) return;
    timer = setInterval(() => {
      void update(plugin);
    }, 1000);
  },
  async (plugin) => {
    active = false;
    clearInterval(timer);
    await pending;
    await plugin.app.registerCSS(key, "");
    lastCSS = undefined;
  },
);
