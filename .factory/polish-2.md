# Polish round 2 — finding closure

Date: 2026-08-28
Repair commit: `082698ec4298617a6df600d5a0d6b659265e154b`
Live URL: <https://duplicate-folder-finder-web.sociobot.in/>

Evidence screenshots: `.factory/evidence/live-demo/mobile-sticky.png`, `.factory/evidence/live-demo/screenshot-desktop.png`, and `.factory/evidence/live-demo/screenshot-mobile.png`. Live structural evidence is `.factory/evidence/live-demo/recheck.json` and `.factory/evidence/live-demo/verify.json`.

## Review 1

| Finding | Change made | Evidence |
| --- | --- | --- |
| B1 | Retained the isolated one-click `?demo=1` and `/demo` sample flow: dedicated `mirrorbyte-demo` storage, banner, reset, exit discard, and shipped sample comparison. | `@claim:demo-isolation`, `@claim:comparison-results`, and `@claim:offline-reload`; cold live `/demo` check returned 200 with `Demo — Mirrorbyte`. |
| B2 | Retained the claims registry and one exact tagged test per claim; added an executable registry runner so the published commands themselves are tested. | `npm run test:claims:contract` passed all eight exact commands from a fresh clone. |
| B3 | Retained the six-word job-led headline, audience sentence, visible sample button, result sentence, and facts in the 390px first viewport. | `390px first viewport shows the job and primary sample action without horizontal overflow`; live screenshot `.factory/evidence/live-demo/screenshot-mobile.png`. |
| B4 | Retained `/demo`, history/focus announcement, sitemap entry, and designed 404; completed 404 metadata in this round. | `demo navigation uses history and moves focus to the route heading`; live `/demo` 200 and `/not-a-real-route` 404 checks. |
| M1 | Retained home/legal metadata and added the missing 404 canonical, Open Graph, and Twitter metadata. | `unknown URLs return the designed 404 with a working recovery link`; live route metadata recheck in `.factory/evidence/live-demo/recheck.json`. |
| M2 | Retained the shared header/footer, Demo navigation, skip links, privacy/terms links, Param Factory build line, source disclosure, and provenance line. | `routes have titles, metadata, one h1, shared navigation, and no serious accessibility violations`; cold live checks of `/`, `/demo`, `/privacy/`, and `/terms/`. |
| Copy C1–C12 | Retained the earlier plain-language rewrite and completed its remaining terminology cleanup: visitors see `folder`/`subfolder`, direct action labels, and no customer-facing implementation jargon. | `.factory/copy-audit.md`; `npm run test:e2e` passed 32 browser tests; live screenshots above. |

## Review 2

| Finding | Change made | Evidence |
| --- | --- | --- |
| B1 | Changed the Vitest claim command to its supported `-t` syntax and added `scripts/run-claim-contract.mjs`, which executes every manifest command verbatim. | Fresh clone: `npm run test:claims:contract` passed all eight commands, including `npm test -- -t @claim:single-folder-duplicates`. |
| B2 | Kept the demo banner `sticky` at phone widths; added a regression that checks the banner, reset, and exit action after auto-scroll. | `390px demo banner and controls remain visible after the sample result scrolls into view`; live `.factory/evidence/live-demo/mobile-sticky.png` and `recheck.json` show all three in viewport. |
| H1 | Removed the untested `Free to use.` landing claim. The remaining account/privacy wording is covered by `local-only`. | `@claim:local-only`; cold live `/` has `No account required.` and no `Free to use.` text. |
| M1 | Gave header wordmark/nav and footer links 44×44px interactive boxes; retained spacing between targets. | `390px visible navigation and footer links have 44px touch targets` across five routes; live mobile screenshot. |
| M2 | Added canonical `/404`, OG title/description/url/image dimensions/alt, and Twitter card/title/description/image to the designed 404 page. | `unknown URLs return the designed 404 with a working recovery link`; live `recheck.json` has no metadata omissions. |
| M3 | Renamed the demo exit control from `Start for real` to `Compare my folders`; it still clears demo storage and returns to real mode. | `one-click sample enters the isolated demo and can return to real mode`; `@claim:demo-isolation`; live mobile screenshot. |
| M4 | Replaced the fragmentary `Discover` heading with `Read folder names and sizes`. | `.factory/copy-audit.md`; cold live `/` visual check. |
| M5 | Rewrote README and Terms support language as `Chrome or Edge` and explained the reversible holding folder before using safety terminology. | README/Terms copy audit; live `/terms/` check and `routes have titles, metadata, one h1, shared navigation, and no serious accessibility violations`. |
| M6 | Replaced visitor-facing `tree` wording with consistent `folder`/`subfolder` wording in the chooser, progress state, verdicts, manifest, README, and tests. | `.factory/copy-audit.md`; `@claim:comparison-results`; cold live `/demo` check. |

## Verification

- Fresh clone at `082698e`: `npm ci`, `npm test` (10 passed), `npm run build`, and `npm run test:claims:contract` (8/8 exact commands) passed.
- Working tree: `npm run test:e2e` passed 32/32 Chromium/mobile tests, including Axe serious/critical checks, privacy interception, offline reload, keyboard, metadata, routes, focus, 404, and touch targets.
- Live cold `/demo`: factory verifier reported `loadMs: 1052`, no console errors, one h1, `lang=en`, one main landmark, no missing image alt, and no unlabeled button. See `.factory/evidence/live-demo/verify.json`.
- Live mobile Lighthouse at `/demo`: Performance 94, Accessibility 100. See `.factory/evidence/live-demo/lighthouse.json`.
- Static deployment used `/opt/fleet/lib/deploy-static.sh duplicate-folder-finder-web dist`; the live response carries the expected same-origin CSP, frame denial, referrer policy, and permissions policy.
