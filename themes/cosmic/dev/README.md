# Development

Run commands from the repository root. Use Node 24 and `npm ci`.

| Task                  | Command                                                                      |
| --------------------- | ---------------------------------------------------------------------------- |
| Install test browsers | `npm exec --workspace=@remnote/cosmic -- playwright install chromium webkit` |
| Preview               | `npm run dev --workspace=@remnote/cosmic`                                    |
| RemNote adapter       | `npm run dev:remnote --workspace=@remnote/cosmic`                            |
| Format                | `npm run format --workspace=@remnote/cosmic`                                 |
| Check, build, test    | `npm run verify --workspace=@remnote/cosmic`                                 |
| Update screenshots    | `npm run test:update --workspace=@remnote/cosmic`                            |

Open the preview at http://127.0.0.1:4173. In RemNote, use Plugins → Build → Develop from localhost with http://127.0.0.1:8080. Disable other theme CSS while testing. Set `PORT` if 8080 is busy.

The adapter polls the compiled CSS and clears it on errors or deactivation. The ZIP contains no adapter code. Preview fixtures are synthetic. Check the real app in both modes and on mobile before release. Review new screenshots before accepting them.

Source order: tokens → RemNote mappings → components. Keep responsive rules with their component. Build output is in `themes/cosmic/dist/`.

Visual baselines target CI's Ubuntu 24.04 and the lockfile's Playwright Chromium.
System fonts differ across Linux distributions: do not replace these baselines
with Fedora/system-Chromium captures. For intentional visual changes, review all
four actual images and diffs in the `cosmic-test-results` CI artifact, copy the
approved actual images into the corresponding snapshot files, and rerun CI.
Soft screenshot assertions collect all four diffs; any mismatch still fails CI.
