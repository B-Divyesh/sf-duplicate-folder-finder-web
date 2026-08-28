# Handoff — perfection loop round 1

Date: 2026-08-28

Work order: `duplicate-folder-finder-web-polish-1`

Review base: `e0035432cadede328bef2ca0a8309d8e6f8103a5`

Repair commits: `e9912c3`, `4dab0cb`, `301fe88`

Live URL: <https://duplicate-folder-finder-web.sociobot.in/>

## Result

All four BLOCKING findings in `.factory/review-1.md` are resolved. No known blocking finding remains.

- B1: `/demo`, `/demo/`, and `/?demo=1` load a completed sample comparison. The persistent banner provides **Reset demo** and **Start for real**. Demo and real reports use separate IndexedDB databases. Leaving demo deletes its report.
- B2: `.factory/claims.json` registers eight visitor-relevant claims. A contract test enforces unique test tags. Seven browser claims and one scanner claim pass as their exact listed commands.
- B3: the first screen now says “Compare folders and find exact duplicates.” The sample action and its outcome are visible at 390×844 without scrolling.
- B4: `/demo` has its own title and h1. App navigation uses history, focuses and announces the route h1, and restores through Back. Unknown paths return the designed Mirrorbyte 404 with a recovery link.

The review’s other findings are also resolved: route-specific metadata, Open Graph and Twitter tags, a 1200×630 product image, Apple touch icon, shared navigation/footer, legal links, sitemap entry, plain-language labels, mobile offline status, and copy audit.

## Verification evidence

Verification ran from a clean clone at commit `4dab0cb` after `npm ci`:

- Every command in `.factory/claims.json`: **8/8 passed individually**.
- `npm test`: **10/10 passed** across scanner, claims-contract, and deployment-contract suites.
- `npm run build`: passed; `dist/index.html`, `dist/404.html`, legal pages, manifest, and service worker produced.
- `npm run test:e2e -- --workers=1`: **28/28 passed** across desktop Chromium and Pixel 5.
- Axe checks on `/`, `/demo`, `/privacy/`, and `/terms/`: **0 serious or critical violations** in both browser projects.
- Browser coverage includes keyboard skip navigation, route focus, history, 390px overflow, demo isolation, downloads, privacy request capture, quarantine hash failure, 404 recovery, and offline reload/reset.
- Production app JavaScript: **23.94 kB raw / 8.89 kB gzip**. CSS: **15.66 kB raw / 4.36 kB gzip**.
- Local Lighthouse mobile: **100 performance / 100 accessibility**, LCP **1.7 s**, CLS **0**, TBT **0 ms**.
- Factory URL verifier: title, `lang=en`, one h1, main landmark, image alt, button names, and **0 console errors**.

The final route-normalization change in `301fe88` passed `npm test`, `npm run build`, and direct parity checks for both `/demo` and `/demo/`.

## Deployment evidence

- Pushed `main` through `301fe88` before deployment.
- Deployed `dist/` with `/opt/fleet/lib/deploy-static.sh duplicate-folder-finder-web dist`.
- Azure Static Web Apps deployment ID: `b5be7671-813b-4e79-819c-af067f54aa09`; status: **Succeeded**.
- Live routes: `/`, `/demo`, `/demo/`, `/privacy/`, `/terms/`, Apple icon, and social image return **200**. `/not-a-real-route` returns the branded **404**.
- Live `/` title: `Mirrorbyte — Compare folders and find duplicates`; live `/demo` title: `Demo — Mirrorbyte`.
- Live URL verifier found **0 console errors** on `/` and `/demo`.
- Live Lighthouse mobile: **100 performance / 100 accessibility**, LCP **1.2 s**, CLS **0**, TBT **50 ms**.
- Live offline smoke test reloaded `/demo` with its sample h1 and recorded **0 third-party requests** across 25 requests.
- Live HTML revalidates. Fingerprinted app assets use one-year immutable caching. CSP, frame denial, nosniff, referrer policy, Permissions-Policy, and HSTS are present.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run test:claims
npm run test:e2e -- --workers=1
```

The demo contract is in `.factory/demo.md`. The copy inventory is in `.factory/copy-audit.md`. The one-line catalog description is in `.factory/catalog-description.txt`.

## Known constraints

- Writable quarantine depends on Chromium’s File System Access API. Read-only folder selection remains available elsewhere.
- Browsers do not expose empty folders through the read-only file-input fallback.
- Web Crypto hashes each large file as one buffer because it has no incremental SHA-256 interface.

These are platform constraints, not unresolved review blockers.
