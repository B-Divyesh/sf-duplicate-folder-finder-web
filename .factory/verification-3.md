# Compare folders and find duplicate folders — verification 3

Date: 2026-09-06  
Work order: `duplicate-folder-finder-web-verify-3`  
Live URL: <https://duplicate-folder-finder-web.sociobot.in>  
Implementation candidate: `e287789442e0d2cb059ebed3c11cabb6d55d7375`  
Test-only follow-up: `bcab01e95d0cd23b2ea95baad9dabae580fffb0f`  
Documentation commit: `10db3b1cbf0481a0f333cfb1b08576c6df04e3af`

## Verdict

**PASS — 0 findings and 0 untested claims.**

The live product matches the implementation candidate. No product code was changed during this verification. The later `7548350` commit changes only Graphify output and was not treated as a new product image.

## First screen

Fresh desktop (1440×900) and phone (390×844) browsers were opened at scroll position zero.

- Job: **Compare folders and find exact duplicates.**
- Audience: people checking backups, old drives, or photo dumps without uploading files.
- First action: **Try it with sample data**. The page says it will show a completed comparison.

All three product facts were visible before scrolling: files stay on this device, it works offline after the first visit, and no account is required. The phone action ended at 360.77px in an 844px viewport. Neither viewport had horizontal overflow.

## Clean-checkout verification

A fresh clone was checked out at `bcab01e` and installed with `npm ci` (0 vulnerabilities).

| Check | Result |
| --- | --- |
| `npm test` | PASS — 10/10 tests. Includes classification, containment, changed same-size files, empty folders, duplicate suppression, and 50,000 entries. |
| `npm run build` | PASS — produced `dist/`, precached 28 paths, and passed the deployment contract. |
| Every command in `.factory/claims.json` | PASS — all 10 exact tagged commands passed from the clean checkout. The direct Playwright claim command also started its configured parity server without a manually supplied server. |
| `npm run test:e2e` | PASS — 46/46 desktop Chromium and phone tests. |

The built application JavaScript is 24.73 kB raw / 9.18 kB gzip. CSS is 16.03 kB raw / 4.41 kB gzip. The mobile hero AVIF is 22,094 bytes.

## Claims

All public claims are listed in `.factory/claims.json`; none was missing, false, incomplete, or untested.

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

## Live product checks

- The one-click sample produced a populated comparison: one exact `albums` pair, changed `receipts/2025.txt`, and Folder B-only `new/note.txt`.
- The label **Demo — sample data, nothing is saved** remained visible. Reset restored the shipped sample.
- A seeded `mirrorbyte-local` sentinel remained unchanged through demo entry, reset, and exit. `mirrorbyte-demo` was discarded on exit. Captured product requests were same-origin only.
- In 20 warmed fresh 390×844 phone contexts, the result heading and verdict were below the persistent banner in 20/20 runs. Minimum heading clearance was 15.89px.
- Keyboard skip navigation, keyboard reset, focus movement on legal routes and Back, the holding-folder dialog, reduced motion, invalid import recovery, cancellation recovery, boundary cases, and scan safety paths passed in the 46-test browser suite.
- A fresh service-worker-controlled live context reloaded `/demo` offline with the populated sample and reset it offline. Privacy, Terms, and the designed unknown route also opened offline; the unknown route correctly retained HTTP 404.
- `/`, `/demo`, `/privacy/`, `/terms/`, and the designed 404 each had the expected title, one H1, and one main landmark. The 404 status was deliberate and the recovery page worked.
- Factory `verify-url.sh` passed with no console errors, `lang=en`, a title, one H1, main landmark, alt text, and labelled buttons. The only console resource error in the route sweep was the deliberate HTTP 404 request.
- Playwright Axe found no serious or critical violations on home, demo, Privacy, Terms, or 404 at phone width with reduced motion.
- Every discovered link returned 200 or was a valid same-document fragment. The source link returned 200.
- Live headers include the same-origin CSP with `frame-ancestors 'none'`, `X-Frame-Options: DENY`, nosniff, strict referrer policy, Permissions-Policy, and HSTS. Hashed assets are immutable; HTML and `sw.js` revalidate.
- The 27 publicly deployed files from the candidate build matched live byte-for-byte. `staticwebapp.config.json` is deployment input and correctly returns 404 rather than being public.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100. FCP 1.0s, LCP 1.2s, TBT 0ms, CLS 0.

Evidence is in `/work/.evidence/duplicate-folder-finder-web-verify-3/`.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Verification 1 caching and security headers | Closed. Immutable hashed assets and all required browser-policy headers are live. |
| Review 1 demo, claims, phone action, routes, metadata, skeleton, and copy | Closed. Direct demo isolation, registered claims, visible phone action, designed 404, route metadata, shared structure, and plain wording all passed. |
| Review 2 command, banner, price, targets, 404, labels, headings, and terminology | Closed. All exact commands pass; the banner persists; price copy remains absent; touch targets, headings, labels, and terminology passed. |
| Review 3 terminology, safety language, offline 404, phone clearance, legal focus, safety-claim coverage, offline scope, registry wording, and keyboard timing | Closed. These paths passed in the clean browser suite and fresh live checks. |
| Review 4 | Remains closed; it recorded no findings. |
| Review 5 F-5-1 phone banner overlap | Closed. The repaired live flow passed 20/20 fresh warmed phone runs with 15.89px minimum heading clearance. |

## Product limits

Chrome or Edge can select writable folders and use the reversible holding-folder flow. Other browsers use the read-only upload fallback and cannot show empty folders. These disclosed browser limits are not defects.
