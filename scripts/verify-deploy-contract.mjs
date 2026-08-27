import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../dist/', import.meta.url).pathname;
const config = JSON.parse(await readFile(join(root, 'staticwebapp.config.json'), 'utf8'));
const immutable = 'public, max-age=31536000, immutable';
const revalidate = 'no-cache, must-revalidate';
const assetRoute = config.routes.find((entry) => entry.route === '/assets/*');
const fallbackRoute = config.routes.find((entry) => entry.route === '/*');

assert.equal(assetRoute?.headers?.['Cache-Control'], immutable, 'hashed assets must be immutable for one year');
assert.equal(fallbackRoute?.headers?.['Cache-Control'], revalidate, 'HTML and service worker must revalidate safely');
assert.match(config.globalHeaders?.['Content-Security-Policy'] ?? '', /default-src 'self'/, 'CSP must be same-origin by default');
assert.match(config.globalHeaders?.['Content-Security-Policy'] ?? '', /frame-ancestors 'none'/, 'CSP must prevent framing');
assert.equal(config.globalHeaders?.['X-Frame-Options'], 'DENY', 'legacy frame protection must be present');
assert.match(config.globalHeaders?.['Permissions-Policy'] ?? '', /camera=\(\)/, 'unused browser permissions must be disabled');
assert.doesNotMatch(config.globalHeaders?.['Permissions-Policy'] ?? '', /file-system-access=\(\)/, 'local directory access must remain available');

const assets = await readdir(join(root, 'assets'));
for (const asset of assets) {
  assert.match(asset, /-[A-Za-z0-9_-]{8,}\.[^.]+(?:\.map)?$/, `immutable asset lacks a content fingerprint: ${asset}`);
}
for (const required of ['index.html', 'offline.html', 'sw.js', 'staticwebapp.config.json', 'privacy/index.html', 'terms/index.html']) {
  await readFile(join(root, required));
}

console.log(`Deployment contract verified: ${assets.length} fingerprinted assets, hardened headers, safe shell revalidation.`);
