import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test } from 'vitest';

const configPath = resolve(import.meta.dirname, '../public/staticwebapp.config.json');

test('Static Web Apps contract keeps immutable assets and a private, frame-safe shell', async () => {
  const config = JSON.parse(await readFile(configPath, 'utf8')) as {
    globalHeaders: Record<string, string>;
    routes: Array<{ route: string; headers?: Record<string, string> }>;
  };
  const headersFor = (route: string) => config.routes.find((entry) => entry.route === route)?.headers ?? {};

  expect(headersFor('/assets/*')['Cache-Control']).toBe('public, max-age=31536000, immutable');
  expect(headersFor('/*')['Cache-Control']).toBe('no-cache, must-revalidate');
  expect(config.globalHeaders['Content-Security-Policy']).toContain("default-src 'self'");
  expect(config.globalHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'");
  expect(config.globalHeaders['X-Frame-Options']).toBe('DENY');
  expect(config.globalHeaders['Permissions-Policy']).toContain('camera=()');
  expect(config.globalHeaders['Permissions-Policy']).not.toContain('file-system-access=()');
});
