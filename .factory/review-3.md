# Adversarial first-read review 3 — Mirrorbyte

Date: 2026-08-28

Reviewed URL: <https://duplicate-folder-finder-web.sociobot.in/>

Repository commit tested: `aa833a475c837ebfabab871f7281eedbfee84fed`

## Verdict: FAIL

The first screen, core demo, eight registered claims, build, privacy isolation, offline demo, metadata, dead links, accessibility scan, and visual identity all pass. The release still has ten findings. Three are blocking because earlier routing and copy findings are only partly fixed. The mobile demo also hides its result heading under the repaired sticky banner, two safety promises remain outside the claims registry, legal-route focus is not managed, an offline README promise is unlisted, README falsely says every promise is registered, and the browser suite has a reproducible race.

## Cold first read

Fresh Chromium contexts were opened at 390×844 and 1440×900 before scrolling.

At both sizes, my reading was:

- What it does: compares folder contents and identifies exact duplicate folders.
- Who it is for: someone checking backups, old drives, or photo dumps without uploading files.
- What to click first: `Try it with sample data` to see a completed comparison.

At 390 px, the headline, audience sentence, sample action, its result sentence, and all three facts end at 467 px. The page has no horizontal overflow. At desktop size, the same information and both folder selectors are visible. This check passes.

## Findings

### F-3-1 — BLOCKING — Review 2 M6 is only partly fixed

**Quote/location:** A live imported single-folder report displays `ONE-ROOT SCAN`. The shipped HTML also contains `Optional for a one-root scan`; JavaScript replaces it with `Optional for a one-folder scan` after startup. Source: `index.html` and `verdictFor()` in `src/app.ts`.

**Why this fails:** Review 2 M6 required one visitor term for the hierarchy and specifically replaced “root”/“tree” with “folder”/“subfolder.” “Root” is still technical shorthand, and the initial HTML and runtime result use different terms. The repair record incorrectly says this is complete.

**Concrete fix:** Change the verdict label to `ONE-FOLDER SCAN`, change the HTML fallback to `Optional for a one-folder scan`, and add a test that imports a single-folder report and rejects visitor-facing `root` or `tree` wording.

### F-3-2 — BLOCKING — Review 1’s jargon/terminology copy finding has regressed

**Quote/location:** The live identical-result path renders `Names, paths, sizes, and SHA-256 content hashes all agree.` The landing document also exposes `Review quarantine`, `Close quarantine review`, `REVIEW FOLDER QUARANTINE`, and `Mirrorbyte never empties quarantine.` README instead calls this a `holding folder`.

**Why this fails:** Review 1 required unexplained `SHA-256` and `quarantine` to be removed or explained, and one term to be used for one concept. The polish record says visitor copy now uses “content hashes” and “holding folder,” but the live result and source do not. A first-time visitor should not need cryptography or file-recovery jargon to understand a safety action.

**Concrete fix:** Render `Names, paths, sizes, and content hashes all agree.` Use `holding folder` in the button, dialog label, status, and errors; keep the actual `.mirrorbyte-quarantine-…` directory name only where the exact on-disk name is needed. Extend the copy test to exercise an identical imported report and the writable-folder review dialog.

### F-3-3 — BLOCKING — Review 1 B4 regresses after service-worker installation

**Quote/location:** A cold request to `/not-a-real-route` returns the designed 404 with HTTP 404. After visiting `/`, installing the service worker, and reloading under service-worker control, navigating to the same unknown URL returns HTTP **200** while showing `This folder path ends here.` In `scripts/build-sw.mjs`, unknown navigation uses the precached `/404.html` response, whose cached status is 200.

**Why this fails:** The earlier broken-route finding required a real designed 404. Returning success for an unknown route makes routing state inaccurate after the first visit and can mislead clients that inspect status. This is a half-fixed prior finding and therefore blocking under this review order.

**Concrete fix:** For unknown navigations, wrap the cached 404 body in a `Response` with status 404 while preserving its content type and headers. Add a browser test that installs the service worker, reloads until controlled, then asserts an unknown navigation returns 404 online and renders the designed page.

### F-3-4 — High — The sticky demo banner hides the result heading and verdict on a phone

**Quote/location:** After one click at 390×844, the sticky demo banner occupies y=0–98. `Comparison result` is above the viewport and `These folders do not fully match.` is at y=-5–42, fully behind the banner. The first visible text below the banner is the clipped final word `path.` followed by summary counts.

**Why this fails:** The sample is realistic and the result rows are visible, but the first demo screen suppresses the result’s name and conclusion. The persistent-banner repair did not reserve space for the scroll target.

**Concrete fix:** Give the results scroll target a sticky-header offset, such as `scroll-margin-top` equal to the mobile banner height, and assert that `Comparison result` and the full verdict are below the banner after the one-click entry.

### F-3-5 — High — Privacy/Terms navigation and Back leave focus on `<body>`

**Quote/location:** Clicking the live header `Privacy` link from `/` loads `/privacy/` with `document.activeElement === document.body`. Browser Back returns to `/` with focus still on `<body>`. `src/legal.ts` has no route-focus or announcement handling; only the in-document `/` ↔ `/demo` flow focuses its h1.

**Why this fails:** Keyboard and screen-reader users receive the required focus/announcement behavior only for Demo, not for all real routes. This is incomplete route behavior under the site-structure contract.

**Concrete fix:** On legal and 404 document navigation, focus the route h1 after load or implement consistent client routing with a polite route announcement. Add forward and Back assertions for Privacy and Terms, not only Demo.

### F-3-6 — High — The restore promise is not registered as a claim

**Quote/location:** Landing dialog: `Reversible: restore a folder by moving it back in your operating system.` No `.factory/claims.json` entry tests restoration.

**Why this fails:** “Reversible” is a safety promise a visitor may rely on before moving files. `quarantine-verification` tests copy verification and preservation on failure, not restoration after a successful move.

**Concrete fix:** Add a claim and a File System Access fixture that completes a move, moves the held folder back, and verifies the original bytes/path; otherwise remove `Reversible` and state only the behavior the app verifies.

### F-3-7 — High — The no-deletion promise is not registered as a claim

**Quote/location:** Landing dialog: `Mirrorbyte never empties quarantine.` No claim entry or tagged test covers this statement.

**Why this fails:** This is another safety promise separate from “verify before removing the original.” The current quarantine claim does not prove that the app never deletes held copies.

**Concrete fix:** Rename it consistently to `Mirrorbyte does not delete files from the holding folder`, register it, and add a test that checks every holding-folder action exposed after a successful move; or remove the promise.

### F-3-8 — Medium — README makes an unlisted offline-scope claim

**Quote/location:** README: `The service worker precaches the app, demo, legal pages, and designed 404 response.` The `offline-reload` claim test checks `/demo` only.

**Why this fails:** The sentence promises offline coverage for legal pages and the 404 response that the registered test does not exercise. It is an unlisted claim even though the build currently includes those files.

**Concrete fix:** Either expand the offline claim and tagged test to open `/privacy/`, `/terms/`, and an unknown route while offline, or rewrite the README to the tested scope: `The demo reloads after the first online visit.`

### F-3-9 — Medium — README’s claim-registry completeness statement is false

**Quote/location:** README: `Every product promise is registered in .factory/claims.json.` F-3-6, F-3-7, and F-3-8 identify promises that are not registered.

**Why this fails:** This statement asks maintainers and reviewers to trust a completeness guarantee that the current manifest does not meet.

**Concrete fix:** Remove the sentence until the missing promises are registered and tested. If retained afterward, add a copy-to-manifest contract that inventories claim-bearing UI/README text instead of checking tags alone.

### F-3-10 — Medium — The keyboard E2E check is reproducibly flaky

**Quote/location:** `npm run test:e2e` failed 1 of 32 tests at `tests/e2e/app.spec.ts:89`: `Demo reset to the original sample comparison.` was not found. Repeating that test ten times failed once again (9 pass, 1 fail). The test calls `.focus()` while Reset can still be disabled during automatic sample scanning, so Enter sometimes does nothing.

**Why this fails:** The user-facing keyboard path works once the demo is ready, but the suite does not reliably prove it. A green or red release result depends on timing.

**Concrete fix:** Wait for the completed sample and `Reset demo` to be enabled before focusing and pressing Enter. Keep a separate assertion that disabled controls cannot be activated during scanning.

## Copy audit

Counts ignore standalone punctuation and treat hyphenated/file tokens as one word. Headings and controls are listed after the sentence tables. No sentence exceeds 22 words and no banned marketing adjective appears.

### Landing, demo, and result sentences

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
| 3 | No account required. |
| 14 | Choose A alone to find duplicate subfolders, or add B to compare two folders. |
| 2 | No upload. |
| 2 | No account. |
| 2 | No tracking. |
| 3 | Reading folder names… |
| 3 | Preparing local scanner. |
| 5 | These folders match exactly. |
| 8 | Names, paths, sizes, and content hashes all agree. |
| 9 | Names, paths, sizes, and SHA-256 content hashes all agree. |
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
| 7 | These folders do not fully match. |
| 12 | Review items present on one side or changed at the same path. |
| 5 | Read-only selection; export this finding. |
| 7 | Everything in A is present in B. |
| 4 | B has additional items. |
| 9 | Review them before treating B as a clean backup. |
| 7 | Everything in B is present in A. |
| 4 | A has additional items. |
| 8 | B is not a complete copy of A. |
| 5 | Exact duplicate folders were found. |
| 5 | No duplicate folders were found. |
| 11 | Only non-nested folders with matching full structures and content are paired. |
| 7 | No exact duplicate folders in this scan. |
| 6 | No files exist only in A. |
| 6 | No files exist only in B. |
| 6 | No same-path files have changed content. |
| 7 | Demo reset to the original sample comparison. |

### Conditional status and error sentences

Template values such as `{folder}` count as one word.

| Words | Sentence |
| ---: | --- |
| 5 | Selected with {count} unreadable item(s). |
| 7 | They will be listed in the report. |
| 5 | Could not open folder {side}. |
| 7 | Try the folder-upload fallback in another browser. |
| 5 | Choose folder A first. |
| 4 | Folder B is optional. |
| 5 | Secure hashing is unavailable here. |
| 7 | Open Mirrorbyte over HTTPS or on localhost. |
| 4 | Scan cancelled. |
| 4 | No files were changed. |
| 3 | The scan stopped. |
| 9 | Choose either {folder} or {folder}; nested folders move together. |
| 6 | Folder {side} is no longer writable. |
| 5 | Re-select it and scan again. |
| 8 | Write access to folder {side} was not granted. |
| 3 | Nothing was moved. |
| 5 | Moved {count} folder into {folder}. |
| 4 | Re-scan to refresh results. |
| 2 | Quarantine stopped. |
| 6 | This is not a Mirrorbyte v1 report. |
| 2 | Report imported. |
| 11 | File actions stay disabled until you re-select and scan the folders. |
| 5 | Could not import that report. |
| 5 | An unexpected error occurred. |
| 5 | Offline setup could not finish. |
| 7 | Scanning still works while this page stays open. |
| 7 | Mirrorbyte was updated for offline use. |
| 6 | The selected root cannot be quarantined. |
| 4 | Choose a duplicate subfolder. |
| 4 | Folder path is invalid. |
| 2 | Verification failed. |
| 12 | The original was left in place; a partial copy may exist in {folder}. |

### README sentences

Code blocks, commands, bare URLs, and project-record link labels are excluded.

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
| 7 | Compare my folders removes the demo report. |
| 14 | In Chrome or Edge, Mirrorbyte can move a reviewed copy into a holding folder. |
| 8 | It checks the copy before removing the original. |
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

### Copy flags

- No sentence exceeds 22 words. No banned marketing adjective is present.
- F-3-1 flags `root` and the `ONE-ROOT SCAN` label as inconsistent technical terminology.
- F-3-2 flags unexplained `SHA-256` and inconsistent `quarantine`/`holding folder` wording.
- `Try it with sample data`, `Choose folder A`, `Choose folder B`, `Compare these folders`, `Import report`, `Reset demo`, `Compare my folders`, `Cancel scan`, `Export JSON`, `Export CSV`, `Keep folders`, and `Copy, verify & move` name their action or result.
- `Review quarantine` begins with a result-oriented verb but fails the terminology check in F-3-2. Filter buttons name the result view they select and are not submission controls.
- The h1/h2/h3 headings make sense out of context. `ONE-ROOT SCAN` is a result label rather than a heading, but still fails plain wording.

## Demo and sandbox verification

- One click on `Try it with sample data` changes the URL to `/?demo=1`, changes the title/h1, and renders `Photo archive` against `Backup drive` with one matching `albums` folder, a changed receipt, and a backup-only note.
- The `Demo — sample data, nothing is saved` banner, `Reset demo`, and `Compare my folders` remain visible at 390 px after auto-scroll.
- Reset restores the original sample. Leaving the demo clears the demo report.
- In a fresh live context, a `REAL_SENTINEL` record in `mirrorbyte-local` survived demo reset and exit; `mirrorbyte-demo/reports/latest` was absent afterward.
- Every captured request during live entry/reset/exit was same-origin.
- After service-worker installation, `/demo` reloaded and Reset completed with the browser offline.
- F-3-4 remains because the sticky banner covers the result heading and verdict.

## Claims execution

All exact commands in `.factory/claims.json` were executed by `npm run test:claims:contract` after `npm ci` in a clean clone of commit `aa833a4`.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `comparison-results` | PASS | Sample duplicate, changed receipt, and backup-only note asserted. |
| `single-folder-duplicates` | PASS | Synthetic matching subfolders asserted with the listed Vitest command. |
| `local-only` | PASS | Complete demo request capture remained same-origin. |
| `offline-reload` | PASS | Demo reloaded and reset offline after installation. |
| `report-exports` | PASS | JSON and CSV contents asserted. |
| `demo-isolation` | PASS | Real sentinel preserved and demo report cleared. |
| `local-persistence` | PASS | Imported real report restored after reload. |
| `quarantine-verification` | PASS | Corrupt copied bytes left the original in place. |

No listed claim test failed. F-3-6, F-3-7, and F-3-8 are unlisted product claims; F-3-9 is a false claim-registry completeness statement.

## Earlier-finding audit

| Earlier finding | Status now | Live and source evidence |
| --- | --- | --- |
| Review 1 B1 — demo sandbox | Fixed | One-click populated demo; separate DB; reset and exit verified live. |
| Review 1 B2 — claims registry | Fixed | Eight exact commands pass from a clean clone. |
| Review 1 B3 — mobile first action | Fixed | Sample action ends at y=361 in the 390×844 cold viewport. |
| Review 1 B4 — demo/404 routing | **Regressed** | `/demo` works, but a service-worker-controlled unknown route returns 200; F-3-3. |
| Review 1 M1 — social/install metadata | Fixed | Required metadata and assets exist on all tested routes. |
| Review 1 M2 — shared skeleton | Fixed | Header/footer/nav are consistent and all exposed links resolve. |
| Review 1 copy — headline/CTA/labels/long README sentences | Fixed | Job-led headline, explicit sample action, and no >22-word sentence. |
| Review 1 copy — jargon/terminology | **Regressed** | `SHA-256`, `quarantine`, and `root` remain customer-facing; F-3-1/F-3-2. |
| Review 2 B1 — invalid claim command | Fixed | Exact command contract passes all eight entries. |
| Review 2 B2 — persistent demo banner | Fixed | Banner and controls remain in the mobile viewport; F-3-4 records the new overlap defect. |
| Review 2 H1 — unlisted free claim | Fixed | `Free to use.` is absent. |
| Review 2 M1 — touch targets | Fixed | Existing mobile regression passes across five routes. |
| Review 2 M2 — 404 metadata | Fixed | Canonical, OG, Twitter, favicon, and Apple icon are present. |
| Review 2 M3 — vague demo exit | Fixed | Button is `Compare my folders`. |
| Review 2 M4 — fragmentary heading | Fixed | Heading is `Read folder names and sizes`. |
| Review 2 M5 — README jargon | Fixed | README names Chrome/Edge and explains the holding folder. |
| Review 2 M6 — hierarchy terms | **Half-fixed** | Live result still says `ONE-ROOT SCAN`; F-3-1. |

## Structure, accessibility, links, and visual identity

- `/`, `/demo`, `/privacy/`, and `/terms/` return 200 with route-specific titles, one h1, `lang="en"`, one main, descriptions, canonicals, OG/Twitter data, SVG favicon, and Apple icon.
- A fresh unknown request returns HTTP 404 and the designed page. F-3-3 records the post-service-worker status regression.
- Every exposed internal link and the GitHub Source link returned 200. The tested unknown route intentionally returns 404.
- `/` ↔ `/demo` uses History API, Back restores the route, and the h1 receives focus. F-3-5 records the missing behavior for legal routes.
- The factory live verifier passed with no console error, one h1, `lang=en`, a main landmark, no missing image alt, and no unlabeled button.
- Live Axe checks found no serious or critical violation on `/`, `/demo`, `/privacy/`, `/terms/`, or the designed 404 at 390 px.
- Reduced-motion rules and visible focus styling are present. Built app JavaScript is 8.88 kB gzip.
- The pixel/demoscene folder towers, ink/cyan/amber palette, hard-edged panels, monospace labels, and scan motif remain product-specific. This is not a generic SaaS template.

## Missed leverage

No missing AI feature is indicated. Duplicate detection is deterministic hashing; adding model output would weaken the local/offline trust model without improving the core decision. JSON/CSV export and JSON import already cover the obvious handoff need. Cloud sync would conflict with the product’s local-only promise unless introduced as a separate explicit opt-in.

## Other verification

- Clean clone `npm ci`: PASS, 0 vulnerabilities.
- Clean clone `npm test`: PASS, 10/10.
- Clean clone `npm run build`: PASS; `dist/` produced, app JS 8.88 kB gzip.
- Clean clone exact claim contract: PASS, 8/8.
- Clean clone `npm run test:e2e`: FAIL, 31/32; see F-3-10.
- Isolated keyboard-test repetition: 9/10 pass; see F-3-10.
- Live factory URL verifier: PASS, load 981 ms, no console errors.

## What would make this perfect

Resolve F-3-1 through F-3-10, then rerun the entire clean-clone claim contract and browser suite. The acceptance run must show one vocabulary (`folder`/`subfolder`/`holding folder`), no unexplained algorithm term, a service-worker-controlled 404 that remains HTTP 404, an unobscured mobile verdict, h1 focus across all routes and Back, registered tests for every safety/offline promise, a truthful README, and a repeatably green keyboard test. Nothing else remains from this review once those checks pass.
