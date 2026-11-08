# Agent guide

Keep changes small. Use Conventional Commits. Keep the release ID `cosmic-dark`. Use low-cost agents for bounded tasks.

| Task | Command or reference |
| --- | --- |
| Install | `npm ci` (Node 24) |
| Check COSMIC | `npm run verify --workspace=@remnote/cosmic` |
| Preview and live testing | [COSMIC development](themes/cosmic/dev/README.md) |
| Edit CSS | `themes/cosmic/src/`; never edit `dist/` |
| Theme page | `themes/cosmic/README.md` |
| CSS and themes | https://plugins.remnote.com/custom-css |
| Manifest | https://plugins.remnote.com/advanced/manifest |
| Publishing | https://plugins.remnote.com/advanced/submitting_plugins |
| Reference | https://github.com/mdeguzis/remnote-sakura-theme |

Keep tooling and tests inside their package. Do not add `!important`. Review screenshot changes. Fixtures do not replace tests in RemNote.
