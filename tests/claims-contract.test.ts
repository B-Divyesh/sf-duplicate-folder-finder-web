import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test } from 'vitest';

interface Claim {
  id: string;
  claim: string;
  where: string;
  test: string;
  sandbox: string;
}

test('every registered claim has one unique tagged test', async () => {
  const root = resolve(import.meta.dirname, '..');
  const claims = JSON.parse(await readFile(resolve(root, '.factory/claims.json'), 'utf8')) as Claim[];
  const testSource = [
    await readFile(resolve(root, 'tests/e2e/claims.spec.ts'), 'utf8'),
    await readFile(resolve(root, 'tests/scanner.test.ts'), 'utf8'),
  ].join('\n');
  expect(claims.length).toBeGreaterThan(0);
  expect(new Set(claims.map(({ id }) => id)).size).toBe(claims.length);
  for (const claim of claims) {
    expect(claim.claim.trim()).not.toBe('');
    expect(claim.where.trim()).not.toBe('');
    expect(claim.sandbox.trim()).not.toBe('');
    expect(claim.test).toContain(`@claim:${claim.id}`);
    expect(claim.test).toMatch(/^npm (?:test -- -t|run test:claims -- --grep) @claim:[a-z0-9-]+$/);
    expect(testSource.match(new RegExp(`@claim:${claim.id}(?![a-z0-9-])`, 'g'))).toHaveLength(1);
  }
});
