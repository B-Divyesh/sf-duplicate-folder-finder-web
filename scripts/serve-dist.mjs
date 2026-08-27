import { createReadStream } from 'node:fs';
import { access, readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(new URL('../dist/', import.meta.url).pathname);
const portFlag = process.argv.indexOf('--port');
const port = portFlag === -1 ? 4173 : Number(process.argv[portFlag + 1]);
const config = JSON.parse(await readFile(join(root, 'staticwebapp.config.json'), 'utf8'));
const contentTypes = {
  '.avif': 'image/avif', '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json; charset=utf-8', '.webp': 'image/webp',
};

function headersFor(pathname) {
  const route = config.routes.find(({ route }) => route.endsWith('*')
    ? pathname.startsWith(route.slice(0, -1))
    : pathname === route);
  return { ...config.globalHeaders, ...(route?.headers ?? {}) };
}

async function fileFor(pathname) {
  // Azure Static Web Apps consumes this deployment file rather than publishing it.
  if (pathname === '/staticwebapp.config.json') return undefined;
  const requested = decodeURIComponent(pathname);
  const relative = requested === '/' ? 'index.html' : requested.replace(/^\/+/, '');
  const candidate = resolve(root, normalize(relative));
  if (!candidate.startsWith(`${root}/`) && candidate !== root) return undefined;
  try {
    const candidateStat = await stat(candidate);
    return candidateStat.isDirectory() ? join(candidate, 'index.html') : candidate;
  } catch {
    if (!extname(candidate)) {
      const index = join(candidate, 'index.html');
      try { await access(index); return index; } catch { return undefined; }
    }
    return undefined;
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1');
  const file = await fileFor(url.pathname);
  if (!file) {
    response.writeHead(404, headersFor(url.pathname));
    response.end('Not found');
    return;
  }
  response.writeHead(200, { ...headersFor(url.pathname), 'Content-Type': contentTypes[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(response);
});

server.listen(port, '127.0.0.1', () => console.log(`Static Web Apps parity server listening on http://127.0.0.1:${port}`));
