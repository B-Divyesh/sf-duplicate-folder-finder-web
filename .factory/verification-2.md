# Independent verification — PASS

Date: 2026-08-27
Work order: `duplicate-folder-finder-web-verify-2`
Candidate: `a0cc8819346a79140516b3aef3663b21a81b15a6` (`factory: repair duplicate-folder-finder-web-repair-1`)
Live URL: <https://duplicate-folder-finder-web.sociobot.in/>

## Verdict

**PASS.** The production deployment matches the requested candidate and satisfies the researched brief's local-first folder-comparison workflow and the PWA delivery contract. The preceding deployment-only caching/security failure is fixed in fresh live evidence.

## Clean-checkout verification

A new detached worktree at the candidate (`/tmp/duplicate-folder-finder-qa.80zv4T`) was used; Node `v22.23.2`, npm `10.9.8`. `npm ci` completed with **0 vulnerabilities**.

| Check | Result / evidence |
| --- | --- |
| Unit/integration | `npm test`: **9/9 passed**. This includes exact trees, containment in both directions, changed same-size files, empty directories, duplicate suppression, path normalization, and a synthetic **50,000-file** comparison. |
| Type/build | Exact `npm run build`: **passed** (`tsc --noEmit`, Vite production build, service-worker build, deployment-artifact contract). The worker precached **24** paths; its deployment policy check confirmed **17** fingerprinted immutable assets. There is no repository lint script, so no lint check is available beyond TypeScript. |
| Repository browser suite | With one explicitly controlled production parity server, `npx playwright test --workers=1`: **8/8 passed** in Desktop Chromium and Pixel 5. It covers scan/export, home/privacy/terms axe checks, 390px layout, and offline service-worker reload. |
| Native-folder workflow | The actual UI was driven against safe in-browser File System Access handle doubles: exact nested folders including an empty directory classified as **identical**; A with one extra file versus empty B classified as **B contained in A**; an unreadable `locked.txt` completed with an explicit exclusion warning. No console or page errors occurred. |
| Invalid input/recovery | A malformed JSON report showed `Could not import that report`; the next sample scan completed normally. The disabled scan button prevents submitting before folder A is selected. |
| Safe cleanup flow | Using writable File System Access doubles through the UI, an eligible duplicate was selected, the review dialog was confirmed, the copy/hash/verify/remove path completed, and the success toast reported the timestamped quarantine destination. No source code was changed for this test. |
| Desktop/mobile/keyboard/motion | Live desktop and **390×844** mobile show the primary heading and action. Keyboard Tab reaches `Skip to folder comparison` with a solid **3px** focus ring. In a reduced-motion context live CSS reports `scroll-behavior: auto` and `0.01ms` transition duration. |
| Accessibility | Independent live axe scan found **0 serious/critical** violations; the home page has exactly one `<h1>` and one `<main>`. Repository axe tests also passed on home, privacy, and terms. |
| Errors and privacy | Live normal/sample/offline use yielded **0 console errors** and **0 page errors**. Runtime requests were same-origin only; source audit found no analytics, CDN fonts/scripts, or application network API. Scan reports are local IndexedDB data; privacy and terms pages are shipped. |
| PWA/offline/update | After service-worker control, the live app reloaded offline with its heading visible. Local offline tests also completed a sample scan. On an isolated copy of the exact production artifact, changing only the served worker revision, calling `registration.update()`, and waiting for `controllerchange` displayed `Mirrorbyte was updated for offline use.` |
| Performance budgets | Production bundle: app JS **20,704 B raw / 7,975 B gzip**; CSS **14,028 B raw / 4,077 B gzip**; mobile hero AVIF **22,094 B**. All meet the ≤200 KB JS, ≤50 KB CSS, and ≤300 KB hero budgets. Live Lighthouse mobile (Chrome 145): **94 performance**, **100 accessibility**; FCP **1.1 s**, LCP **1.2 s**, CLS **0**, TBT **300 ms**. |

## Live deployment identity and response policy

Fresh SHA-256 comparison of every deployable non-source-map artifact in local `dist/` with its corresponding live URL: **23/23 matched, 0 mismatches**. `index.html` was `6bd6c0e0dcf672fc28c7b068719fbca65881fe75fb9fd18c9d5d0d17ea1118d6` on both sides.

- `/assets/app-BCSgPf8v.js`: `Cache-Control: public, max-age=31536000, immutable`.
- `/`, `/sw.js`, `/privacy/`, and the manifest: `Cache-Control: no-cache, must-revalidate`.
- Live HTML, service worker, and app asset include the restrictive same-origin CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Permissions-Policy`, strict referrer policy, and HSTS.
- The live manifest has standalone display, versioned `start_url`, matching dark splash colors, 192/512 icons, and a maskable 512 icon.

## Defects by severity

| Severity | Defects |
| --- | --- |
| Blocker / Critical / High | None found. |
| Medium | None found. The prior live immutable-caching and browser-policy defects are resolved. |
| Low | None found. |

## Reproduce

```sh
npm ci
npm test
npm run build
npx playwright install chromium
node scripts/serve-dist.mjs --port 4173
npx playwright test --workers=1
CHROME_PATH=/opt/pw-browsers/chromium-1208/chrome-linux64/chrome \
  npx lighthouse https://duplicate-folder-finder-web.sociobot.in/ \
  --only-categories=performance,accessibility --form-factor=mobile \
  --chrome-flags='--headless=new --no-sandbox'
```

## Known product constraints

File System Access selection and reversible quarantine are Chromium capabilities; the browser-upload fallback is read-only and cannot represent empty directories. Browser-native symlink/permission behavior depends on the chosen filesystem; unreadable-file reporting was exercised with a handle error. These are disclosed constraints from the researched brief, not verification failures.
