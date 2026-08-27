# Independent verification — FAIL

Date: 2026-08-27  
Work order: `duplicate-folder-finder-web-verify-1`  
Candidate: `65672c1c18b58741059a9d3027793416654ca749` (`docs: complete safety hardening and release handoff`)  
Live URL: <https://duplicate-folder-finder-web.sociobot.in/>

## Verdict

**FAIL** for the factory PWA delivery contract. The application is functionally sound in the exercised paths and the deployment exactly serves the candidate build, but the live host does not provide the required immutable caching for versioned assets and omits baseline browser hardening headers. These are deployment defects; no product source was modified during verification.

## Clean-checkout verification

A detached clean worktree at the candidate SHA was used (`/tmp/duplicate-folder-finder-web-verify-65672c1`; Node 22.23.2, npm 10.9.8). `npm ci` completed with 0 audit vulnerabilities.

| Check | Result / evidence |
| --- | --- |
| Unit/integration | `npm test`: **8/8 passed**. Includes deterministic path normalization, identical, both containment directions, same-size changed content, empty directories, duplicate suppression, and 50,000 pre-hashed entries. |
| Type/build | `npm run build`: **passed** (`tsc --noEmit`, Vite production build, SW generation); service worker precached 24 paths. No lint script is defined. |
| Repository E2E | `npm run test:e2e`: **8/8 passed** in Desktop Chromium and Pixel 5. It covers sample scan/export, home/privacy/terms axe checks, offline reload, and mobile flow. Chromium was installed first because this disposable environment had no Playwright browser. |
| Independent File System Access flow | Mocked native handles through the actual UI: identical nested tree with an empty directory => exact; empty-directory-vs-empty-root boundary => B contained in A; unreadable file => scan completed with `locked.txt: permission denied` warning and no console/page errors. |
| Malformed/recovery | Invalid JSON import showed a precise error; the following sample scan succeeded. |
| Desktop/mobile/keyboard/motion | Desktop and 390×844 flows passed. Tab reaches the skip link with a visible solid amber focus outline; Enter navigates to `main`. Reduced motion yields `scroll-behavior: auto` and `0.01ms` transitions. |
| Accessibility | Repository axe tests passed across home, privacy, and terms for desktop/mobile. Independent axe against the populated local page and live 390px page found **0 serious/critical** violations. Lighthouse mobile accessibility: **100**. |
| Console/page errors | None during local independent flows or live online/offline flow. |
| PWA/offline/update | Local and live service-worker-controlled offline reload worked; the sample scan completed offline. A controlled service-worker revision on an isolated static server produced `Mirrorbyte was updated for offline use.` with no errors. |
| Privacy/outbound | Runtime requests during normal and offline use stayed same-origin only. Source contains no analytics, external scripts, CDN fonts, or network API. Reports are stored locally in IndexedDB; privacy/terms pages are present. |
| Performance/budget | Build app JS 20,704 bytes raw / 7,944 gzip; worker 428 bytes; primary CSS 14,028 bytes raw / 4,060 gzip; mobile AVIF 22,094 bytes. All are below stated budgets. Live mobile Lighthouse: Performance **100**, Accessibility **100**; FCP 1.1 s, LCP 1.2 s, TBT 0 ms, CLS 0. |
| Candidate/live identity | SHA-256 compared **all 23** non-source-map `dist/` files to their live URL counterparts: **0 mismatches**. `index.html` SHA-256 was `d30ff712cd70c4d0330d71260dd8447ad8f3973005603c403986070612adb102` on both. |

## Defects

### Medium — versioned static assets are not immutably cached

Live `index.html`, `/assets/app-BCSgPf8v.js`, `/sw.js`, and `/privacy/` all return `Cache-Control: public, must-revalidate, max-age=30`. The factory PWA/performance contract calls for long-lived immutable caching of hashed assets. The service worker precache masks this after first use, but normal HTTP caching still revalidates the hashed app bundle every 30 seconds. Configure the static host so hashed `/assets/*` receive a long immutable lifetime (while HTML and `sw.js` remain short/no-cache as appropriate).

### Medium — baseline response hardening policy is absent

The live response has HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Content-Type-Options: nosniff`, but lacks a `Content-Security-Policy`, `frame-ancestors`/`X-Frame-Options`, and `Permissions-Policy`. Add a restrictive CSP suitable for the static PWA and disallow framing/unused browser capabilities at the deployment layer. (`X-XSS-Protection` is present but legacy and not a substitute.)

## Security/header evidence

Live HTTPS was enforced. Observed headers include HSTS (`max-age=10886400; includeSubDomains; preload`), referrer policy, nosniff, and DNS-prefetch control. Missing headers above are the reason this is not a clean security/caching pass. No tracking or third-party network destinations were observed.

## Reproduce

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:e2e
CHROME_PATH=/path/to/chrome npx lighthouse https://duplicate-folder-finder-web.sociobot.in/ \
  --only-categories=performance,accessibility --chrome-flags='--headless=new --no-sandbox'
curl -I https://duplicate-folder-finder-web.sociobot.in/assets/app-BCSgPf8v.js
```

## Scope notes

No code was changed. Native quarantine writes require a real Chromium File System Access grant and were reviewed in code but cannot be safely exercised against a user filesystem in this disposable verifier. The actual scan, unreadable-entry recovery, local persistence/report paths, exports, service worker, and update behavior were exercised.
