# Polish round 2 handoff — Mirrorbyte

Date: 2026-08-28
Work order: `duplicate-folder-finder-web-polish-2`
Repair commit: `082698ec4298617a6df600d5a0d6b659265e154b` (pushed to `origin/main`)
Deployment: <https://duplicate-folder-finder-web.sociobot.in/>

## Delivered

- Fixed every finding in `.factory/review-1.md` and `.factory/review-2.md`; the full mapping is in `.factory/polish-2.md`.
- Corrected the only failing exact claim command and added `npm run test:claims:contract`, which executes every command in `.factory/claims.json` verbatim.
- Kept the demo banner sticky at phone widths after result auto-scroll, renamed its exit action to `Compare my folders`, and added mobile regressions for the banner and 44px header/footer link targets.
- Removed the untested free-use claim; completed 404 canonical/Open Graph/Twitter metadata; made folder/subfolder wording consistent; clarified Chrome/Edge and holding-folder language in the README and Terms.
- Kept the existing pixel/demoscene Mirrorbyte identity and static PWA artifact class.

## Exact verification evidence

Fresh clone of the pushed repair (`/tmp/mirrorbyte-clean-5G43cN`):

```text
npm ci                                PASS (0 vulnerabilities)
npm test                              PASS (10 tests)
npm run build                         PASS (dist/; app JS 8.88 kB gzip)
npm run test:claims:contract          PASS (8 exact claim commands)
```

Working repair tree:

```text
npm run test:e2e                      PASS (32/32 Chromium + mobile tests)
```

The browser suite includes Axe serious/critical checks, offline demo reload/reset, same-origin network capture, report exports, demo storage isolation, quarantine verification, history/focus, metadata, 404, keyboard, first viewport, sticky banner, and touch target tests.

Live cold `/demo` verification with `/opt/fleet/lib/verify-url.sh`:

```json
{"loadMs":1052,"errors":[],"a11y":{"title":"Demo — Mirrorbyte","lang":"en","h1":1,"main":true,"imgsMissingAlt":0,"buttonsUnlabeled":0}}
```

Live mobile browser recheck after one-click sample entry found the banner, `Reset demo`, and `Compare my folders` all inside the 390×844 viewport. Route metadata recheck found no missing canonical/OG/Twitter fields or landmark/title failures. Evidence: `.factory/evidence/live-demo/recheck.json`, `.factory/evidence/live-demo/mobile-sticky.png`, and `.factory/evidence/live-demo/screenshot-mobile.png`.

Live mobile Lighthouse at `/demo`: Performance **94**, Accessibility **100** (`.factory/evidence/live-demo/lighthouse.json`).

## Deploy

Built `dist/` and deployed it with the configured static work-order route:

```text
/opt/fleet/lib/deploy-static.sh duplicate-folder-finder-web dist
```

The deployed demo and legal/404 routes were opened cold after deployment. The live response has the configured same-origin CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, referrer policy, and permissions policy.

## Known gaps

None.
