# Polish round 3 — complete finding closure

Date: 2026-08-28

Work order: `duplicate-folder-finder-web-polish-3`

Base reviewed: `aa833a475c837ebfabab871f7281eedbfee84fed`
Live URL: <https://duplicate-folder-finder-web.sociobot.in/>

The deployed repair keeps Mirrorbyte's pixel-directory/demoscene visual system. It does not substitute a generic product shell. The final browser pass covers the real File System Access safety flow, an isolated demo, offline navigation, route metadata, keyboard/focus behavior, and 390 px layout.

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| Review 1 B1 | Kept the separate `mirrorbyte-demo` IndexedDB namespace and one-click `/demo` / `?demo=1` sample; the persistent banner includes Reset demo and Compare my folders, and leaving clears demo data without reading or writing the real report. | `@claim:demo-isolation`, `@claim:comparison-results`, and `@claim:offline-reload`; [`demo screenshot`](evidence/polish-3/demo/screenshot-mobile.png); final cold `/demo` check in `evidence/polish-3/live-recheck.json`. |
| Review 1 B2 | Registered every visitor promise in `.factory/claims.json`; each entry has one executable tagged test and the contract runner executes every published command verbatim. | `npm run test:claims:contract` (10/10); `.factory/claims.json`; final live same-origin demo check in `evidence/polish-3/live-recheck.json`. |
| Review 1 B3 | Kept the job-led h1, audience line, first-screen sample action, outcome text, and three facts in the 390 px first viewport. | `first screen exposes a visible sample action at 390px` browser test; [`root mobile screenshot`](evidence/polish-3/root/screenshot-mobile.png); final cold `/` check. |
| Review 1 B4 | Kept real `/demo` routing, route titles, history behavior, sitemap entry, and a Mirrorbyte-designed 404. The service worker now returns a real 404 status for unknown navigations. | `a service-worker-controlled unknown URL still returns the designed 404 status`; final `/controlled-live-not-found` HTTP 404 in `evidence/polish-3/live-recheck.json`. |
| Review 1 M1 | Retained route-specific description, canonical, Open Graph/Twitter data, original social art, SVG/favicon, and Apple touch icon on home, demo, legal, and 404 pages. | `routes have titles, metadata, one h1, shared navigation, and no serious accessibility violations`; final route scan in `evidence/polish-3/live-recheck.json`. |
| Review 1 M2 | Retained one shared header/footer with wordmark home link, Demo/Privacy navigation, skip link, legal links, Param Factory/version line, source, and art provenance. | `routes have titles, metadata, one h1, shared navigation, and no serious accessibility violations`; final root/demo/legal URL checks. |
| Review 1 Copy C1–C12 | Applied the plain-language rewrite across the landing page, runtime messages, legal copy, and README: folder/subfolder vocabulary, result-named controls, concise sentences, no customer-facing implementation jargon. | `.factory/copy-audit.md`; `single-folder results and holding-folder review avoid implementation jargon`; final `/`, `/demo`, and `/terms/` checks. |
| Review 2 B1 | Corrected the Vitest command to `-t` and retained the runner that launches each exact registry command. | `npm run test:claims:contract` (10 exact commands from clean clone); live claim behavior in `evidence/polish-3/live-recheck.json`. |
| Review 2 B2 | Made the demo banner sticky at phone widths and gave the result target a protected offset so the banner, result heading, and verdict remain visible together. | `390px demo banner and controls remain visible after the sample result scrolls into view`; [`live demo mobile`](evidence/polish-3/live-demo-mobile.png); final 390 px `/demo` check. |
| Review 2 H1 | Removed the untestable `Free to use.` promise; the remaining account/privacy facts are covered by the local-only claim. | `@claim:local-only`; final cold root copy check. |
| Review 2 M1 | Kept 44 px minimum interactive boxes for header, navigation, and footer links on every route. | `390px visible navigation and footer links have 44px touch targets`; final mobile root/demo/legal checks. |
| Review 2 M2 | Retained canonical, Open Graph, and Twitter metadata on the designed 404 route. | `routes have titles, metadata, one h1, shared navigation, and no serious accessibility violations`; final unknown-route check returns 404 in `evidence/polish-3/live-recheck.json`. |
| Review 2 M3 | Kept the explicit exit label `Compare my folders`; it clears demo data and returns to the real workspace. | `@claim:demo-isolation`; final demo banner check. |
| Review 2 M4 | Kept the self-contained heading `Read folder names and sizes`. | `.factory/copy-audit.md`; final cold root check. |
| Review 2 M5 | Kept the plain browser names Chrome/Edge and explains the holding folder before safety actions. | `.factory/copy-audit.md`; final `/terms/` check and holding-folder claim tests. |
| Review 2 M6 | Removed the remaining hierarchy aliases; visitors now see `folder` and `subfolder` consistently. | `single-folder results and holding-folder review avoid implementation jargon`; final imported-report live check. |
| F-3-1 | Replaced static and runtime `root`/`tree` terms with `ONE-FOLDER SCAN` and `Optional for a one-folder scan`; imported one-folder reports are covered. | `single-folder results and holding-folder review avoid implementation jargon`; final live imported report check. |
| F-3-2 | Replaced customer-facing `SHA-256` with content hashes and every safety label/dialog/status/error with holding folder. The physical hidden directory name remains implementation-only. | `single-folder results and holding-folder review avoid implementation jargon`; `@claim:quarantine-verification`; final holding dialog check. |
| F-3-3 | Changed generated service-worker unknown-navigation handling to create a response from the designed 404 body with status 404, retaining headers/content type. | `a service-worker-controlled unknown URL still returns the designed 404 status`; final `/controlled-live-not-found` status 404. |
| F-3-4 | Added mobile result scroll clearance for the sticky demo bar; the h2 and verdict now land below it. | `390px demo banner and controls remain visible after the sample result scrolls into view`; [`live demo mobile`](evidence/polish-3/live-demo-mobile.png). |
| F-3-5 | Legal and 404 documents now focus and announce their h1 on entry and browser Back/forward restores meaningful focus. | `legal routes and Back place focus on their route heading`; final live Privacy then Back focus check. |
| F-3-6 | Added the `holding-folder-restore` registry claim and full in-memory File System Access fixture that verifies restored path and bytes after a verified move. | `@claim:holding-folder-restore`; final claims-contract run. |
| F-3-7 | Added the `holding-folder-kept` registry claim and fixture assertion that the held copy persists without a holding-folder removal action. | `@claim:holding-folder-kept`; final claims-contract run. |
| F-3-8 | Expanded `offline-reload` and its test to reload/reset demo, Privacy, Terms, and the designed unknown route after the first online visit. | `@claim:offline-reload`; final offline demo/privacy/terms/404 check. |
| F-3-9 | Removed the false README assertion that the manifest was complete; README now makes only claims listed and tested in the registry. | README/`.factory/claims.json` cross-check; final clean-clone claims-contract run. |
| F-3-10 | The keyboard test waits for automatic sample completion and an enabled Reset demo control; a separate assertion proves disabled controls cannot activate during scanning. | `keyboard skip link and demo reset controls remain operable` and `demo controls stay disabled while sample loading`; final `npm run test:e2e` pass. |

## Final evidence

- Clean-clone evidence and final deployment identifiers are recorded in `.factory/handoff.md`.
- `evidence/polish-3/lighthouse-live-root.json` and `evidence/polish-3/lighthouse-live-demo-headless.json` each record 100 performance, 100 accessibility, and CLS 0 without a runtime error.
- `evidence/polish-3/live-recheck.json` is the final cold live route, focus, offline, service-worker-404, wording, and mobile recheck.
