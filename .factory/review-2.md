# Adversarial first-read review 2 — Mirrorbyte

Date: 2026-08-28

Reviewed URL: <https://duplicate-folder-finder-web.sociobot.in/>

Repository commit tested: `fdd83fe38613eb7556fdbcd7385d7fea2eeba7ec`

## Verdict: FAIL

Two findings are blocking: one declared claim command cannot run, and the mobile demo scrolls its required sandbox banner and controls out of view. Seven additional findings cover one unlisted claim, undersized touch targets, missing 404 metadata, and copy that is vague or uses unexplained terms.

## Cold first read

Fresh Chromium contexts were opened at 390×844 and 1440×900 before scrolling.

At 390 px, the first viewport shows `Compare folders and find exact duplicates.`, `For checking backups, old drives, or photo dumps without uploading files.`, `Try it with sample data`, its outcome text, and all three product facts. In my own words:

- What it does: compares folder contents and identifies exact duplicate folders.
- Who it is for: someone checking a backup, old drive, or photo dump without uploading files.
- What to click first: `Try it with sample data` to see a completed comparison; use `Choose folder A` later for real files.

The desktop first screen communicates the same answers and also shows the folder artwork and both folder selectors. This part passes. The 390 px page has no horizontal overflow and produced no console error.

## Findings

### B1 — BLOCKING: a listed claim test command fails in a clean clone

**Quote:** `.factory/claims.json` lists `npm test -- --grep @claim:single-folder-duplicates` for `Choosing Folder A alone finds exact duplicate subfolders inside that folder.`

**Evidence:** After `npm ci` in a clean clone at the reviewed commit, the exact command exits 1 before running the assertion:

```text
CACError: Unknown option `--grep`
```

Vitest accepts `-t`, not `--grep`. Running `npm test -- -t @claim:single-folder-duplicates` separately passes the intended test, but that does not make the published command valid.

**Why this misleads:** The registry tells a verifier that every promise has an executable test. This promise cannot be verified by following its listed command, so the claims contract fails even though the underlying behavior appears to work.

**Concrete fix:** Change the entry to `npm test -- -t @claim:single-folder-duplicates`. Add a contract test that executes every `claims.json` command, rather than only checking that its tag exists in source.

### B2 — BLOCKING: the demo banner is not persistent on a phone

**Quote:** `Demo — sample data, nothing is saved`, with `Reset demo` and `Start for real`.

**Evidence:** Clicking the first-screen sample action at 390×844 loads a realistic completed result in one click. The app then scrolls to the result at `scrollY: 1387`; the banner bounds are `top: -1323px`, entirely outside the viewport. The active screen shows `Comparison result` and `These folder trees do not fully match.` with no visible indication that this is sample data and no visible reset/exit controls. The mobile stylesheet changes `.demo-banner` from `position: sticky` to `position: relative`.

**Why this misleads:** The visitor lands inside a realistic result but cannot see that it is a sandbox. The controls required to reset or leave the demo are also absent from the screen being used. This fails the persistent-banner requirement and makes the demo state ambiguous.

**Concrete fix:** Keep the banner sticky at 390 px, including after the result auto-scroll. Add a test that enters the demo, waits for scrolling to finish, and asserts that the banner, `Reset demo`, and the renamed exit action all intersect the viewport.

### H1 — Unlisted claim: `Free to use.`

**Quote:** `Free to use. No account.`

**Why this may mislead:** `No account` is covered by `local-only`, but the price claim `Free to use` has no entry in `.factory/claims.json` and no tagged test.

**Concrete fix:** Either remove `Free to use.` or register a narrowly testable free-use claim and verify that the complete comparison/export workflow has no payment or account gate.

### M1 — Several mobile links are smaller than 44×44 px

**Quote/evidence:** At 390 px, the wordmark link is 234×25 px, the header `Demo` link is 31×44 px, and footer links are 22 px high. This repeats on `/`, `/demo`, `/privacy/`, `/terms/`, and the 404.

**Why this causes difficulty:** These controls do not meet the required minimum touch target, making taps less reliable for a phone visitor.

**Concrete fix:** Give every header/footer link an interactive box of at least 44×44 px using padding or `min-inline-size` and `min-block-size`. Add a mobile test that measures all visible links and buttons.

### M2 — The designed 404 omits required route metadata

**Quote/evidence:** `/not-a-real-route` correctly returns HTTP 404 with `Page not found — Mirrorbyte`, one h1, a description, favicon, shared header/footer, and a working recovery link. It has no canonical link, Open Graph fields, or Twitter card fields.

**Why this is incomplete:** The route breaks the metadata pattern used by the rest of the site and required by the site-structure contract.

**Concrete fix:** Give the 404 document a canonical `/404` URL plus route-specific OG/Twitter title, description, and product image metadata. Cover them in the route metadata test.

### M3 — `Start for real` does not name the result

**Quote:** `Start for real`

**Why this is unclear:** “Real” describes a mode, not what will happen. A visitor cannot tell whether it imports the sample, opens a folder picker, or only leaves the demo.

**Concrete fix:** Use `Compare my folders`. Keep the actual behavior of clearing demo storage and returning to the real workspace.

### M4 — `Discover` is not a self-contained heading

**Quote:** `Discover`

**Why this is unclear:** In a heading list, it does not say what is discovered. Its supporting sentence carries all of the meaning.

**Concrete fix:** Use `Read folder names and sizes`.

### M5 — `Chromium` and `quarantine` are unexplained in the README

**Quote:** `On supported Chromium browsers, Mirrorbyte can quarantine a reviewed duplicate.`

**Why this is unclear:** A non-technical visitor may not know whether their browser is Chromium-based or that “quarantine” means moving a copy into a holding folder.

**Concrete fix:** `In Chrome or Edge, Mirrorbyte can move a reviewed copy into a holding folder. It checks the copy before removing the original.`

### M6 — Folder hierarchy terms shift between the page and README

**Quote:** `inside one tree`, `folder trees`, `one-folder scan`, and `subfolders`.

**Why this is unclear:** The interface changes terms for the same nested-folder concept. “Tree” is also unnecessary technical shorthand in the result verdict.

**Concrete fix:** Use `folder` for the selected folder and `subfolder` for folders inside it. For example: `Choose A alone to find duplicate subfolders, or add B to compare two folders.` and `These folders do not fully match.`

## Copy audit

Word counts treat hyphenated terms and version/file tokens as one word and do not count standalone punctuation. No sentence exceeds 22 words, and no banned marketing adjective appears.

### Landing page and exercised demo sentences

This table covers the static landing copy, the quarantine dialog copy, and the sample-result/reset copy exercised in the review.

| Words | Sentence |
| ---: | --- |
| 6 | Compare folders and find exact duplicates. |
| 6 | Inspect sample folders and exact duplicates. |
| 6 | Demo — sample data, nothing is saved. |
| 6 | Photo archive compared with Backup drive. |
| 11 | For checking backups, old drives, or photo dumps without uploading files. |
| 6 | See a completed folder comparison now. |
| 5 | Files stay on this device. |
| 6 | Works offline after the first visit. |
| 3 | Free to use. |
| 2 | No account. |
| 16 | Choose A alone to find duplicates inside one tree, or add B to compare two trees. |
| 2 | No upload. |
| 2 | No account. |
| 2 | No tracking. |
| 3 | Reading folder names… |
| 3 | Preparing local scanner. |
| 5 | These folder trees match exactly. |
| 8 | Names, paths, sizes, and content hashes all agree. |
| 7 | Copies will be verified before originals move. |
| 9 | Mirrorbyte compares every file, then checks each parent folder. |
| 9 | A duplicate has the same complete structure and contents. |
| 9 | Read names and sizes from the folders you choose. |
| 6 | Check file contents inside your browser. |
| 10 | Export the report, or review a duplicate before moving it. |
| 9 | Compare folders and review exact duplicates in your browser. |
| 13 | Built by Param Factory · Version 1.0.0 · Original hero artwork generated with Azure OpenAI. |
| 4 | Move the reviewed copies? |
| 13 | Each folder will first be copied and re-hashed inside a timestamped `.mirrorbyte-quarantine-…` folder. |
| 6 | Only verified originals are then removed. |
| 12 | Reversible: restore a folder by moving it back in your operating system. |
| 4 | Mirrorbyte never empties quarantine. |
| 7 | These folder trees do not fully match. |
| 12 | Review items present on one side or changed at the same path. |
| 5 | Read-only selection; export this finding. |
| 7 | Demo reset to the original sample comparison. |

### README sentences

Code blocks, bare URLs, headings, and project-record link labels are not sentences and are excluded.

| Words | Sentence |
| ---: | --- |
| 11 | Mirrorbyte compares folders in the browser and finds exact duplicate subfolders. |
| 11 | It is for people checking backups, old drives, or photo archives. |
| 11 | Compares one folder or two folders by structure and file contents. |
| 10 | Finds exact duplicate subfolders and lists changed or one-sided files. |
| 8 | Exports the comparison report as JSON or CSV. |
| 13 | Stores the latest real report in the browser and restores it after refresh. |
| 6 | Works offline after the first visit. |
| 9 | Folder names, contents, and hashes stay in the browser. |
| 9 | There is no account, analytics, tracking, or third-party request. |
| 5 | Demo data uses separate storage. |
| 5 | Reset restores the shipped sample. |
| 7 | Starting for real removes the demo report. |
| 10 | On supported Chromium browsers, Mirrorbyte can quarantine a reviewed duplicate. |
| 8 | It verifies the copy before removing the original. |
| 6 | Browser and operating-system failures remain possible. |
| 8 | Keep a separate backup before moving valuable data. |
| 7 | Every product promise is registered in `.factory/claims.json`. |
| 10 | Each entry names its exact automated test and sandbox evidence. |
| 5 | Use Node.js 20 or newer. |
| 5 | Open the printed localhost URL. |
| 11 | Playwright 1.58.2 matches the browser bundle supplied by the factory worker. |
| 5 | The production build writes `dist/index.html`. |
| 13 | The service worker precaches the app, demo, legal pages, and designed 404 response. |
| 11 | Use the local parity server to verify deployment headers and routes. |
| 5 | Deploy the static `dist/` directory. |
| 12 | Azure Static Web Apps reads `staticwebapp.config.json` for routes, caching, and security headers. |

### Headings, controls, and terminology

The headline is six words and job-led. `Try it with sample data`, `Choose folder A`, `Choose folder B`, `Compare these folders`, `Import report`, `Reset demo`, `Cancel scan`, `Export JSON`, `Export CSV`, `Keep folders`, and `Copy, verify & move` name their action or result. Filter controls (`Duplicate folders`, `Only in A`, `Only in B`, `Changed`) correctly name the view they select.

The flagged exceptions are `Start for real` (M3), `Discover` (M4), unexplained `Chromium`/`quarantine` (M5), and shifting hierarchy terms (M6). No copy uses `leverage`, `seamless`, `effortless`, `robust`, `powerful`, `intuitive`, `reimagine`, `supercharge`, `unlock`, `delightful`, `journey`, `ecosystem`, or `AI-powered`.

## Claim execution

All eight exact commands from `.factory/claims.json` were run after `npm ci` in a clean clone of the reviewed commit.

| Claim | Result | Evidence |
| --- | --- | --- |
| `comparison-results` | PASS | One Chromium test passed; sample showed one `albums` pair, changed `receipts/2025.txt`, and backup-only `new/note.txt`. |
| `single-folder-duplicates` | **BLOCKING FAIL** | Exact command exited 1 with `CACError: Unknown option --grep`; no claim assertion ran. The corrected `-t` command passed separately. |
| `local-only` | PASS | One Chromium test passed; all captured requests through load/reset/results were same-origin. |
| `offline-reload` | PASS | One Chromium test passed; demo reloaded and reset offline. |
| `report-exports` | PASS | One Chromium test passed; downloaded JSON and CSV contained the expected duplicate/difference records. |
| `demo-isolation` | PASS | One Chromium test passed; reset/exit preserved the seeded real report and cleared the demo report. |
| `local-persistence` | PASS | One Chromium test passed; an imported real report returned after reload. |
| `quarantine-verification` | PASS | One Chromium test passed; corrupted copied bytes left the original in place. |

The live privacy exercise captured only `https://duplicate-folder-finder-web.sociobot.in` requests through entry, reset, and exit. A seeded `REAL_SENTINEL` report remained unchanged, and the demo report was gone after exit. The live `/demo` page also reloaded and reset with the browser offline after service-worker installation.

## Structure, accessibility, and visual checks

- `/`, `/demo`, `/privacy/`, and `/terms/` return 200 with route-specific titles, one h1, `lang="en"`, a main landmark, descriptions, canonical URLs, OG/Twitter metadata, favicon, and Apple touch icon.
- An unknown route returns the designed Mirrorbyte 404 with HTTP 404 and a working `Return to folder comparison` link. Its metadata omission is M2.
- In-app Demo navigation uses history. Back returns home, focuses the new h1, and updates the polite route announcer.
- Every discovered internal route/asset and the external `Source` link returned 200. There were no dead links.
- The factory `verify-url.sh` check passed with no console errors, one h1, `lang`, main, alt text, and labelled buttons. Axe reported no serious or critical violations on all five tested routes at 390 px. The touch-size exception remains M1.
- `prefers-reduced-motion` has an explicit fallback. The production app JavaScript is 8.89 kB gzip, below the static-product limit.
- The dark pixel/demoscene folder towers, cyan scan beam, amber mismatch marks, monospaced utility typography, and hard-edged controls are specific to this product. The site does not read as a generic SaaS template.
- The shared header/footer, privacy and terms links, sitemap, robots file, security headers, and restrictive same-origin CSP are present. No console or CSP errors appeared.

## Other verification

- Clean-clone `npm test`: 10/10 passed.
- Clean-clone `npm run build`: passed and produced `dist/`; app JS was 8.89 kB gzip.
- Clean-clone `npm run test:e2e`: 28/28 passed across desktop Chromium and the mobile project.
- Live cold-load verification: HTTP 200; measured load to `networkidle` was 612 ms in the factory verifier.

These passing checks do not override B1 or B2.
