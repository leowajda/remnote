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
        <div class="rn-tooltip rn-tooltip-gradient status-banner"><span class="text-cyan-70">Use a source to start studying.</span></div>
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
          <div class="queue-actions"><button class="rn-button rn-queue__answer-btn--forgotten" type="button">Again</button><button class="rn-button rn-queue__answer-btn--with-effort" type="button">Good</button><button class="rn-button rn-queue__answer-btn--immediately" type="button">Easy</button></div></div>
      </article>
      <article class="preview-panel"><h2>Connected notes</h2>
        <nav class="rn-sidebar fixture-sidebar" aria-label="Notebook"><div class="rn-account-capsule">Personal workspace</div><div class="rn-document-sidebar__top-link rn-clr-background-light-accent">Biology <span class="rn-sidebar-counter">12 due</span></div><div>Research journal</div></nav>
        <div class="rn-editor fixture-editor"><p class="rn-doc-title"><strong>Patterns in nature</strong></p><p>Explore <a class="rn-rem-reference" href="#connections">cellular networks</a> and <span class="rn-tag">Biology</span>.</p>
          <blockquote class="rn-quote">Small connections build a larger understanding.</blockquote>
          <div class="rn-search-portal fixture-portal" id="connections">Linked notes · Cellular energy</div>
          <p><span class="highlight-color--yellow">Key idea</span> · <span class="highlight-color--orange">Revisit</span> · <span class="highlight-color--blue">Source</span> · <span class="highlight-color--purple">Connection</span></p>
        </div>
      </article>
      <article class="preview-panel rn-settings"><h2>Settings and selection</h2>
        <nav class="fixture-settings-links rn-settings__sidebar" aria-label="Settings">
          <a href="#settings" class="rn-settings__link">General</a>
          <a href="#settings" class="rn-settings__link rn-clr-content-accent" aria-current="page">Appearance</a>
          <a href="#settings" class="rn-settings__link">Flashcards</a>
        </nav>
        <div class="settings-row"><label><input type="checkbox" checked> Sync indicator</label><label><input type="radio" checked name="density"> Comfortable</label></div>
        <div class="fixture-tabs" role="tablist" aria-label="Queue settings"><button class="rn-nav-tab-button" role="tab" aria-selected="false">Basic</button><button class="rn-nav-tab-button rn-clr-content-accent" role="tab" aria-selected="true">Type in Answer</button></div>
        <p>Export uses the host's nested on-color text utility:</p>
        <button class="rn-button rn-button--Primary rn-clr-background-accent" type="button"><span class="rn-clr-content-on-color dark:rn-clr-content-primary">Export</span></button>
        <input class="fixture-search placeholder:text-gray-30" placeholder="Search settings" aria-label="Search settings">
        <p><span class="rn-checkbox rn-checkbox--checked fixture-checkbox" style="background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22%3E%3Cpath d=%22M3 8l3 3 7-7%22 fill=%22none%22 stroke=%22white%22/%3E%3C/svg%3E')"></span> Full width</p>
      </article>
      <article class="preview-panel rn-all-notes"><h2>Documents &amp; Folders</h2>
        <div class="button-row"><button class="rn-button rn-button--Outline" type="button"><span class="text-black">Upload &amp; Learn PDF</span></button><button class="rn-button rn-primary" type="button">Create</button></div>
        <input class="fixture-search placeholder:text-gray-30" data-test="All Notes Search Input" placeholder="Search documents" aria-label="Search documents">
        <div class="fixture-filter-scroller">
          <div class="no-horizontal-scroll"><div data-test="all-notes-quick-filters">
            <button class="rn-all-notes-filter-tab" type="button">All · 0</button>
            <button class="rn-all-notes-filter-tab rn-all-notes-filter-tab--selected" type="button">Documents · 0</button>
            <button class="rn-all-notes-filter-tab" type="button">Folders · 0</button>
            <button class="rn-all-notes-filter-tab" type="button">PDFs · 0</button>
            <button class="rn-all-notes-filter-tab" type="button">Tags · 0</button>
            <button class="rn-all-notes-filter-tab" type="button">Daily Notes · 0</button>
          </div></div>
          <div class="pointer-events-none fixture-scroll-fade" style="background:linear-gradient(to right,transparent,white)"></div>
          <button data-test="Horizontal Scroll Left Button" aria-label="Scroll left" type="button">‹</button>
          <button data-test="Horizontal Scroll Right Button" aria-label="Scroll right" type="button">›</button>
        </div>
      </article>
      <article class="preview-panel"><h2>Extracted highlights</h2>
        <div class="rn-editor fixture-editor">
          <p class="rn-editor__rem__body--yellow fixture-highlight">Yellow marks an important passage, not the current selection.</p>
          <p>A <span class="cloze has-highlight-color highlight-color--yellow">highlighted cloze</span> keeps its annotation.</p>
          <p class="rn-editor__rem__body--orange fixture-highlight">Coral is reserved for annotations and warnings.</p>
          <p class="rn-editor__rem__body--purple fixture-highlight">Lavender keeps related concepts recognizable.</p>
          <p class="bg-gray-5 fixture-highlight" data-rem-tags="pdf-highlight">An uncolored PDF excerpt stays neutral and readable.</p>
        </div>
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

for (const direction of ["Left", "Right"] as const) {
  document
    .querySelector(`[data-test="Horizontal Scroll ${direction} Button"]`)!
    .addEventListener("click", () =>
      document.querySelector(".no-horizontal-scroll")!.scrollBy({
        left: direction === "Right" ? 160 : -160,
      }),
    );
}
