# Handoff — duplicate-folder-finder-web build 1

Date: 2026-08-27

Work order: `duplicate-folder-finder-web-build-1`

Deploy: static `dist/` (`index.html` is at its root)

## Shipped

- Built Mirrorbyte, a Vite + vanilla TypeScript offline PWA for comparing two folder trees or finding duplicate subfolders inside one root.
- Implemented local directory traversal (including empty directories through File System Access), SHA-256 worker hashing, deterministic per-folder Merkle hashes, identical/contained/different classification, and file-level only-in-A/only-in-B/changed views.
- Added exact folder-pair findings, JSON and CSV export, JSON report import, and latest-report persistence in IndexedDB.
- Implemented the guarded Chromium quarantine flow: scan is read-only; write access is requested only on confirmation; roots and overlapping selections are blocked; each source is copied into `.mirrorbyte-quarantine-{timestamp}`, re-hashed, and removed only after verification succeeds. Browser-upload fallback remains read-only.
- Added scan cancellation, unreadable-item warnings, zero-file handling, offline/network state, restored-scan state, responsive 390px layout, keyboard focus treatment, native dialog focus handling, and reduced-motion behavior.
- Added an install manifest, any/maskable icons, generated versioned precache service worker, network-first navigation fallback, update state, privacy page, terms page, robots, and sitemap.
- Defined the product-specific pixel/demoscene “Mirrorbyte console” visual system in `.factory/design.md`. Generated and reviewed the original folder-tower hero with the factory Azure OpenAI image tool; prompt, review, and license provenance are stored in `assets/src/`. Responsive AVIF/WebP and optimized PNG outputs ship locally.

## Verification

Commands run successfully from `/work/repo`:

```sh
npm test
npm run build
npm run test:e2e
VERIFY_NODE_MODULES=/work/repo/node_modules /opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 /tmp/mirrorbyte-verify
```

- Unit: 8/8 passing, including an identical classification over two synthetic 50,000-file snapshots (50,000 entries retained; under 0.4 seconds in the final run).
- Browser: 8/8 passing across desktop Chromium and Pixel 5 emulation. Coverage includes the sample scan/results, mobile 390px flow, no console errors, full axe checks on home/privacy/terms, and a service-worker-controlled reload with Playwright offline mode.
- Factory URL verifier: HTTP 200; title present; `lang=en`; exactly one h1; main landmark present; 0 images missing alt; 0 unlabeled buttons; 0 console/page errors; observed load 564 ms locally.
- Lighthouse 12.8.2, simulated mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.4 s, CLS 0, total blocking time 0 ms, speed index 0.9 s.
- Production payload: app JS 20.70 KB raw / 7.95 KB gzip; worker JS 0.43 KB; shared CSS 14.06 KB raw / 4.06 KB gzip. Mobile hero AVIF 22 KB (WebP 33 KB); all are below contract budgets.
- Visual inspection completed at 1440×1000 and 390×844 for initial and populated-result states.

## Known gaps and honest constraints

- Writable directory access and quarantine require the File System Access API in a Chromium browser. Safari/Firefox can scan with `webkitdirectory`/directory input where supported, but cannot expose truly empty folders or permit quarantine.
- Web Crypto does not expose incremental SHA-256 in the browser. Each file is read into one worker’s memory for hashing; extremely large individual files can be memory-intensive, and large trees will take time.
- Symlinks are not surfaced as symlinks by the browser directory API. Permission-denied entries are excluded and explicitly reported; a result with warnings should not be treated as complete.
- Quarantine needs enough free space for a full verified copy and is not an operating-system trash integration. Users restore or remove quarantine manually.
- The 50,000-file test validates deterministic tree construction and comparison with synthetic pre-hashed entries; actual content-hashing throughput depends on disk, browser, and file sizes.

## Next steps

- Add a streaming/WASM SHA-256 implementation to bound memory for multi-gigabyte files.
- Add an optional scan-history list and resume/relink workflow for users reconciling drives over several sessions.
- Exercise quarantine against removable-drive interruption scenarios in a dedicated browser hardware test matrix.
