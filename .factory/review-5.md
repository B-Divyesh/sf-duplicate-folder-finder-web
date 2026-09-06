# Compare folders and find duplicate folders — review 5

Date: 2026-09-06

Work order: `duplicate-folder-finder-web-review-5`

Live URL: <https://duplicate-folder-finder-web.sociobot.in>

Implementation reviewed: `ee0dfefb372ef62ff16cb45f7b556e8f02b26f7e`

Documentation base reviewed: `12fb9394e3465776590acccc3039f95d8e4529e8`

## Verdict: FAIL

Finding count: **1** (medium).

Untested claim count: **0**.

The product completes its folder-comparison job, all ten declared claims pass, and the live files match the implementation candidate. It does not receive a PASS because the one-click phone demo intermittently places the result heading under the persistent demo banner.

## First screen before scrolling

Fresh 1440×900 desktop and 390×844 phone contexts started at scroll position 0.

- Job: compare folders and find exact duplicate subfolders and file differences.
- Audience: people checking backups, old drives, or photo dumps without uploading files.
- First action: `Try it with sample data`; the next line says `See a completed folder comparison now.`

The headline, audience sentence, first action, and three facts were visible in both first viewports. The phone had no horizontal overflow. The pixel-folder artwork, cyan and amber status colors, hard edges, and utility typography still match `.factory/design.md` and do not look like a generic site template.

## Finding

### F-5-1 — Medium — The phone demo can partly hide its result heading

After warming the live browser cache, I opened 20 fresh 390×844 phone contexts. Each context loaded `/`, used the keyboard skip link, selected `Try it with sample data`, waited for the completed result, and then waited another 300 ms for layout to settle.

Three of 20 runs placed `Comparison result` under the sticky demo banner:

| Run | Banner bottom | Heading top | Covered |
| ---: | ---: | ---: | ---: |
| 10 | 97.78 px | 93.67 px | 4.11 px |
| 11 | 97.78 px | 77.67 px | 20.11 px |
| 16 | 97.78 px | 93.67 px | 4.11 px |

The demo label, Reset control, exit control, and result verdict remained visible. The main comparison still worked, so this is medium rather than high severity. It nevertheless reopens review 3 finding F-3-4 in a reduced form: the section name is not reliably clear after the required one-click sample action.

Evidence: `/work/.evidence/mobile-banner-reproduction.json` and `/work/.evidence/mobile-banner-overlap.png`.

Recommended repair: stop relying on one computed scroll offset before layout has fully settled. Anchor the result below the measured sticky banner after image and result layout complete, and repeat the phone test in warmed fresh contexts so a single favorable run cannot hide the race.

## Demo and real folder paths

The one-click sample immediately showed a realistic populated comparison:

- `albums` was an exact duplicate folder pair.
- `receipts/2025.txt` had changed.
- `new/note.txt` existed only in Folder B.

`Demo — sample data, nothing is saved` remained visible while scrolling. Reset worked with Enter and restored its focus. A synthetic record seeded in `mirrorbyte-local` was unchanged after demo entry and reset. `Compare my folders` removed the `mirrorbyte-demo` report and left the synthetic real record unchanged.

The live read-only folder-upload path was also exercised with local fixture directories. A two-folder scan returned 3 files in A, 4 in B, one exact folder pair, and two differences. A one-folder scan found the two matching internal subfolders. SHA-256 checksums of every fixture file were identical before and after both scans. No real user data was present or changed.

Invalid JSON produced `Could not import that report.` and the next sample scan completed. Cancelling a delayed scan produced `Scan cancelled. No files were changed.` and the next sample scan completed. Empty-directory, unreadable-file, containment, same-size changed-content, nested-duplicate suppression, 50,000-file, verification-failure, restore, and holding-folder retention paths passed in the repository suites.

## Declared claims

From a detached clean worktree, `npm ci` installed the documented development dependencies. `npm run test:claims:contract` then ran every command from `.factory/claims.json` verbatim.

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

The landing page, result states, legal pages, and README were cross-checked against the registry. No unlisted or untested public functional claim was found.

## Earlier finding disposition

Every finding from reviews 1–4 and verifications 1–2 was checked again.

| Earlier finding | Current disposition and evidence |
| --- | --- |
| Verification 1: immutable asset caching | Closed. The live hashed app bundle returns `public, max-age=31536000, immutable`. |
| Verification 1: missing browser security policy | Closed. Live responses include CSP with `frame-ancestors 'none'`, frame denial, nosniff, strict referrer policy, Permissions-Policy, and HSTS. |
| Review 1 B1: no isolated demo | Closed. Direct `/demo` and one-click `?demo=1`, separate IndexedDB, reset, discard, and unchanged real record all passed live. |
| Review 1 B2: no claim registry/tests | Closed. Ten registry commands passed verbatim; no unlisted claim was found. |
| Review 1 B3: no first phone action | Closed. The sample action is visible at 390×844 before scrolling. |
| Review 1 B4: broken demo/404 routes | Closed. `/demo` returns 200; unknown online and service-worker-controlled offline routes return the designed page with HTTP 404. |
| Review 1 M1: missing social/install metadata | Closed. Route metadata, social image, favicon, Apple icon, and parsed manifest passed. |
| Review 1 M2: inconsistent header/footer | Closed. Shared navigation, footer, build line, legal links, source, and art disclosure appear on all routes. |
| Review 1 copy findings C1–C12 | Closed. Current copy uses folder/subfolder and holding folder consistently, direct action labels, no banned marketing words, and no sentence over the recorded limit. |
| Review 2 B1: invalid Vitest claim command | Closed. The exact `-t` command passed through the contract runner. |
| Review 2 B2: demo banner scrolls away | Closed for persistence. The banner and both controls stay visible; F-5-1 concerns intermittent overlap with the result heading below it. |
| Review 2 H1: unlisted `Free to use` | Closed. The text remains removed. |
| Review 2 M1: small phone targets | Closed. Measured header, footer, and demo controls were at least 44×44 px. |
| Review 2 M2: missing 404 metadata | Closed. The live designed 404 has title, canonical, description, Open Graph, and Twitter metadata. |
| Review 2 M3: unclear demo exit | Closed. The control reads `Compare my folders`. |
| Review 2 M4: unclear `Discover` heading | Closed. It reads `Read folder names and sizes`. |
| Review 2 M5: unexplained browser/holding terms | Closed. Visitor copy says Chrome or Edge and explains the holding folder. |
| Review 2 M6: changing folder terms | Closed. Live one-folder output says `ONE-FOLDER SCAN`; visitor copy uses folder and subfolder. |
| Review 3 F-3-1: remaining root terminology | Closed by the live one-folder scan and copy checks. |
| Review 3 F-3-2: SHA-256/quarantine jargon regression | Closed in visitor copy and the live holding-folder dialog. The CSV schema field is report data, not interface instruction. |
| Review 3 F-3-3: service-worker 404 returns 200 | Closed. A controlled offline unknown route returned HTTP 404. |
| Review 3 F-3-4: banner covers phone result | **Regressed in reduced form; reopened as F-5-1.** Three of 20 warmed fresh runs partly covered `Comparison result`. |
| Review 3 F-3-5: legal route and Back focus | Closed. Privacy, Terms, Back to Privacy, and Back to home focused their route headings. |
| Review 3 F-3-6: restore promise untested | Closed. `holding-folder-restore` passed. |
| Review 3 F-3-7: held-file retention untested | Closed. `holding-folder-kept` passed. |
| Review 3 F-3-8: offline scope untested | Closed. Demo reset, Privacy, Terms, and designed 404 all worked offline. |
| Review 3 F-3-9: false registry completeness sentence | Closed. The sentence is removed, and current claims are covered. |
| Review 3 F-3-10: flaky keyboard test | Closed in the declared suite. All 44 E2E tests passed; live Reset worked with Enter after completion. |
| Review 4 | It recorded zero findings. Its F-3-4 closure is superseded by the repeated review-5 evidence above. |

## Accessibility, routes, privacy, offline, and performance

- The factory `verify-url.sh` passed with no unexpected console errors, one h1, `lang=en`, a main landmark, image alternatives, and labelled buttons.
- Playwright Axe found zero violations of any impact on `/`, `/demo`, `/privacy/`, `/terms/`, and the designed 404.
- The keyboard skip link has a visible 3 px focus outline and moves focus into main content. Legal navigation and browser Back restore heading focus.
- The modal opens on its labelled close button. Tab does not reach a background control, Escape closes it, and focus returns to `Review holding folder`.
- Reduced motion matches and changes document scrolling to `auto`.
- All 11 discovered links succeeded or were valid same-document fragments. The GitHub source link returned 200.
- The only console resource errors were caused by deliberate 404 checks. They are expected responses, not defects.
- Captured application requests were same-origin only. No analytics, third-party script, CDN font, or application API was found.
- The service worker reloaded and reset the demo offline, then opened Privacy, Terms, and a designed unknown route offline. The unknown route retained HTTP 404.
- Chromium parsed the manifest with no errors. It contains the versioned start URL, standalone display, matching colors, 192/512 icons, and a maskable icon.
- Mobile Lighthouse: Performance 100, Accessibility 100, FCP 0.9 s, LCP 1.2 s, TBT 0 ms, CLS 0.
- Production build: app JavaScript 24,539 bytes raw / 9.09 kB gzip; CSS 16,025 bytes raw / 4.41 kB gzip; mobile AVIF 22,094 bytes.

There is no backend, tenant state, rate limit, CLI, library, or desktop installer in this static PWA, so those class-specific checks do not apply.

## Build and live identity

The last product-changing commit is `ee0dfefb372ef62ff16cb45f7b556e8f02b26f7e`. Later commits through documentation base `12fb9394e3465776590acccc3039f95d8e4529e8` change only reports, evidence, or Graphify output.

All 27 deployable non-source-map files from the clean production build matched their live counterparts byte for byte. There were zero mismatches.

Commands run from the detached clean worktree:

```text
npm ci
npm run test:claims:contract   # 10 exact claim commands passed
npm test                       # 10 tests passed
npm run build                  # dist produced; deployment contract passed
npm run test:e2e               # 44 tests passed
```

No product code was changed during this review.
