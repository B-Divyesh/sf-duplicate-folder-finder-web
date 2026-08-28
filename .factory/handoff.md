# Polish round 3 handoff — Mirrorbyte

Date: 2026-08-28

Work order: `duplicate-folder-finder-web-polish-3`

Reviewed base: `aa833a475c837ebfabab871f7281eedbfee84fed`

Product repair commits: `e0db5a5c11cc22bc7180094a212091235fd0bc02`, `ee0dfefb372ef62ff16cb45f7b556e8f02b26f7e`

Live: <https://duplicate-folder-finder-web.sociobot.in/>
Deployment: `aa4d0cb8-7c9d-4918-879a-a76660f5a525`

## Delivered

- Closed every finding in Review 1, Review 2, and Review 3. The complete ID-by-ID map is in `.factory/polish-3.md`.
- Kept the original pixel-directory/demoscene identity while making the first phone screen say the job plainly and expose `Try it with sample data` in one click.
- Shipped isolated `/demo` and `?demo=1` sample data, a persistent banner, Reset demo, Compare my folders, and separate `mirrorbyte-demo` storage that is discarded on exit.
- Registered ten observable claims in `.factory/claims.json`, including demo isolation, exports, same-origin privacy, offline demo/legal/404 reloads, and both holding-folder safety promises.
- Fixed visitor terminology, service-worker-controlled 404 status, mobile result clearance, legal/Back focus, keyboard reset timing, metadata, route behavior, and 44 px mobile targets.
- Added a demo-only first-paint reservation so automatic sample rendering has no layout shift.

## Exact verification evidence

Fresh remote clone: `/tmp/mirrorbyte-clean-OUO9vd` at `ee0dfefb372ef62ff16cb45f7b556e8f02b26f7e`.

| Check | Result |
| --- | --- |
| `npm ci` | Passed; 0 vulnerabilities. |
| `npm test` | Passed: 10 tests. |
| `npm run build` | Passed; `dist/` produced, 28 files precached, deployment contract passed, application JS 9.09 kB gzip. |
| `npm run test:claims:contract` | Passed: all 10 exact manifest commands, including every `@claim:` test. |
| `npm run test:e2e` | Passed: 44/44 Chromium and mobile tests. Includes Axe serious/critical assertions, claim behavior, privacy request interception, offline reload, worker-controlled 404, keyboard, focus, metadata, mobile banner/result, vocabulary, and touch targets. |
| Factory URL verifier | Passed cold `/` (561 ms) and `/demo` (926 ms): correct title/lang/one h1/main, no missing alt or unlabeled button, no console errors. Artifacts: `evidence/polish-3/root/verify.json`, `evidence/polish-3/demo/verify.json`. |
| Final live recheck | Passed cold `/`, `/demo`, `/privacy/`, `/terms/`, and an unknown route. All four real routes return 200; the unknown route returns 404; every checked route has zero serious/critical Axe findings. It also proves mobile demo visibility, holding-folder wording, Privacy/Back focus, controlled 404, and offline demo/legal/404 use. Artifact: `evidence/polish-3/live-recheck.json`; screenshot: `evidence/polish-3/live-demo-mobile.png`. |
| Lighthouse, live mobile | Root and demo: performance 100, accessibility 100, CLS 0, no runtime error. Artifacts: `evidence/polish-3/lighthouse-live-root.json`, `evidence/polish-3/lighthouse-live-demo-headless.json`. |

## Run and deploy

```sh
npm ci
npm test
npm run build
npm run test:claims:contract
npm run test:e2e
```

Deploy `dist/` with:

```sh
/opt/fleet/lib/deploy-static.sh duplicate-folder-finder-web dist
```

## Known gaps / next steps

None. The release is local-first, has no account or external runtime dependency, and preserves the original static PWA deployment class.
