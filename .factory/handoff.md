# Handoff — duplicate-folder-finder-web deployment-contract repair

Date: 2026-08-27
Work order: `duplicate-folder-finder-web-repair-1`
Base verifier commit: `7c450ede7e5ff4a5ece354bbbdfb64d83a2ff805`

## Delivered

- Added `public/staticwebapp.config.json`, which Vite copies to the root of `dist/` for Static Web Apps deployment. It sends a restrictive same-origin CSP, `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, strict referrer policy, and a restrictive Permissions-Policy.
- Added ordered cache routes: all content-fingerprinted `/assets/*` responses receive `Cache-Control: public, max-age=31536000, immutable`; the app shell, legal pages, manifest, icons, offline page, and `sw.js` receive `Cache-Control: no-cache, must-revalidate` so updates are always revalidated safely.
- Content-fingerprinted the shipped hero images before placing them under the immutable `/assets/*` route. This prevents an asset path from remaining stale after a visual update.
- Added a build artifact contract check and unit regression for the Static Web Apps cache/security policy. The build fails if the output does not contain the config, a required hardening header, safe shell revalidation, or only fingerprinted immutable assets.
- Added a small local Static Web Apps parity host and made browser tests use it, so the PWA, File System Access flow, offline reload/update toast, local IndexedDB state, CSP, cache rules, and headers are exercised together. It also hides the deployment config exactly as Azure does, preventing a deployment-only file from entering the service-worker precache. No product data is sent off-device.

## Verification

Completed from a clean dependency install (`npm ci`) on 2026-08-27:

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
node scripts/serve-dist.mjs --port 4180
curl -sSI http://127.0.0.1:4180/
curl -sSI http://127.0.0.1:4180/assets/app-BCSgPf8v.js
curl -sSI http://127.0.0.1:4180/sw.js
```

- Unit and contract tests: **9/9 passed**.
- Production build: passed. The generated service worker precached **24** paths. The artifact contract verified **17** fingerprinted assets.
- Browser suite: **8/8 passed** on desktop Chromium and Pixel 5 using the header-parity host. This includes local sample scan/export, serious/critical axe checks on home/privacy/terms, mobile layout, a service-worker-controlled offline reload, and the in-app offline state.
- Local header parity: `/assets/app-BCSgPf8v.js` returned the one-year immutable policy; `/` and `/sw.js` returned `no-cache, must-revalidate`; all returned CSP, frame protection, and Permissions-Policy.
- The prior independent File System Access scan coverage remains intact: exact nested/empty-directory comparison, containment boundary, unreadable-file warning recovery, malformed report recovery, local-only request audit, update toast, keyboard/reduced-motion, and production Lighthouse mobile 100 performance / 100 accessibility results are recorded in `.factory/verification.md`.

## Deployment and live parity

- Deployed the corrected `dist/` artifact from `3e6b7f9` to the existing **Standard-tier Azure Static Web App** `sf-duplicate-folder-finder-web` in `sociobot`. No plan, billing, DNS, or other infrastructure setting was changed.
- Live checks at `https://duplicate-folder-finder-web.sociobot.in/` passed after deploy: `/assets/app-BCSgPf8v.js` returns `public, max-age=31536000, immutable`; `/` and `/sw.js` return `no-cache, must-revalidate`; all three return the configured CSP, `X-Frame-Options: DENY`, and Permissions-Policy.
- The live HTML references the new content-fingerprinted hero assets, confirming the deployed artifact matches this repair.
- A fresh live Chromium session registered `mirrorbyte-f16f738887`, then reloaded the app offline with the expected folder-comparison heading and no console errors.

## Known constraints

- File System Access and reversible quarantine remain Chromium-only. Directory-upload fallback stays read-only and cannot expose empty directories.
- Very large individual files are hashed in a worker as one buffer because Web Crypto has no incremental SHA-256 API.
- Static Web Apps tier selection is deployment infrastructure, not an application-source setting. This repair is compatible only with the existing Standard-tier static app and does not create or modify any infrastructure.
