# Mirrorbyte

Mirrorbyte compares one or two folder trees in the browser and identifies exact duplicate directories. It is for people checking backups, reconciling old drives, or cleaning photo and document archives without installing a desktop utility or uploading private files.

Live: <https://duplicate-folder-finder-web.sociobot.in>

## What it does

- Reads a single folder to find duplicate subfolders, or compares folder A with folder B.
- Hashes file content locally with SHA-256 workers and builds deterministic folder-level Merkle signatures.
- Classifies two roots as identical, A contained in B, B contained in A, or different.
- Lists files only on one side, same-path changed files, and exact matching folder pairs.
- Exports a portable JSON report or spreadsheet-friendly CSV.
- On supporting Chromium browsers, copies selected duplicates into a timestamped quarantine folder, verifies the copy, and only then removes the original.
- Saves the latest report in IndexedDB and works offline after the first visit.

Folder names, file contents, and hashes are never sent to a server. There are no accounts, analytics, third-party scripts, or CDN assets.

## Browser support

Chrome, Edge, and other Chromium browsers provide the full File System Access workflow, including quarantine. Firefox and Safari use the directory-input fallback: scanning and exports work, but the selection is read-only and empty folders that contain no files cannot be observed by that fallback.

Quarantine is deliberately conservative. Root folders cannot be selected, nested selections are prevented, write permission is requested only after confirmation, and a copied folder must reproduce the scan-time Merkle hash before its original is removed. Keep an independent backup before reorganizing valuable data.

## Develop

Requires Node.js 20 or newer.

```sh
npm install
npm run dev
```

Open the printed localhost URL. Localhost is a secure browser context, so directory and cryptographic APIs are available.

## Test and build

```sh
npm test          # deterministic scanner/Merkle tests, including 50k files
npm run build     # exact production command; writes dist/index.html
npx playwright install chromium  # once on a fresh machine
npm run test:e2e # desktop/mobile UI, axe, console, and offline checks
```

The static deploy artifact is `dist/`. Serve that directory with SPA-independent routes preserved (`/privacy/index.html` and `/terms/index.html`). The build generates a versioned service worker and precaches the complete app shell.

## Project notes

- Product scope: [.factory/brief.json](.factory/brief.json)
- Visual system and asset provenance: [.factory/design.md](.factory/design.md)
- Verification and known gaps: [.factory/handoff.md](.factory/handoff.md)
- License: [MIT](LICENSE)
