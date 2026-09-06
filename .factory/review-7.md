# Compare folders and find duplicate folders — strict review 7

Date: 2026-09-06  
Live URL: <https://duplicate-folder-finder-web.sociobot.in>  
Implementation reviewed: `9f76295a842afe1e5ba13a094d05a6014c7e4b80` (`fix: preserve demo reset keyboard focus`)  
Documentation reviewed: `f701f19` (`docs: record verification 4 pass`); repository review pointer: `60ed83f`

## Verdict

**PASS — 0 findings and 0 untested claims.**

Mirrorbyte compares one or two local folders, identifies exact duplicate subfolders, and lists changed or one-sided files. It is for people checking backups, old drives, or photo dumps. In fresh desktop and phone browsers, before scrolling, the page says that job and audience and presents **Try it with sample data** as the first action.

No product code was changed in this review.

## Fresh live review

Fresh contexts at 1440×900 and Pixel 5 dimensions both returned HTTP 200 with the title `Mirrorbyte — Compare folders and find duplicates`, `lang=en`, one H1, and one main landmark. The sample action was visible before scrolling with no horizontal overflow:

| Viewport | Sample action bottom | Viewport height | Visible before scrolling |
| --- | ---: | ---: | --- |
| Desktop 1440×900 | 553.47 px | 900 px | Yes |
| Pixel 5 | 405.22 px | 727 px | Yes |

Selecting the first sample action opened the isolated demo. The persistent label read **Demo — sample data, nothing is saved**. The populated result showed the exact `albums` pair, B-only `new/note.txt`, and changed `receipts/2025.txt`. Reset with keyboard focus followed by Enter restored the sample and retained focus on **Reset demo** on desktop and phone. Both contexts had no console errors and made only same-origin requests during the flow.

Live route and accessibility checks used a fresh reduced-motion Pixel 5 context. `/`, `/demo`, `/privacy/`, `/terms/`, and `/not-a-real-route` had their expected route-specific titles, exactly one H1 and main landmark. The unknown path deliberately returned HTTP 404 and rendered the designed recovery page. Axe reported no serious or critical violations on every route. Reduced motion set `scroll-behavior: auto` and transitions to `0.00001s`; no console errors occurred.

After service-worker control, the live demo reloaded offline with HTTP 200, Reset demo still worked, Privacy and Terms loaded with HTTP 200, and an unknown route retained the designed HTTP 404. This is the promised offline scope.

Live response headers include the same-origin CSP with `frame-ancestors 'none'`, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, strict referrer policy, and restrictive Permissions-Policy. HTML revalidates. The current candidate build matched live byte-for-byte for all 27 public, non-source-map artifacts. `staticwebapp.config.json` is deployment input and is intentionally not public.

## Clean-checkout verification

A detached worktree at `9f76295` was installed with a fresh `npm ci` (0 vulnerabilities).

| Command or check | Result |
| --- | --- |
| `npm test` | PASS — 10/10 |
| `npm run build` | PASS — `dist/` produced; 28 files precached; deployment contract passed |
| `npm run test:e2e` | PASS — 48/48 |
| Public artifact parity | PASS — 27/27 live matches |

Every exact command declared in `.factory/claims.json` was run individually from that checkout and passed:

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

The public landing and README claims were cross-checked with the registry and its tests. No public claim is missing, false, incomplete, or untested. The suite covers normal results, one-folder duplicates, empty folders, unreadable files, containment in either direction, same-size changed content, duplicate suppression, a synthetic 50,000-file pair, import failure and recovery, cancellation and recovery, persistence, exports, holding-folder verification failure, restoration, and retained held copies.

## Earlier finding disposition

| Earlier finding | Current disposition and evidence |
| --- | --- |
| Verification 1: immutable caching and security headers | Closed. Current live headers show immutable hashed assets through deployment policy and hardened CSP, frame denial, nosniff, HSTS, referrer policy, and Permissions-Policy. |
| Review 1 B1, B2, B3, B4 | Closed. `/demo` and `?demo=1` provide the isolated, persistent and resettable demo; all ten claims are registered and executable; the sample action is visible first on phone; direct Demo and designed 404 routes work. |
| Review 1 M1, M2 and copy findings | Closed. Route metadata/install assets, shared navigation/footer, Demo navigation, and the copy audit are present. Current audit has no sentence over 22 words or banned visitor language. |
| Review 2 B1, B2, H1, M1–M6 | Closed. Exact claim commands pass individually; demo rail stays usable; no price claim remains; controls meet the route suite's target checks; 404 metadata, action labels, headings, and folder terminology pass. |
| Review 3 F-3-1 through F-3-3 | Closed. Visitor vocabulary uses folder/subfolder/holding folder; controlled and offline unknown routes return the designed HTTP 404. |
| Review 3 F-3-4 and Review 5 F-5-1 | Closed. The 48-test suite includes repeated phone geometry; this review's fresh phone run had no overflow and reached the populated result below the demo rail. |
| Review 3 F-3-5 through F-3-9 | Closed. Browser coverage verifies legal-route focus, restore and retained-copy claim tests, offline legal/404 scope, and exact registry completeness. |
| Review 3 F-3-10 and Review 6 F-6-1 | Closed. Candidate `9f76295` moves route-heading focus before asynchronous demo work. Full browser suite passed 48/48; fresh desktop and phone keyboard Reset checks kept focus on Reset after Enter. |
| Review 4 and Verifications 2–4 | Remain closed. Review 4 had no findings; the current clean and live evidence independently reconfirms their pass results. |

## Scope

This is a static local-first PWA. Backend tenant isolation, persistence across a backend restart, health endpoints, and rate limits do not apply. CLI/library/desktop consumer-install checks do not apply. The deterministic folder-comparison job does not need an AI feature; JSON and CSV export are present. Chrome and Edge offer the writable holding-folder flow; other browsers use the disclosed read-only upload fallback and cannot expose empty folders.
