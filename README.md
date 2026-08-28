# Mirrorbyte

Mirrorbyte compares folders in the browser and finds exact duplicate subfolders. It is for people checking backups, old drives, or photo archives.

Live: <https://duplicate-folder-finder-web.sociobot.in>

Demo: <https://duplicate-folder-finder-web.sociobot.in/?demo=1>

## What it does

- Compares one folder or two folders by structure and file contents.
- Finds exact duplicate subfolders and lists changed or one-sided files.
- Exports the comparison report as JSON or CSV.
- Stores the latest real report in the browser and restores it after refresh.
- Works offline after the first visit.

Folder names, contents, and hashes stay in the browser. There is no account, analytics, tracking, or third-party request.

Demo data uses separate storage. Reset restores the shipped sample. Starting for real removes the demo report.

On supported Chromium browsers, Mirrorbyte can quarantine a reviewed duplicate. It verifies the copy before removing the original.

Browser and operating-system failures remain possible. Keep a separate backup before moving valuable data.

Every product promise is registered in [.factory/claims.json](.factory/claims.json). Each entry names its exact automated test and sandbox evidence.

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
npm run test:claims
npm run test:e2e
```

Playwright 1.58.2 matches the browser bundle supplied by the factory worker.

The production build writes `dist/index.html`. The service worker precaches the app, demo, legal pages, and designed 404 response.

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
- Verification handoff: [.factory/handoff.md](.factory/handoff.md)
- License: [MIT](LICENSE)
