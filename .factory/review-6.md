# Compare folders and find exact duplicates — review 6

Date: 2026-09-06  
Work order: `duplicate-folder-finder-web-review-6`  
Live URL: <https://duplicate-folder-finder-web.sociobot.in>  
Implementation candidate: `e287789442e0d2cb059ebed3c11cabb6d55d7375`  
Test-only follow-up: `bcab01e95d0cd23b2ea95baad9dabae580fffb0f`  
Documentation base reviewed: `696355833479bf20e4ede556a0dceeb0f2c2d0bd`

## Verdict

**FAIL — 1 finding and 0 untested claims.**

The comparison, demo, privacy, offline, route, accessibility, performance, and deployment checks pass. The release does not receive a PASS because a route-completion focus race intermittently steals focus from **Reset demo**, so a keyboard Enter press does nothing.

## Finding

### F-6-1 — Medium — Demo route focus can cancel a keyboard reset

On a clean checkout, `npm run test:e2e` failed 1 of 46 checks. The mobile `keyboard skip link and demo reset controls remain operable` check focused **Reset demo**, pressed Enter, and never received `Demo reset to the original sample comparison.` The failure snapshot showed the page H1 as the active element instead of the button.

A focused stress run reproduced the issue 4 times in 40 runs with two workers: one desktop failure and three phone failures. All four snapshots again showed the H1 as active. This is timing-sensitive: the same check passed 20 of 20 times with one local worker and 15 of 15 times in sequential fresh live contexts.

The source explains the observed result. `applyRoute()` waits for the sample scan and its layout settling, then focuses the H1. The result and enabled Reset control can become visible before that late focus call. If a keyboard user focuses Reset during that interval, route completion moves focus back to the H1 before Enter is delivered.

Impact: the demo itself remains intact, and the visitor can recover by navigating to Reset again. However, the required keyboard reset action intermittently gives no result or feedback. This reopens review 3 finding F-3-10.

Recommended repair: complete route-entry focus before starting the sample, or do not move focus if the visitor has already moved it. Keep a concurrent repeated regression that asserts the active element is Reset immediately before Enter and that the reset confirmation appears.

Evidence: `/work/.evidence/duplicate-folder-finder-web-review-6/keyboard-stress-results/`.

## First screen before scrolling

Fresh phone (390×844) and desktop (1440×900) contexts opened at scroll position zero.

- Job: **Compare folders and find exact duplicates.**
- Audience: people checking backups, old drives, or photo dumps without uploading files.
- First action: **Try it with sample data**. Adjacent text says it shows a completed comparison.

The three facts about local files, offline use, and no account were visible before scrolling. The phone action ended at 360.77 px in the 844 px viewport. Neither viewport had horizontal overflow or load errors.

## Demo and real-data isolation

The one-click phone sample produced a realistic result with 3 files in A, 4 in B, one exact folder pair, and two file differences. It showed matching `albums`, changed `receipts/2025.txt`, and B-only `new/note.txt`.

The **Demo — sample data, nothing is saved** banner, Reset, and **Compare my folders** stayed visible. Its bottom was 97.78 px and the result heading began at 113.67 px, leaving 15.89 px clearance. Reset restored the original sample.

A `REVIEW_REAL_SENTINEL` report seeded in `mirrorbyte-local` remained unchanged through demo entry, reset, and exit. The `mirrorbyte-demo` report was gone after exit. Captured product requests used only the product origin.

A separate live read-only scan of safe fixture folders found the same 3/4-file result, exact `albums` pair, changed receipt, and backup-only note. File SHA-256 values were identical before and after the scan. No user data was read or changed.

## Claims

`npm run test:claims:contract` executed all ten commands from `.factory/claims.json` verbatim in the clean checkout. Every command passed.

| Claim | Result |
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

The landing page, result states, Privacy, Terms, README, and demo documentation were cross-checked against the registry. No missing, false, incomplete, or untested public claim was found.

## Clean-checkout checks

A detached worktree at documentation SHA `6963558` was installed with `npm ci`; the audit found 0 vulnerabilities.

| Check | Result |
| --- | --- |
| `npm test` | PASS — 10/10 tests, including empty folders, containment, same-size changed files, duplicate suppression, and 50,000 entries. |
| `npm run build` | PASS — `dist/` produced; 28 paths precached; deployment contract passed. |
| Every declared claim command | PASS — 10/10 exact commands. |
| `npm run test:e2e` | **FAIL — 45/46** because of F-6-1. |
| Focused keyboard stress, two workers | **FAIL — 36/40** because of F-6-1. |
| Focused keyboard check, one worker | PASS — 20/20; confirms the defect is timing-sensitive, not absent. |

The production app JavaScript is 24.73 kB raw / 9.18 kB gzip. CSS is 16.03 kB raw / 4.41 kB gzip. The mobile hero AVIF is 22,094 bytes.

## Normal, invalid, boundary, and recovery paths

- Normal sample and read-only folder-upload comparisons completed with correct folder and file results.
- Invalid JSON showed `Could not import that report.`; the next sample comparison completed.
- Cancelling a delayed scan showed `Scan cancelled. No files were changed.`; the next sample comparison completed.
- A simulated unreadable `locked.txt` completed the scan and reported that the file was excluded because permission was denied.
- Unit tests passed identical trees, both containment directions, same-size changed contents, empty directories, duplicate suppression, and a 50,000-file pair.
- In-memory writable-folder claim tests passed verification failure, restore, and holding-folder retention without touching the filesystem.

## Accessibility, routes, offline, privacy, and performance

- The factory URL verifier passed in 711 ms with no console errors, `lang=en`, one H1, one main landmark, image alternatives, and labelled buttons.
- Live Playwright Axe scans found no serious or critical violation on home, demo, Privacy, Terms, or the designed 404 at phone width with reduced motion.
- Privacy, Terms, and browser Back focused their route H1 after navigation. The live modal opened on its labelled close control; Tab did not reach a background control, and Escape restored focus to **Review holding folder**. F-6-1 is the remaining keyboard defect.
- Reduced motion matched and set page scrolling to `auto` with effectively instant control transitions.
- The demo reloaded and reset offline. Privacy, Terms, and an unknown route opened offline. The unknown route correctly kept HTTP 404 while showing the designed recovery page.
- `/`, `/demo`, `/privacy/`, `/terms/`, and the 404 had the expected route title, one H1, main landmark, canonical URL, and social/install metadata. All discovered links returned 200; the deliberate missing route returned 404.
- The manifest parsed with standalone display, a versioned start URL, matching colors, 192/512 icons, and a maskable icon.
- Live requests during the complete demo were same-origin only. No analytics, third-party script, CDN font, account, billing call, or application API was found.
- Live headers include the same-origin CSP with `frame-ancestors 'none'`, frame denial, nosniff, strict referrer policy, Permissions-Policy, and HSTS. Hashed assets are immutable; HTML and `sw.js` revalidate.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.2 s, TBT 0 ms, CLS 0.

The service worker exposes an in-app update notice, but no new live worker version was available during this review. There is no public update-timing claim. The versioned service worker build and offline behavior passed.

## Live implementation identity

Current deploy inputs match `e287789` exactly. The later `bcab01e` commit changes only `tests/e2e/app.spec.ts`; later commits through `6963558` change reports or Graphify output. All 27 public non-source-map files from the clean build matched the live deployment byte for byte. `staticwebapp.config.json` is deployment input and is correctly not public.

## Earlier finding disposition

| Earlier finding group | Current disposition |
| --- | --- |
| Verification 1 caching and security headers | Closed. Required live cache and browser-policy headers passed. |
| Review 1 demo, claims, phone action, routes, metadata, skeleton, and copy | Closed. Direct isolated demo, registered claims, visible action, designed 404, metadata, shared structure, and plain wording passed. |
| Review 2 claim command, persistent banner, price wording, touch targets, 404 metadata, controls, headings, and terminology | Closed. Exact commands, persistent controls, removed price claim, ≥44 px targets, metadata, and current wording passed. |
| Review 3 terminology, 404 status, banner clearance, legal focus, safety claims, offline scope, and registry wording | Closed, except F-3-10 is reopened as F-6-1. |
| Review 3 F-3-10 keyboard timing | **Reopened as F-6-1.** The clean full suite failed once, and concurrent stress failed 4/40 times. |
| Review 4 | Remains closed; it recorded no findings. |
| Review 5 F-5-1 phone banner overlap | Closed. The clean suite’s 20 repeated phone checks passed, and the live heading retained 15.89 px clearance. |

## Scope notes

This is a static local-first PWA. Backend tenant isolation, restart persistence, health checks, and 429 behavior do not apply. A CLI, library consumer install, and desktop installer do not apply. AI would not improve the core deterministic file-comparison job; the useful implied export is already present.

No product code was changed during this review.
