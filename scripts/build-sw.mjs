import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = new URL('../dist/', import.meta.url).pathname;
async function filesAt(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await filesAt(path));
    else if (!entry.name.endsWith('.map') && entry.name !== 'sw.js' && entry.name !== 'staticwebapp.config.json') output.push(`/${relative(root, path)}`);
  }
  return output;
}

const assets = [...new Set([...await filesAt(root), '/', '/?source=pwa&v=1'])].sort();
const version = createHash('sha256').update(assets.join('|') + await readFile(join(root, 'index.html'), 'utf8')).digest('hex').slice(0, 10);
const source = `const CACHE = 'mirrorbyte-${version}';
const PRECACHE = ${JSON.stringify(assets)};
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('mirrorbyte-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      const local = new URL(event.request.url);
      const shell = local.pathname === '/' ? '/' : local.pathname.endsWith('/') ? local.pathname + 'index.html' : '/offline.html';
      const cached = await caches.match(event.request, { ignoreSearch: true }) || await caches.match(shell);
      if (cached) {
        event.waitUntil(fetch(event.request).then(response => caches.open(CACHE).then(cache => cache.put(event.request, response))).catch(() => undefined));
        return cached;
      }
      return fetch(event.request).catch(() => caches.match('/offline.html'));
    })());
    return;
  }
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(response => { if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); } return response; })));
});
`;
await writeFile(join(root, 'sw.js'), source);
console.log(`Service worker ${version}: ${assets.length} files precached`);
