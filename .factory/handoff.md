# Repair 2 handoff — compare folders and find duplicate folders

Date: 2026-09-06

Live URL: <https://duplicate-folder-finder-web.sociobot.in>

Result: **PASS — no known open review findings**

## Verification 3

Independent verification on 2026-09-06 recorded **PASS — 0 findings and 0 untested claims** in `.factory/verification-3.md`.

- Implementation reviewed: `e287789442e0d2cb059ebed3c11cabb6d55d7375`.
- Test-only follow-up reviewed: `bcab01e95d0cd23b2ea95baad9dabae580fffb0f`.
- Documentation commit: `10db3b1cbf0481a0f333cfb1b08576c6df04e3af`.
- Fresh-checkout quality gates passed: 10 unit tests, all 10 exact claim commands, build/deployment contract, and 46 E2E tests.
- Fresh desktop and phone live checks passed. The first screen states the job, audience, and sample action before scrolling; the sample is populated, labelled, resettable, and isolated from real data.
- The repaired phone demo result cleared its persistent banner in 20/20 warmed fresh contexts, with 15.89px minimum heading clearance.
- Live verification passed offline, routes/404, keyboard/focus/reduced motion, accessibility, privacy, links, headers, byte-for-byte artifacts (27/27 public files), and mobile Lighthouse: 100 Performance, Accessibility, Best Practices, and SEO.
- Evidence: `/work/.evidence/duplicate-folder-finder-web-verify-3/`. Required summary: `/work/.evidence/qa-report.md` and `/work/.evidence/qa-result.json`.

## Product and first action

Mirrorbyte compares one or two folders and finds exact duplicate subfolders and file differences. It is for people checking backups, old drives, or photo dumps without uploading files. The first action on phone and desktop is **Try it with sample data**, followed by a completed comparison.

## Repair

Review 5 finding F-5-1 was caused by scroll timing. The app calculated its phone result position while the scan-progress panel was still visible. Closing that panel then moved the result upward by about 200px, with timing-dependent variation.

The scan now closes the progress panel before positioning the completed result. It waits for fonts and two layout frames, measures the actual sticky banner, and corrects the result heading against that measurement twice. The heading has a 16px intended gap beneath the banner. Reduced-motion behavior remains instant.

The browser regression checks final banner, heading, and verdict geometry in 10 warmed fresh 390×844 contexts per Playwright project. This gives 20 fresh-context runs in the full suite and asserts the visible outcome rather than a source string or fixed scroll value. The skip-link check also now accepts focus on either the main landmark or its focused route heading, which is the stable accessibility outcome after routing settles.

## Commits and deployment

- Prior review/documentation base: `8b85f18897c96d41549c8dd55142cdfb1760e493`.
- Deployed product implementation: `e287789` (`fix: settle demo result below sticky banner`).
- Post-deploy test-only commit: `bcab01e` (`test: verify settled skip-link focus outcome`). It does not change deployable files.
- Static deployment completed successfully on 2026-09-06. All 27 deployable non-source-map files matched the live HTTPS product byte for byte.

## Clean-checkout verification

A detached worktree at `e287789` was created in `/tmp/duplicate-folder-finder-repair-2-clean.2i0BwL`.

```text
npm ci                         PASS, 0 vulnerabilities
npm test                       PASS, 10/10
npm run build                  PASS, dist/ produced and deployment contract passed
npm run test:claims:contract   PASS, all 10 exact registry commands
npm run test:e2e               PASS, 46/46 across desktop Chromium and phone
```

The production app JavaScript is 24,731 bytes raw / 9.18kB gzip. CSS is 16,025 bytes raw / 4.41kB gzip. The mobile hero AVIF is 22,094 bytes. All remain within the product budgets.

## Live verification

- Fresh desktop 1440×900 and phone 390×844 sessions showed the job, audience, sample action, outcome text, and three facts before scrolling. The phone action ended at 360.77px with no horizontal overflow.
- In 20 additional warmed fresh phone contexts, the result heading cleared the banner in 20/20 runs. Every run had a 15.89px measured gap; no overlap occurred.
- The sample reported one exact `albums` folder pair, changed `receipts/2025.txt`, and Folder B-only `new/note.txt`. The banner stayed visible. Reset restored the sample.
- A valid sentinel in `mirrorbyte-local` remained unchanged through demo entry, reset, and exit. `mirrorbyte-demo` was empty after exit. All captured requests stayed on the product origin.
- A live read-only scan of safe fixture folders reported 3 files in A, 4 in B, one exact folder pair, and two file differences. SHA-256 checksums before and after were identical.
- Invalid JSON and scan cancellation both showed their recovery message; a following sample scan completed.
- Keyboard skip navigation moved focus inside main content. Demo reset worked by keyboard. Legal navigation and Back focus remain covered by the full browser suite.
- The service-worker-controlled demo reset offline. Privacy, Terms, and the designed unknown route opened offline; the unknown route retained HTTP 404.
- The factory URL verifier passed in 581ms with no console errors, one h1, `lang=en`, a main landmark, image alternatives, and labelled buttons.
- Playwright Axe found zero violations on home, demo, Privacy, Terms, and the designed 404 at phone width with reduced motion.
- Every discovered link returned 200 or was a valid same-document fragment. Route titles, metadata, manifest icons, and legal pages passed.
- Live headers retain same-origin CSP, frame denial, nosniff, strict referrer policy, Permissions-Policy, and HSTS. Hashed assets are immutable; HTML and `sw.js` revalidate.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100, FCP 1.0s, LCP 1.2s, TBT 10ms, CLS 0.

Evidence is in `/work/.evidence/repair-2-*`. The required catalog description was copied to `/work/.evidence/catalog-description.txt` and matches `.factory/catalog-description.txt`.

## Earlier finding disposition

- Verification 1 caching and security-header findings remain closed by live response checks.
- Review 1 demo isolation, claim registry, phone first action, routes, metadata, shared skeleton, and copy findings remain closed.
- Review 2 claim command, persistent demo banner, price copy, touch targets, 404 metadata, action labels, headings, and terminology findings remain closed.
- Review 3 folder terminology, holding-folder wording, controlled 404 status, legal focus, safety claims, offline scope, registry copy, and keyboard timing findings remain closed.
- Review 4 had no findings.
- Review 5 F-5-1 is closed by the post-layout repair, 20-context repository regression, and separate 20-context live run.

## Known product constraints

There are no known repair gaps. Chrome or Edge provides writable File System Access and holding-folder moves. Other browsers use a read-only folder-upload fallback and cannot expose empty folders. Browser and operating-system failures remain possible, so the product continues to tell visitors to keep a separate backup. This is a static, local-first PWA with no backend, billing offer, analytics, account, or AI feature.
