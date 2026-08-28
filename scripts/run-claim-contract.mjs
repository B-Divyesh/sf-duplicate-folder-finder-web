import { exec } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const run = promisify(exec);
const root = new URL('..', import.meta.url);
const claims = JSON.parse(await readFile(new URL('../.factory/claims.json', import.meta.url), 'utf8'));

for (const { id, test } of claims) {
  process.stdout.write(`\nClaim ${id}: ${test}\n`);
  await run(test, { cwd: root.pathname, maxBuffer: 10 * 1024 * 1024 });
}

console.log(`\nClaim contract verified: ${claims.length} exact commands passed.`);
