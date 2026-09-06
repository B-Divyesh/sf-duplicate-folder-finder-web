# Repair 3 handoff — compare folders and find exact duplicates

Date: 2026-09-06

Live URL: <https://duplicate-folder-finder-web.sociobot.in>

Result: **PASS — review 6 focus race fixed; 0 known untested claims.**

## Product and first action

Mirrorbyte compares one or two folders and finds exact duplicate subfolders and file differences. It is for people checking backups, old drives, or photo dumps without uploading files. The first phone and desktop action is **Try it with sample data**, followed by a completed comparison.

## Repair

Review 6 finding F-6-1 was caused by route focus running after the asynchronous demo scan and result-positioning work. The result and enabled **Reset demo** control could appear first. If a keyboard user focused Reset during that interval, route completion moved focus back to the H1 before Enter arrived.

`applyRoute()` now focuses and announces the new route heading before it starts asynchronous sample or saved-report work. Route entry still has immediate, screen-reader-visible focus. Later layout completion no longer changes a visitor's chosen focus.

The new browser regression delays layout frames to make the old race deterministic. It enters Demo, waits until Reset is enabled, focuses it, lets route completion settle, proves focus remains on Reset, presses Enter, and requires the reset confirmation. The test failed against the old implementation before the repair.

## Commits and deployment

- Review/report base: `8496298bb33aa27e215ae71f69534c3cf9abe069`.
- Deployed implementation: `9f76295a842afe1e5ba13a094d05a6014c7e4b80` (`fix: preserve demo reset keyboard focus`).
- Verification documentation: `c1689766b5a64400d11bfd66a47463b09f08c588` (`docs: record repair 3 verification`); the following metadata-only commit records this pointer.
- The implementation was pushed to `origin/main` and deployed from a detached clean worktree.
- Static deployment completed successfully on 2026-09-06. The product custom domain returned HTTPS 200 with managed TLS.
- All 27 public non-source-map files from the clean build matched the live deployment byte for byte.
- Pre-existing modifications under `graphify-out/` were not staged, changed, or included in the implementation commit.

## Clean-checkout verification

A detached worktree at the implementation commit was created at `/tmp/duplicate-folder-finder-repair-3-clean.F1mnYm`.

```text
npm ci                         PASS, 0 vulnerabilities
npm test                       PASS, 10/10
npm run build                  PASS, dist/ produced; 28 paths precached; deployment contract passed
npm run test:claims:contract   PASS, all 10 registry commands executed verbatim
npm run test:e2e               PASS, 48/48 across desktop Chromium and phone
```

The focused Reset regression plus the prior keyboard check passed 80/80 times with two workers across desktop and phone. This matches and exceeds the concurrent 40-run reproduction used by review 6.

All declared claims passed:

- `comparison-results`
- `single-folder-duplicates`
- `local-only`
- `offline-reload`
- `report-exports`
- `demo-isolation`
- `local-persistence`
- `quarantine-verification`
- `holding-folder-restore`
- `holding-folder-kept`

Production sizes remain within budget: application JavaScript is 24.73 kB raw / 9.18 kB gzip; CSS is 16.03 kB raw / 4.41 kB gzip; the mobile hero AVIF is 22,094 bytes.

## Live verification

- Fresh 1440×900 desktop and 390×844 phone contexts showed the job, audience, primary sample action, outcome text, and three facts before scrolling. The phone action ended at 360.77 px. Neither viewport overflowed horizontally.
- Direct Demo and the one-click sample reported 3 files in A, 4 in B, one exact `albums` pair, changed `receipts/2025.txt`, and B-only `new/note.txt`.
- The persistent **Demo — sample data, nothing is saved** label, Reset, and **Compare my folders** remained visible. The phone result heading began at 113.67 px below the 97.78 px banner.
- With delayed layout frames on live, Reset remained focused before and after route completion on both desktop and phone. Enter restored the original sample and showed its confirmation.
- A valid `REPAIR_3_REAL_SENTINEL` report in `mirrorbyte-local` was unchanged after demo entry, reset, and exit. The `mirrorbyte-demo` report was cleared. All captured requests used only the product origin.
- Invalid JSON showed `Could not import that report.`; a following sample comparison completed. Unit tests covered identical folders, both containment directions, changed same-size content, empty folders, duplicate suppression, and a 50,000-file pair.
- Privacy, Terms, Back to Privacy, and Back home focused their route H1. The designed unknown route returned HTTP 404 with a recovery link.
- A fresh service-worker-controlled demo reloaded and reset offline. Privacy, Terms, and the designed unknown route opened offline; the unknown route retained HTTP 404.
- Reduced motion matched, page scrolling was `auto`, and control transitions were effectively instant.
- Every discovered link returned 200 or resolved to a valid same-document fragment. The deliberate unknown route was the only expected 404.
- The factory URL verifier passed in 611 ms with no console errors, `lang=en`, one H1, one main landmark, image alternatives, and labelled buttons.
- Live Playwright Axe found no serious or critical violations on home, Demo, Privacy, Terms, or the designed 404 at phone width with reduced motion.
- Live headers retain same-origin CSP with `frame-ancestors 'none'`, frame denial, nosniff, strict referrer policy, Permissions-Policy, and HSTS. Hashed assets are immutable; HTML revalidates.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.2 s, TBT 0 ms, CLS 0. The first Chrome process crashed before measurement; the preinstalled headless-shell retry completed successfully.

Evidence is in `/work/.evidence/duplicate-folder-finder-web-repair-3/`. The catalog description is copied to `/work/.evidence/catalog-description.txt`.

## Earlier finding disposition

- Verification 1 caching and security headers remain closed by the live cache and browser-policy checks.
- Review 1 demo isolation, claim registry, phone first action, routes, metadata, shared structure, and copy findings remain closed.
- Review 2 exact claim command, persistent demo banner, removed price wording, touch targets, 404 metadata, action labels, headings, and terminology findings remain closed.
- Review 3 folder vocabulary, holding-folder wording, controlled 404 status, phone clearance, legal focus, safety claims, offline scope, and registry wording remain closed.
- Review 3 F-3-10 and review 6 F-6-1 are closed by the route-order repair, deterministic outcome regression, 80/80 stress run, clean 48/48 suite, and fresh live desktop/phone checks.
- Review 4 remains closed; it recorded no findings.
- Review 5 F-5-1 remains closed. The existing repeated geometry regression passed, and live phone clearance remained 15.89 px.

## Known product constraints

There are no known repair gaps. Chrome or Edge provides writable File System Access and holding-folder moves. Other browsers use a read-only folder-upload fallback and cannot expose empty folders. Browser and operating-system failures remain possible, so visitors are told to keep a separate backup. This is a static, local-first PWA with no backend, billing offer, analytics, account, or AI feature.

## Independent verification 4

Date: 2026-09-06

**PASS — 0 findings and 0 untested claims.** Independent QA reviewed implementation `9f76295a842afe1e5ba13a094d05a6014c7e4b80`; the associated documentation commit is `c1689766b5a64400d11bfd66a47463b09f08c588`.

A fresh detached checkout passed `npm ci`, `npm test` (10/10), `npm run build`, all ten exact claim commands, `npm run test:claims:contract`, and `npm run test:e2e` (48/48). Fresh desktop and phone live contexts confirmed the job/audience/first action before scrolling, realistic one-click sample output, persistent demo label, keyboard Reset, demo isolation, invalid-import recovery, offline reload/reset/legal/404, routes, links, headers, and no serious/critical Axe violations. The repaired delayed-route focus path passed 5/5 fresh desktop and 5/5 fresh phone runs; the live runtime matched all 27 public candidate files byte-for-byte.

Full independent evidence and the earlier-finding audit are in [.factory/verification-4.md](verification-4.md). A local Lighthouse CLI browser connection/tab crash prevented a new score; direct live Lighthouse-class semantic, accessibility, motion, console, and performance-budget checks passed, while the prior handoff retains the successful 100/100/100/100 run. No product repair gap is known.
