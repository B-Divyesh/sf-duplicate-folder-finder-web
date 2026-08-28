# Mirrorbyte

Mirrorbyte compares folders in the browser and finds exact duplicate subfolders. It is for people checking backups, old drives, or photo archives.

Live: <https://duplicate-folder-finder-web.sociobot.in>

Demo: <https://duplicate-folder-finder-web.sociobot.in/?demo=1>

## What it does

- Compares one folder or two folders by structure and file contents.
- Finds exact duplicate subfolders and lists changed or one-sided files.
- Exports the comparison report as JSON or CSV.
- Stores the latest real report in the browser and restores it after refresh.
- Works offline after the first visit, including the demo and legal pages.

Folder names, contents, and hashes stay in the browser. There is no account, analytics, tracking, or third-party request.

Demo data uses separate storage. Reset restores the shipped sample. Compare my folders removes the demo report.

In Chrome or Edge, Mirrorbyte can move a reviewed copy into a holding folder. It checks the copy before removing the original.

Move a held folder back to restore it. Mirrorbyte does not delete files from the holding folder.

Browser and operating-system failures remain possible. Keep a separate backup before moving valuable data.

## Run locally

Use Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Open the printed localhost URL.

## Test and build

```sh
npm test
npm run build
npm run test:claims:contract
npm run test:e2e
```

The production build writes `dist/index.html`. The demo, legal pages, and designed not-found page reload after the first online visit.

Use the local parity server to verify deployment headers and routes:

```sh
node scripts/serve-dist.mjs --port 4173
```

## Deploy

Deploy the static `dist/` directory. Azure Static Web Apps reads `staticwebapp.config.json` for routes, caching, and security headers.

## Project records

- Opportunity brief: [.factory/brief.json](.factory/brief.json)
- Visual system and asset provenance: [.factory/design.md](.factory/design.md)
- Demo contract: [.factory/demo.md](.factory/demo.md)
- Checked product claims: [.factory/claims.json](.factory/claims.json)
- Verification handoff: [.factory/handoff.md](.factory/handoff.md)
- License: [MIT](LICENSE)
