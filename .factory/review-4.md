# Adversarial first-read review 4 — Mirrorbyte

Date: 2026-08-28  
Reviewed URL: <https://duplicate-folder-finder-web.sociobot.in/>  
Repository commit tested: `6ede53c0a8e0ba53c808cc1c437f4c8b98e31f9d`

## Verdict: PASS

There are zero findings. The deployed product is clear on a cold 390 px visit, the sample comparison is isolated and immediately useful, every registered claim passed from a clean clone, and all findings from reviews 1–3 are fixed in both the deployed artifact and source.

## Cold first read

Fresh Chromium contexts at 390×844 and 1440×900 were opened before scrolling.

- **What it does:** compares two folders, or one folder internally, and identifies exact duplicate subfolders and differences.
- **Who it is for:** people checking backups, old drives, or photo dumps without uploading files.
- **What to click first:** `Try it with sample data`; its adjacent copy says that it opens a completed comparison.

At 390 px the headline, audience sentence, primary action, outcome sentence, and three facts are all visible without horizontal overflow. The action occupies x=16–264 and y=309–361. The desktop first screen presents the same information and the real folder chooser. The pixel-directory towers, cyan scan bridge, hard edges, and restrained dark utility palette are distinct from a generic SaaS template and match the documented Mirrorbyte visual thesis.

## Copy audit

Word counts treat a hyphenated token and a product/version token as one word. The audit includes all visitor-facing sentences and sentence-like labels in the landing shell; numerical status placeholders and file names are excluded. No item exceeds 22 words. No banned marketing adjective, unexplained visitor-facing implementation term, inconsistent folder vocabulary, contextless heading, or non-result-naming action control was found.

### Landing page

| Words | Copy |
| ---: | --- |
| 4 | Skip to folder comparison |
| 2 | Offline ready |
| 5 | Compare folders on this device |
| 6 | Compare folders and find exact duplicates. |
| 11 | For checking backups, old drives, or photo dumps without uploading files. |
| 5 | Try it with sample data |
| 6 | See a completed folder comparison now. |
| 5 | Files stay on this device. |
| 6 | Works offline after the first visit. |
| 3 | No account required. |
| 2 | Choose folders |
| 4 | Choose folders to compare |
| 14 | Choose A alone to find duplicate subfolders, or add B to compare two folders. |
| 2 | Folder A |
| 3 | No folder selected |
| 3 | Choose folder A |
| 3 | Folder B (optional) |
| 5 | Optional for a one-folder scan |
| 3 | Choose folder B |
| 3 | Compare these folders |
| 5 | Try it with sample data |
| 2 | Import report |
| 2 | No upload. |
| 2 | No account. |
| 2 | No tracking. |
| 3 | Reading folder names… |
| 3 | Preparing local scanner |
| 2 | Cancel scan |
| 3 | Review comparison results |
| 2 | Comparison result |
| 1 | Identical |
| 5 | These folders match exactly. |
| 8 | Names, paths, sizes, and content hashes all agree. |
| 3 | Files in A |
| 3 | Files in B |
| 3 | Exact folder pairs |
| 2 | File differences |
| 2 | Duplicate folders |
| 3 | Only in A |
| 3 | Only in B |
| 1 | Changed |
| 2 | Export JSON |
| 2 | Export CSV |
| 3 | Review holding folder |
| 7 | Copies will be verified before originals move. |
| 3 | How duplicate checks work |
| 5 | How Mirrorbyte verifies duplicate folders |
| 9 | Mirrorbyte compares every file, then checks each parent folder. |
| 9 | A duplicate has the same complete structure and contents. |
| 5 | Read folder names and sizes |
| 9 | Read names and sizes from the folders you choose. |
| 2 | Compare contents |
| 6 | Check file contents inside your browser. |
| 2 | Review results |
| 10 | Export the report, or review a duplicate before moving it. |
| 9 | Compare folders and review exact duplicates in your browser. |
| 4 | Move the reviewed copies to a holding folder? |
| 9 | Each folder is copied into a dated holding folder. |
| 10 | Mirrorbyte checks the copy before removing the original. |
| 16 | To restore a moved folder, move it back from the holding folder in your operating system. |
| 9 | Mirrorbyte does not delete files from the holding folder. |
| 2 | Keep folders |
| 3 | Copy, verify & move |
| 13 | Built by Param Factory · Version 1.0.0 · Original hero artwork generated with Azure OpenAI. |

The demo adds `Inspect sample folders and exact duplicates.` (6), `Demo — sample data, nothing is saved` (6), `Photo archive compared with Backup drive.` (6), `Reset demo` (2), and `Compare my folders` (3). Its displayed result says `These folders do not fully match.` (7), with the concrete duplicate, changed-receipt, and backup-only note rows. The final footer statement is an asset-provenance disclosure also recorded in `.factory/design.md`, not a product-function claim.

### README

| Words | Sentence |
| ---: | --- |
| 11 | Mirrorbyte compares folders in the browser and finds exact duplicate subfolders. |
| 11 | It is for people checking backups, old drives, or photo archives. |
| 11 | Compares one folder or two folders by structure and file contents. |
| 10 | Finds exact duplicate subfolders and lists changed or one-sided files. |
| 8 | Exports the comparison report as JSON or CSV. |
| 13 | Stores the latest real report in the browser and restores it after refresh. |
| 12 | Works offline after the first visit, including the demo and legal pages. |
| 9 | Folder names, contents, and hashes stay in the browser. |
| 9 | There is no account, analytics, tracking, or third-party request. |
| 5 | Demo data uses separate storage. |
| 5 | Reset restores the shipped sample. |
| 7 | Compare my folders removes the demo report. |
| 14 | In Chrome or Edge, Mirrorbyte can move a reviewed copy into a holding folder. |
| 8 | It checks the copy before removing the original. |
| 8 | Move a held folder back to restore it. |
| 9 | Mirrorbyte does not delete files from the holding folder. |
| 6 | Browser and operating-system failures remain possible. |
| 8 | Keep a separate backup before moving valuable data. |
| 13 | The demo, legal pages, and designed not-found page reload after the first online visit. |

Terminology remains consistent: **folder**, **subfolder**, **report**, **holding folder**, and **demo**. Controls use named outcomes (`Export CSV`, `Compare these folders`, `Copy, verify & move`) rather than generic submissions.

## Demo and sandbox

`Try it with sample data` from the phone and desktop landing screens opened `/?demo=1` in one click. The first view already contained a completed comparison: `albums` is an exact pair, `receipts/2025.txt` is changed, and `new/note.txt` exists only in B. The persistent banner is visible, Reset works, and its mobile result placement leaves `Comparison result` at y=107 and the complete verdict at y=243, below the 98 px banner.

The source uses `mirrorbyte-demo` only while the banner is active. A live-browser check seeded `mirrorbyte-local`, entered and reset the demo, then chose `Compare my folders`: the seeded real record was unchanged and the demo record was absent. A request capture covering initial load and sample use recorded only the product origin. After service-worker installation, `/demo`, `/privacy/`, `/terms/`, and an unknown route reloaded offline; the unknown route retained HTTP 404 and the designed recovery page.

## Claims

`.factory/claims.json` contains ten functional, visitor-reliance claims. In a new temporary clone of this exact commit, after installing development dependencies, `npm run test:claims:contract` passed every manifest command verbatim:

| Claim id | Result |
| --- | --- |
| `comparison-results` | PASS |
| `single-folder-duplicates` | PASS |
| `local-only` | PASS |
| `offline-reload` | PASS |
| `report-exports` | PASS |
| `demo-isolation` | PASS |
| `local-persistence` | PASS |
| `quarantine-verification` | PASS |
| `holding-folder-restore` | PASS |
| `holding-folder-kept` | PASS |

The landing and README claims map to those entries: comparison behavior, local-only handling, offline scope, JSON/CSV exports, demo isolation, restored real reports, copy verification, restore, and holding-folder retention. No unlisted functional claim was found. The legal-page disclosures were also exercised by the same local-only, persistence, isolation, offline, and holding-folder tests.

## Earlier-finding audit

Every finding in each earlier review was rechecked on the live site and in source.

| Earlier id | Confirmation |
| --- | --- |
| Review 1 B1 | `/demo` and `?demo=1` are direct isolated sample entries with the banner, reset, exit/discard, and documented IndexedDB split. |
| Review 1 B2 | The registry has one executable tagged test for each listed claim; all ten pass. |
| Review 1 B3 | The 390 px first viewport exposes the job, audience, sample action, outcome, and facts. |
| Review 1 B4 | Demo and designed 404 load directly; a controlled unknown route retains status 404. |
| Review 2 B1 | The `single-folder-duplicates` command uses supported Vitest filtering and passed verbatim. |
| Review 2 B2 | The demo bar remains visible after mobile auto-scroll without covering the result title or verdict. |
| Review 2 H1, M1–M6 | Price marketing remains absent; mobile targets, 404 metadata, named exit action, self-contained headings, plain wording, and folder terminology all verify. |
| Review 3 F-3-1–F-3-2 | A one-folder report says `ONE-FOLDER SCAN`; customer copy says content hashes and holding folder, never the prior jargon. |
| Review 3 F-3-3 | The service worker wraps a cached unknown navigation in a 404 response; live offline testing confirms it. |
| Review 3 F-3-4 | Phone demo scroll clearance places the result heading and verdict beneath the banner. |
| Review 3 F-3-5 | Privacy entry and browser Back focus and announce the appropriate H1. |
| Review 3 F-3-6–F-3-7 | Restoration and no-held-file-deletion now have dedicated registry entries and passing fixtures. |
| Review 3 F-3-8–F-3-9 | Offline scope is tested through demo, legal pages, and 404; README makes no false registry-completeness assertion. |
| Review 3 F-3-10 | The keyboard/reset and disabled-during-scan paths passed in the full browser suite. |

## Structure, accessibility, and links

Live route checks confirm a unique title, one H1, description, canonical URL, Open Graph image, favicon, main landmark, consistent header/footer, and the correct 200/404 status on `/`, `/demo`, `/privacy/`, `/terms/`, and an unknown route. The route titles follow the required product pattern. Privacy entry and Back move focus to the route H1 and update the polite announcer. Crawling the product navigation, footer, recovery, and source links returned their expected success response; the 404 skip anchor is an in-document fragment on its current 404 document, not an outbound route.

`npm test`, `npm run build`, and `npm run test:e2e` passed in the clean clone. The last command passed all 44 Chromium/mobile tests, including the axe serious/critical accessibility check. Live browser sessions recorded no console errors on normal landing, demo, route, or offline flows.

## Missed leverage

No additional feature is expected by the brief and absent from the product. The app already supplies the valuable export/import path and a reversible holding-folder review. An AI feature would require transmitting names or content or adding optional key management without improving the core local comparison task; none is present.

## What would make this perfect

No product change is required for this review. Preserve the present claim-to-test contract when changing copy or behavior, and repeat the cold mobile/demo/offline checks on future releases.
