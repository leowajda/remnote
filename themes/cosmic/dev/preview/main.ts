import "./host.css";
import "../../src/index.css";
import "./preview.css";

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <main class="preview-shell">
    <header class="preview-header">
      <div><p class="eyebrow">COSMIC · THEME FIXTURES</p><h1>Theme preview</h1>
        <p class="preview-note">Synthetic component gallery for visual checks. This is not the RemNote app.</p></div>
      <button class="rn-button" id="mode-toggle" type="button" aria-pressed="false">Switch to dark</button>
    </header>
    <section class="preview-grid" aria-label="Synthetic RemNote component gallery">
      <article class="preview-panel controls-panel">
        <h2>Controls</h2>
        <div class="button-row">
          <button class="rn-button rn-button--primary" type="button">Primary action</button>
          <button class="rn-button" type="button">Neutral action</button>
          <button class="rn-button" type="button" disabled>Disabled</button>
        </div>
        <div class="settings-row selected-setting" aria-current="true"><div><strong>Daily reminder</strong><small>Show a reminder each morning</small></div>
          <button class="rn-switch" type="button" role="switch" aria-checked="true" aria-label="Daily reminder" data-state="checked"><span class="rn-switch-handle"></span></button>
        </div>
        <div class="rn-floating-toolbar-wrapper toolbar-outer"><div class="rn-floating-toolbar toolbar"><div class="toolbar-actions"><button class="rn-button" type="button" aria-label="Bold"><strong>B</strong></button><button class="rn-button" type="button" aria-label="Italic"><em>I</em></button><button class="rn-button" type="button">Link</button></div></div></div>
        <div class="due-group"><button class="rn-button rn-button--primary" type="button">Due today</button><button class="rn-button rn-button--primary due-chevron" type="button" aria-label="More due options">⌄</button></div>
      </article>
      <article class="preview-panel status-panel"><h2>Status</h2>
        <div class="rn-notification-banner rn-clr-background-secondary rn-clr-content-primary status-banner" role="status"><strong>All changes saved</strong><span>Your notes are synced.</span></div>
        <div class="rn-notification-banner rn-clr-background-light-warning status-banner"><strong>Review due soon</strong><span>3 cards are ready to practice.</span></div>
      </article>
      <article class="preview-panel reader-panel"><h2>Reader content</h2>
        <div class="reader-page light"><p class="reader-kicker">BIOLOGY · CHAPTER 4</p><h3>Cellular energy</h3>
          <p>Cells convert nutrients into usable energy through <strong>cellular respiration</strong>.</p>
          <p>The process begins in the cytoplasm and continues in the <span class="cloze">mitochondria</span>.</p>
          <ul><li>Glycolysis splits glucose.</li><li>ATP stores immediately usable energy.</li></ul>
        </div>
      </article>
      <article class="preview-panel table-panel"><h2>Editor table</h2>
        <div class="table-scroll"><table class="editor-table"><thead><tr class="rn-table-header"><th>Concept</th><th>Definition</th><th>Review</th></tr></thead>
          <tbody><tr class="rn-table-row"><td>Neuron</td><td>Cell that transmits signals</td><td>Today</td></tr><tr class="rn-table-row"><td>Synapse</td><td>Connection between neurons</td><td>Tomorrow</td></tr></tbody></table></div>
      </article>
      <article class="preview-panel queue-panel"><h2>Practice queue</h2>
        <div class="rn-queue"><div class="rn-queue__top-bar"><span>Biology deck</span><span class="rn-queue__card-counter">4 / 12</span></div>
          <div class="rn-queue-rem"><strong>What is the role of ATP?</strong><p>Tap a rating after recalling the answer.</p></div>
          <div class="queue-actions"><button class="rn-button" type="button">Again</button><button class="rn-button" type="button">Good</button><button class="rn-button" type="button">Easy</button></div></div>
      </article>
    </section>
    <nav class="mobile-nav" aria-label="Preview mobile navigation"><button type="button">Home</button><button type="button">Search</button><button type="button">Practice</button><button type="button">Settings</button></nav>
    <footer class="preview-footer">Fixture classes mirror a small subset of RemNote class names for theme inspection.</footer>
  </main>`;

const toggle = document.querySelector<HTMLButtonElement>("#mode-toggle")!;
toggle.addEventListener("click", () => {
  const dark = app.classList.toggle("dark");
  app.classList.toggle("light", !dark);
  toggle.setAttribute("aria-pressed", String(dark));
  toggle.textContent = dark ? "Switch to light" : "Switch to dark";
});
app.classList.add("light");
