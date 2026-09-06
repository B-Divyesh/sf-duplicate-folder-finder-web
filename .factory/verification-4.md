# Independent verification 4 — PASS

Date: 2026-09-06  
Live URL: <https://duplicate-folder-finder-web.sociobot.in>  
Implementation reviewed: `9f76295a842afe1e5ba13a094d05a6014c7e4b80` (`fix: preserve demo reset keyboard focus`)  
Documentation reviewed: `c1689766b5a64400d11bfd66a47463b09f08c588` (`docs: record repair 3 verification`)

## Verdict

**PASS — 0 findings and 0 untested claims.**

Mirrorbyte does the stated job: it compares local folders, identifies exact duplicate subfolders, and shows changed or one-sided files. It is for people checking backups, old drives, or photo dumps. Before scrolling, a fresh desktop and phone visit state that job and audience and offer **Try it with sample data** as the first action.

The implementation SHA differs from the documentation SHA. The later checked-out commits contain report/copy-audit and pre-existing Graphify metadata only; they do not change the reviewed product runtime. The live runtime matched the build from `9f76295`.

## Clean-checkout evidence

Verification used a detached clean worktree at `9f76295` and a fresh `npm ci`.

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 0 vulnerabilities |
| `npm test` | PASS — 10/10 tests |
| `npm run build` | PASS — `dist/` produced; deployment contract passed; 28 files precached |
| `npm run test:claims:contract` | PASS — all 10 exact registry commands executed |
| Every command listed in `.factory/claims.json` | PASS individually |
| `npm run test:e2e` | PASS — 48/48 in 1.0 minute |

All registered public claims were executable and passed: `comparison-results`, `single-folder-duplicates`, `local-only`, `offline-reload`, `report-exports`, `demo-isolation`, `local-persistence`, `quarantine-verification`, `holding-folder-restore`, and `holding-folder-kept`.

The unit and browser coverage exercises normal comparison, empty folders, unreadable files, containment in either direction, changed same-size contents, duplicate suppression, the 50,000-file synthetic pair, import failure and recovery, cancellation and recovery, persistence, exports, holding-folder verification failure, restore, and retained held copies. I also manually cross-checked landing, demo, legal, README, and demo-documentation promises against the registry: no missing, false, incomplete, or untested public claim remains.

## Fresh live evidence

- Fresh 1440×900 desktop: HTTP 200, title `Mirrorbyte — Compare folders and find duplicates`, job H1, audience sentence, and sample action all appeared before scrolling; the action ended at 553.47 px with no horizontal overflow.
- Fresh Pixel 5 phone: the same first-screen content appeared before scrolling; the action ended at 405.22 px in the 727 px viewport with no horizontal overflow. The completed result began 15.72 px below the 97.78 px sticky demo rail.
- One click loaded the persistent `Demo — sample data, nothing is saved` label and a realistic result: one exact `albums` pair, changed `receipts/2025.txt`, and B-only `new/note.txt`.
- **Reset demo** worked with Enter. With delayed animation frames reproducing the prior timing condition, focus stayed on Reset and reset succeeded 5/5 fresh desktop contexts and 5/5 fresh phone contexts.
- A deliberately seeded `VERIFY_4_REAL_SENTINEL` report in `mirrorbyte-local` survived demo entry, reset, and exit unchanged; `mirrorbyte-demo` had no report after exit. The sample flow issued requests only to the product origin.
- Invalid JSON displayed `Could not import that report.` with the parsing reason, and a following sample run completed. This confirms the invalid/recovery path without changing real user data.
- After service-worker installation, demo reload and Reset worked offline. Privacy, Terms, and the designed unknown route opened offline; the unknown route retained HTTP 404.
- All internal links resolved to HTTP 200 except the deliberate designed unknown-route recovery link, which correctly returned HTTP 404. The repository link returned HTTP 200.
- All 27 public, non-source-map candidate artifacts were byte-identical to live. `staticwebapp.config.json` is intentionally deployment-only and correctly returned 404 rather than being public.
- Live headers include same-origin CSP with `frame-ancestors 'none'`, HSTS, frame denial, nosniff, strict referrer policy, and a restrictive Permissions-Policy. Hashed JavaScript is immutable; the service worker and HTML revalidate.

## Accessibility, routes, and visual checks

Live desktop Axe checks found no serious or critical violations on `/`, `/demo`, `/privacy/`, `/terms/`, or the designed 404. Each route had its route-specific title, exactly one H1, one main landmark, and reduced-motion scroll behavior of `auto`. The direct live check also found no console errors, only same-origin requests, designed visible focus behavior, and no horizontal overflow in either fresh viewport. Privacy, Terms, history navigation, the skip link, modal focus handling, and Reset keyboard operation are covered by the green browser suite.

No repository `verify-url.sh` was present, so its required title/lang/main/alt/console checks were performed directly in the fresh live browser and through the route/accessibility suite. A local Lighthouse CLI attempt could not connect to, then crashed a Chromium tab; this is a runner limitation rather than a product failure. The independently checked Lighthouse-class requirements above pass, and the prior product handoff records its successful 100/100/100/100 live run.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Verification 1 cache/security headers | Closed: current live cache and security-header checks pass. |
| Reviews 1–2 demo, route, claim-command, phone-first-action, copy, metadata, and touch-target findings | Closed: direct live use and clean claim/browser suites pass. |
| Review 3 F-3-1/F-3-2 terminology | Closed: visitor copy uses folder/subfolder, content hashes, and holding folder. |
| Review 3 F-3-3 controlled 404 | Closed: fresh and service-worker-controlled unknown routes return the designed HTTP 404. |
| Review 3 F-3-4 and Review 5 F-5-1 phone banner overlap | Closed: fresh phone clearance was 15.72 px; repeated geometry tests passed in the suite. |
| Review 3 F-3-5 legal-route focus | Closed by route/back keyboard coverage. |
| Review 3 F-3-6/F-3-7 safety claims | Closed: dedicated restore and held-copy-retention claims pass. |
| Review 3 F-3-8/F-3-9 offline scope and registry wording | Closed: offline legal/404 coverage and all ten registry commands pass. |
| Review 3 F-3-10 and Review 6 F-6-1 Reset focus race | Closed: 48/48 full suite plus the fresh delayed-frame 10/10 desktop/phone stress check pass. |
| Review 4 and Verification 2–3 | Remain closed; they recorded no unresolved product finding. |

## Scope and known constraints

This static PWA has no backend, tenant, health, persistence-restart, rate-limit, billing, or AI surface, so those backend checks are not applicable. Chrome and Edge provide the writable folder picker and holding-folder move; other browsers use the read-only folder-upload fallback and cannot enumerate empty folders. Browser and operating-system failures remain possible, so the product honestly advises keeping a separate backup. These are disclosed product constraints, not verification failures.
