# Review 2 handoff

Date: 2026-08-28

Work order: `duplicate-folder-finder-web-review-2`

Role: reviewer

Reviewed commit: `fdd83fe38613eb7556fdbcd7385d7fea2eeba7ec`

## What was done

- Performed cold first-read checks on the live site at 390×844 and 1440×900.
- Exercised the one-click demo, reset/exit behavior, separate IndexedDB storage, same-origin-only network behavior, and offline reload/reset.
- Ran every command declared in `.factory/claims.json` from a clean clone.
- Crawled routes, assets, and links; checked metadata, history/focus behavior, the designed 404, console output, mobile touch targets, and visual identity.
- Ran the factory URL verifier and Axe against the live routes.
- Audited every landing/demo and README sentence for word count and reviewed headings, controls, jargon, and terminology.
- Wrote `.factory/review-2.md`. Product code was not changed.

## Verdict

FAIL. The two blocking findings are:

1. `npm test -- --grep @claim:single-folder-duplicates` fails because Vitest does not support `--grep`.
2. At 390 px, the demo auto-scrolls to results while the banner is non-sticky, leaving the sandbox notice and reset/exit controls off-screen.

The report also records an unlisted `Free to use` claim, undersized mobile touch targets, missing 404 social/canonical metadata, and four copy/terminology issues.

## Verification summary

- `npm ci`: passed in a clean clone.
- Exact claim commands: 7 passed, 1 blocking failure.
- Corrected single-folder filter (`npm test -- -t @claim:single-folder-duplicates`): passed.
- `npm test`: 10/10 passed.
- `npm run build`: passed; `dist/` produced; app JS 8.89 kB gzip.
- `npm run test:e2e`: 28/28 passed.
- Live factory URL verification: passed with no console errors.
- Live Axe checks: no serious or critical violations on `/`, `/demo`, `/privacy/`, `/terms/`, or the designed 404.
- Live link crawl: no dead links found.

## Next steps

Fix B1 and B2 first, add regression tests for both, then address the non-blocking findings in severity order and rerun the exact claims manifest commands from a clean clone.
