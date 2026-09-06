# Review 5 handoff — compare folders and find duplicate folders

## Result

Verdict: **FAIL** with one medium finding and zero untested claims.

The independent review is in `.factory/review-5.md`. No product code was changed. The finding is an intermittent 390×844 demo-scroll race: after the one-click sample, `Comparison result` was partly under the sticky demo banner in 3 of 20 warmed fresh contexts.

## Candidate and live build

- Implementation reviewed: `ee0dfefb372ef62ff16cb45f7b556e8f02b26f7e`.
- Documentation base reviewed: `12fb9394e3465776590acccc3039f95d8e4529e8`.
- All 27 deployable non-source-map build files matched the live site byte for byte.

## Verification

- `npm ci`: passed with 0 vulnerabilities.
- `npm run test:claims:contract`: all 10 exact claim commands passed.
- `npm test`: 10/10 passed.
- `npm run build`: passed and produced `dist/`.
- `npm run test:e2e`: 44/44 passed.
- Live real read-only two-folder and one-folder scans: passed; fixture files were unchanged.
- Live demo isolation, reset, exit, invalid import recovery, cancel recovery, exports, route focus, links, privacy, offline legal/404 paths, and manifest parsing: passed.
- Factory URL verifier: passed.
- Axe: zero violations on all five tested routes.
- Mobile Lighthouse: Performance 100, Accessibility 100, LCP 1.2 s, TBT 0 ms, CLS 0.

## Next step

Repair the automatic result scroll so the result heading always settles below the measured phone demo banner. Add a warmed-cache repeated browser test, then repeat the live phone review before declaring PASS.
