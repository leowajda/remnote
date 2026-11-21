# COSMIC for RemNote

A quiet workspace in charcoal, graphite and ice cyan. One clear interaction accent, readable controls, and considered light and dark modes. Your note highlights and meaningful status colors stay intact.

Install [`cosmic-0.5.1.zip`](https://github.com/leowajda/remnote/raw/refs/heads/master/releases/cosmic-0.5.1.zip). The release ID remains `cosmic-dark` for existing installations.

In the PDF reader, **Dark** (or matching a dark app) uses COSMIC charcoal paper. Light, Sepia, Invert and printed pages keep their native appearance. The dark adjustment replaces the exact stock paper color in the rendered page; a pixel of that same color in a diagram also changes.

Edit `src/tokens.css` for the palette, `src/remnote.css` for RemNote's color variables, or `src/components/` for individual views. From the repository root, run `npm ci`, `npm run check`, then `npm run build` (Node 24 and `zip`). The installable archive is `themes/cosmic/dist/cosmic.zip`. For live CSS edits use RemNote's built-in **Custom CSS** editor.
