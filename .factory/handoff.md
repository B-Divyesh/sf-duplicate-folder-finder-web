# Review 3 handoff — Mirrorbyte

Date: 2026-08-28

Work order: `duplicate-folder-finder-web-review-3`

Reviewed commit: `aa833a475c837ebfabab871f7281eedbfee84fed`

## Delivered

- Wrote `.factory/review-3.md` with a `FAIL` verdict and ten findings.
- Made no product-code changes.
- Re-ran every prior review finding against the live site and source.
- Audited all landing/app and README sentences, headings, actions, jargon, terminology, and claims.

## Verification

- Fresh live 390×844 and 1440×900 first reads: job, audience, and first action are clear.
- Clean clone: `npm ci` passed; `npm test` passed 10/10; `npm run build` passed and produced `dist/`.
- Clean clone: `npm run test:claims:contract` passed all eight exact claim commands.
- Clean clone: `npm run test:e2e` failed 1/32 on the keyboard Reset race; ten isolated repeats passed 9 and failed 1.
- Live sandbox: sample loaded in one click; Reset worked; real IndexedDB sentinel survived; demo report cleared on exit; all captured requests were same-origin.
- Live offline: `/demo` reloaded and Reset worked after network interception.
- Live structure: route metadata, links, designed 404 document, shared shell, and five-route Axe serious/critical scan passed.
- Live factory verifier: 981 ms load, no console errors, one h1, `lang=en`, main present, no missing alt, no unlabeled button.

## Findings left for repair

- Blocking: visitor-facing `root` terminology remains from Review 2 M6.
- Blocking: `SHA-256` and `quarantine` jargon/term inconsistency remain from Review 1.
- Blocking: unknown routes return 200 after the service worker controls the page.
- High/medium: sticky demo banner obscures the verdict; legal-route focus is unmanaged; two holding-folder safety claims and one README offline-scope claim are unlisted; README's completeness statement is false; the keyboard E2E check races demo startup.

See `.factory/review-3.md` for exact quotes, evidence, rewrites, and required tests.
