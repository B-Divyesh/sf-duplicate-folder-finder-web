# Adversarial first-read review 1 — Mirrorbyte

Date: 2026-08-28  
Reviewed URL: <https://duplicate-folder-finder-web.sociobot.in/>  
Repository base: `89cb3594e40311588dfe5396ba24fa846cfc6051`

## Verdict: FAIL

There are four blocking findings: no contract-compliant demo sandbox, no claims registry or claim tests, no usable first action in the 390px first viewport, and no `/demo` or designed 404 route. The product can scan its small sample and its offline app shell reloads, but those working paths do not make the first-time journey tryable or honest under the stated contract.

## Cold first read

Fresh Chromium contexts were opened at 390×844 and 1440×1000 before scrolling. At 390px, the first viewport shows the wordmark, `Offline ready`, the headline, explanatory copy, art, and the start of the A card. Neither `Choose folder A` nor `Try a tiny example` is visible or operable without scrolling.

My reading was: “This compares folders by content for someone checking backups, old drives, or photo dumps.” I could identify the intended real workflow only after reading the lower selector: choose folder A, optionally B, then scan. I could not identify what to click first from the mobile first screen because no action is visible. The exact text that fails to supply a first action is `Know which folders are truly the same.`; it describes an outcome, not the first step, and the required control is below the viewport.

At desktop width `Choose folder A` and `Try a tiny example` are visible below the hero. The first screen is visually distinctive and not a generic SaaS template: the pixel-art directory towers, cyan scan bridge, dark utility palette, and hard-edged controls follow `.factory/design.md`.

## Blocking findings

### B1 — The advertised sample is not a demo sandbox

**Quote/evidence:** The only sample action is `Try a tiny example`. `/demo` and `/demo/` both return a generic `404 Azure Static Web Apps - 404: Not found`. Opening `/?demo=1` returns the normal empty landing screen (the results section is hidden), with no `Demo — sample data, nothing is saved`, `Reset demo`, or `Start for real` text. `.factory/demo.md` is absent.

Clicking the sample action does show a credible used-product result immediately: it compares `Photo archive` and `Backup drive`, then reports a changed receipt, an extra file, and one exact `albums` pair. That part is useful. It is not isolated: in one fresh browser context, after running the sample at `/?demo=1`, navigating to `/` displayed the same saved result. Source and browser inspection show it writes the ordinary `mirrorbyte-local` IndexedDB database at `reports/latest`; no `demo:` namespace exists. There is no reset control.

**Why a visitor is lost or misled:** “Tiny example” gives no assurance that it is safe to try, and it leaves sample names/results in the same persisted “latest report” slot that real work uses. A visitor cannot enter a documented demo directly, tell they are in one, reset it, or return to a clean real workflow.

**Concrete fix:** Add `/demo` (and `?demo=1` only if it redirects into the same state) which loads and completes a realistic comparison before the visitor clicks anything else. Show a persistent `Demo — sample data, nothing is saved` banner with `Reset demo` and `Start for real`. Store demo state only in a separate `demo:` IndexedDB/OPFS/localStorage namespace, never read or write the real report while that banner is active, and discard it when leaving. Add `.factory/demo.md` documenting the URL, sample, reset behavior, and namespace. Add a browser test that starts with a real saved report, enters demo, scans/exports/resets, then proves the real record is unchanged.

### B2 — There is no claims registry, so every visitor-relevant promise is untested and unlisted

**Quote/evidence:** `.factory/claims.json` does not exist. Consequently there are no `@claim:` tests and no command entries to run from a clean clone. The root and README make material promises, including `Every byte stays on this device.`, `No upload. No account. No tracking.`, `Workers compute SHA-256 fingerprints without uploading.`, `Exports a portable JSON report or spreadsheet-friendly CSV.`, and `Saves the latest report in IndexedDB and works offline after the first visit.`

**Why a visitor is lost or misled:** These are reliance claims about privacy, safety, exports, and offline behavior. The release gives the visitor no verifiable contract tying them to a clean-sandbox test. The demo defect also means the required sandbox cannot currently prove them without touching the normal report slot.

**Concrete fix:** Create `.factory/claims.json` with one exact `@claim:<id>` test per claim, using only `/demo` from a fresh context. Include observable tests for sample result/export contents, same-origin-only requests throughout the demo flow, offline reload and sample scan after initial visit, local persistence behavior, and copy/hash verification before a quarantine removal. Remove or qualify any claim that cannot be tested.

The complete unlisted-claim inventory found in the live landing and README is below; each item needs its own registry entry/test or removal.

| Location | Unlisted claim-like copy |
| --- | --- |
| Landing | `Local only`; `Offline ready`; `Compare backups, old drives, and photo dumps by their actual contents—not just names or dates.`; `Every byte stays on this device.` |
| Landing | `Choose A alone to find duplicates inside one tree, or add B to compare two trees.`; `No upload.`; `No account.`; `No tracking.` |
| Landing | `Names, paths, sizes, and content hashes all agree.`; `Copies will be verified before originals move.`; `A folder is called a duplicate only when the complete structure and contents match.` |
| Landing | `Workers compute SHA-256 fingerprints without uploading.`; `Export proof, or copy duplicates to a reversible holding folder.`; `Each folder will first be copied and re-hashed … Only verified originals are then removed.`; `Mirrorbyte never empties quarantine.` |
| README | All six `What it does` bullets: single-tree duplicate detection; SHA-256/Merkle hashing; classification; difference lists; JSON/CSV export; and verified quarantine/removal. |
| README | `Saves the latest report in IndexedDB and works offline after the first visit.`; `Folder names, file contents, and hashes are never sent to a server.`; `There are no accounts, analytics, third-party scripts, or CDN assets.` |
| README | Chromium full workflow/quarantine support; Firefox/Safari fallback limits; all four quarantine safeguards; secure-localhost API availability; cache/security-header behavior; and `The build generates a versioned service worker and precaches the complete app shell.` |

### B3 — The 390px first screen has no visible first action

**Quote/evidence:** At 390×844, `Choose folder A` is below the bottom edge and `Try a tiny example` is further below. The visible headline is `Know which folders are truly the same.` and the only next-step text in view is the non-action heading `Choose the folders to inspect`; the action itself is not available.

**Why a visitor is lost or misled:** On the stated phone/30-second first visit, the page explains an outcome but fails the mandatory “what should I click first?” test before scrolling. The high-value safe trial path is both below the fold and named as a “tiny example,” rather than clearly as sample data.

**Concrete fix:** Put the primary `Try it with sample data` button in the hero at 390px, with adjacent text such as `See a completed folder comparison now.` Keep `Choose folder A` as the real alternative. Make the headline `Compare folders and find exact duplicates.` and use the supporting line `For checking backups, old drives, or photo dumps without uploading files.`

### B4 — Required routes are broken and the 404 is an Azure template

**Quote/evidence:** `GET /demo` and `GET /demo/` return HTTP 404 with title `Azure Static Web Apps - 404: Not found`; an arbitrary bad URL returns the same response. The sitemap has only `/`, `/privacy/`, and `/terms/`. There is no app-owned 404, no demo route, no demo-specific title, and no route-change focus/announcement behavior to exercise.

**Why a visitor is lost or misled:** A direct demo link—the documented verifier/catalog entry point—fails. A mistyped URL abandons the product’s visual identity and gives no way back. This also violates the required real-URL route structure.

**Concrete fix:** Ship `/demo` with title `Demo — Mirrorbyte`, a dedicated h1 and focus target. Configure an app-owned 404 that uses the Mirrorbyte design and offers `Return to folder comparison`; ensure deep links/reloads work, Back restores the prior state, and route changes focus/announce the new h1. Add `/demo` to sitemap and route tests.

## Other findings

### M1 — Required social and install metadata is incomplete

**Evidence:** Home, Privacy, and Terms have `lang`, title, a single h1, description, canonical URL, and SVG favicon. The home title (`Mirrorbyte — Find duplicate folders locally`) is within the required pattern. However, the live root has no Open Graph tags, no Twitter card tags, no 1200×630 product image, and no `apple-touch-icon` link. `/icons/icon-180.png` is 404.

**Fix:** Add route-specific OG/Twitter title/description/image metadata, an original 1200×630 image derived from the directory-tower art, and a real 180px Apple touch icon/link. Test each route’s metadata.

### M2 — Header/footer skeleton differs by route and has no demo navigation

**Evidence:** The home header includes `Local only` plus `Offline ready`; legal headers include only `Offline ready`. The home footer includes `Source` and the AI-art provenance line; legal footers omit both. No header exposes a Demo link, and the home header has no navigation landmark.

**Fix:** Use one header/footer component on all routes: wordmark home link, skip link, compact nav including Demo and Privacy, and a footer with the same one-line description, Privacy, Terms, `Built by Param Factory`, version/build id, source/provenance disclosure where required.

## Copy audit

Word counts use whitespace-delimited words with hyphenated compounds counted as one. The landing table covers all static sentence-like visitor copy in `index.html`, including the hidden result/dialog placeholders; labels, headings without sentence punctuation, and buttons are audited immediately after it. The README table covers every prose/bullet sentence, excluding code blocks, commands, and link labels.

### Landing sentences

| Words | Sentence |
| ---: | --- |
| 13 | Compare two folder trees locally, find exact duplicate folders, and quarantine copies safely. |
| 7 | Know which folders are truly the same. |
| 16 | Compare backups, old drives, and photo dumps by their actual contents—not just names or dates. |
| 6 | Every byte stays on this device. |
| 5 | Choose the folders to inspect. |
| 16 | Choose A alone to find duplicates inside one tree, or add B to compare two trees. |
| 2 | No upload. |
| 2 | No account. |
| 2 | No tracking. |
| 3 | Reading folder names. |
| 3 | Preparing local scanner. |
| 5 | These folder trees match exactly. |
| 8 | Names, paths, sizes, and content hashes all agree. |
| 7 | Copies will be verified before originals move. |
| 15 | Mirrorbyte builds a fingerprint for every file, then rolls those fingerprints into each parent folder. |
| 14 | A folder is called a duplicate only when the complete structure and contents match. |
| 9 | Read names and sizes from the folders you choose. |
| 6 | Workers compute SHA-256 fingerprints without uploading. |
| 10 | Export proof, or copy duplicates to a reversible holding folder. |
| 6 | Private folder comparison in your browser. |
| 9 | Hero artwork generated for this product with Azure OpenAI. |
| 3 | Move reviewed copies? |
| 13 | Each folder will first be copied and re-hashed inside a timestamped mirrorbyte-quarantine folder. |
| 6 | Only verified originals are then removed. |
| 11 | Restore a folder by moving it back in your operating system. |
| 4 | Mirrorbyte never empties quarantine. |

### README sentences

| Words | Sentence |
| ---: | --- |
| 15 | Mirrorbyte compares one or two folder trees in the browser and identifies exact duplicate directories. |
| **24** | It is for people checking backups, reconciling old drives, or cleaning photo and document archives without installing a desktop utility or uploading private files. |
| 15 | Reads a single folder to find duplicate subfolders, or compares folder A with folder B. |
| 13 | Hashes file content locally with SHA-256 workers and builds deterministic folder-level Merkle signatures. |
| 15 | Classifies two roots as identical, A contained in B, B contained in A, or different. |
| 14 | Lists files only on one side, same-path changed files, and exact matching folder pairs. |
| 8 | Exports a portable JSON report or spreadsheet-friendly CSV. |
| 21 | On supporting Chromium browsers, copies selected duplicates into a timestamped quarantine folder, verifies the copy, and only then removes the original. |
| 13 | Saves the latest report in IndexedDB and works offline after the first visit. |
| 12 | Folder names, file contents, and hashes are never sent to a server. |
| 10 | There are no accounts, analytics, third-party scripts, or CDN assets. |
| 15 | Chrome, Edge, and other Chromium browsers provide the full File System Access workflow, including quarantine. |
| **29** | Firefox and Safari use the directory-input fallback: scanning and exports work, but the selection is read-only and empty folders that contain no files cannot be observed by that fallback. |
| 4 | Quarantine is deliberately conservative. |
| **31** | Root folders cannot be selected, nested selections are prevented, write permission is requested only after confirmation, and a copied folder must reproduce the scan-time Merkle hash before its original is removed. |
| 8 | Keep an independent backup before reorganizing valuable data. |
| 6 | Requires Node.js 20 or newer. |
| 5 | Open the printed localhost URL. |
| 13 | Localhost is a secure browser context, so directory and cryptographic APIs are available. |
| 6 | The static deploy artifact is dist. |
| **30** | It includes staticwebapp.config.json, which is required for the Static Web Apps deployment: content-fingerprinted assets receive one-year immutable caching, while HTML, the manifest, and sw.js use safe revalidation. |
| 12 | The same configuration supplies the restrictive same-origin CSP, frame protection, and Permissions-Policy. |
| 12 | Serve the artifact with the provided parity host when testing headers locally. |
| 13 | The build generates a versioned service worker and precaches the complete app shell. |

### Copy findings and proposed rewrites

Each row is a separate copy finding. The four bold README counts above exceed the 22-word cap.

| Severity | Quote | Finding | Proposed rewrite |
| --- | --- | --- | --- |
| High | `Know which folders are truly the same.` | Outcome-led, not the job in the visitor’s words; it does not mention comparison or duplicates. | `Compare folders and find exact duplicates.` |
| Medium | `// folder reconciliation utility` | `reconciliation` and `utility` are jargon; the label makes no sense without context. | `// compare folders on this device` |
| Medium | `Original / primary` and `Backup / candidate` | Slash labels introduce four competing names for A/B. | `Folder A` and `Folder B (optional)` |
| High | `Try a tiny example` | Does not say sample data, isolation, or outcome; it is the wrong primary-demo wording. | `Try it with sample data` with adjacent `See a completed comparison now.` |
| Medium | `Scan locally` | Verb names a mechanism, not the result. | `Compare these folders` |
| Medium | `01 / SELECT`, `02 / REVIEW`, `SAFETY MODEL`, `03 / QUARANTINE` | Stage labels are fragmentary and do not make sense in a screen-reader heading list. | Use `Choose folders`, `Review comparison results`, `How duplicate checks work`, and `Review folder quarantine`. |
| Medium | `Proof before cleanup.` | Vague heading; a visitor cannot know what is proved. | `How Mirrorbyte verifies duplicate folders` |
| Medium | `fingerprint`, `SHA-256`, `Merkle signatures`, `IndexedDB`, `CSP`, `Permissions-Policy` | Unexplained jargon appears in customer-facing copy/README. | Say `matching file contents`, `saved browser report`, and `browser security settings`; keep implementation terms only in a clearly marked technical section. |
| Medium | `folder trees`, `directories`, `subfolders`, `roots` | The same concept changes names across landing and README. | Use `folders and subfolders` for visitor copy; define `folder tree` once only if needed. |
| Medium | README 24-word audience sentence | Exceeds the 22-word cap. | `For people checking backups, old drives, photo archives, or document archives without installing software or uploading files.` |
| Medium | README 29-word Firefox/Safari sentence | Exceeds the 22-word cap and piles several limitations together. | `Firefox and Safari use folder upload. Scans and exports work. Empty folders are not visible, and selections are read-only.` |
| Medium | README 31-word quarantine sentence | Exceeds the cap and buries a safety condition. | `You cannot select root or nested folders. Mirrorbyte asks before write access. It removes an original only after the copy matches.` |
| Low | README 30-word deploy-artifact sentence | Exceeds the cap; deployment implementation belongs in a technical subsection. | `The deploy artifact is dist. Hashed assets cache for one year. HTML, the manifest, and sw.js revalidate safely.` |

## Verification evidence

- Fresh live browser contexts: 390×844 and 1440×1000; no console or page errors during cold load/sample flow.
- Live sample at `/?demo=1`: produced the used-product comparison result immediately after click; requests during the flow were same-origin only. This is supporting observation, not a registered claim test.
- Live service-worker exercise: after `navigator.serviceWorker.ready` reported a controlled page, an offline reload returned the h1 successfully.
- Route crawl: `/`, `/privacy/`, `/terms/`, `robots.txt`, sitemap, manifest, SVG favicon, and the GitHub Source link returned 200. `/demo`, `/demo/`, and `/not-a-real-route` returned the generic 404. Privacy and Terms have title/description/canonical/one h1; home/Privacy/Terms have a main landmark.
- Clean dependency install: `npm ci` completed with 0 vulnerabilities. `npm test` passed 9/9. `npm run build` passed and produced `dist/`. The first `npx playwright test --workers=1` could not launch because package `@playwright/test` resolves to 1.62 while the supplied browser was 1.58; after the documented `npx playwright install chromium`, the repository E2E suite passed 8/8. This is not a substitute for the absent claim tests.

The site does not use a generic visual template; this is not a finding. The verdict remains FAIL because the blocking items above are unresolved.
