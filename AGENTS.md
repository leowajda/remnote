# Agent guide

Keep changes small. Use Conventional Commits. Keep the release ID `cosmic-dark`. Use low-cost agents for bounded tasks.

| Task | Command or reference |
| --- | --- |
| Install | `npm ci` (Node 24) |
| Check and package COSMIC | `npm run check && npm run build` |
| Edit CSS | `themes/cosmic/src/`; never edit `dist/` |
| Theme page | `themes/cosmic/README.md` |
| CSS and themes | https://plugins.remnote.com/custom-css |
| Manifest | https://plugins.remnote.com/advanced/manifest |
| Publishing | https://plugins.remnote.com/advanced/submitting_plugins |
| Reference | https://github.com/mdeguzis/remnote-sakura-theme |

Do not add `!important`. Check visual changes against RemNote's own styles and markup.
