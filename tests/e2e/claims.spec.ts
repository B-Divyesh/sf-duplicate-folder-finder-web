import { expect, test, type Page } from '@playwright/test';

const demoResult = async (page: Page): Promise<void> => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'These folders do not fully match.' })).toBeVisible();
};

test('@claim:comparison-results identifies matching folders and file differences', async ({ page }) => {
  await demoResult(page);
  await expect(page.locator('.row-match').filter({ hasText: 'B:albums' })).toBeVisible();
  await page.getByRole('button', { name: /Changed/ }).click();
  await expect(page.getByText('receipts/2025.txt')).toBeVisible();
  await page.getByRole('button', { name: /Only in B/ }).click();
  await expect(page.getByText('new/note.txt')).toBeVisible();
});

test('@claim:local-only makes no third-party request during the complete demo flow', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await demoResult(page);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('Demo reset to the original sample comparison.')).toBeVisible();
  expect(requests.length).toBeGreaterThan(0);
  expect(requests.every((request) => new URL(request).origin === 'http://127.0.0.1:4173')).toBe(true);
  await expect(page.locator('script[src^="http"]')).toHaveCount(0);
  await expect(page.locator('form[action]')).toHaveCount(0);
});

test('@claim:offline-reload reloads and resets the demo without a network', async ({ page, context }) => {
  await demoResult(page);
  await page.waitForFunction(() => navigator.serviceWorker?.ready);
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'These folders do not fully match.' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('Demo reset to the original sample comparison.')).toBeVisible();
  await context.setOffline(false);
});

test('@claim:report-exports downloads complete JSON and CSV reports', async ({ page }) => {
  await demoResult(page);
  const jsonDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const json = JSON.parse(await (await jsonDownload).createReadStream().then(async (stream) => {
    let body = '';
    for await (const chunk of stream) body += chunk.toString();
    return body;
  }));
  expect(json.duplicates).toHaveLength(1);
  expect(json.differences.changed[0].path).toBe('receipts/2025.txt');

  const csvDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const stream = await (await csvDownload).createReadStream();
  let csv = '';
  for await (const chunk of stream) csv += chunk.toString();
  expect(csv.split('\n')[0]).toBe('"type","side","path","matches_side","matches_path","files","bytes","sha256"');
  expect(csv).toContain('"duplicate-folder","A","albums","B","albums"');
  expect(csv).toContain('"changed","A/B","receipts/2025.txt"');
});

test('@claim:demo-isolation resets demo data and preserves the real report', async ({ page }) => {
  await page.goto('/demo');
  await page.evaluate(async () => {
    const request = indexedDB.open('mirrorbyte-local', 1);
    await new Promise<void>((resolve, reject) => {
      request.onupgradeneeded = () => request.result.createObjectStore('reports');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
    const db = request.result;
    const tx = db.transaction('reports', 'readwrite');
    tx.objectStore('reports').put({ schemaVersion: 1, createdAt: '2026-08-28T00:00:00.000Z', mode: 'single-root', roots: [{ side: 'A', name: 'Real archive', fileCount: 0, folderCount: 0, bytes: 0, hash: 'real-report' }], relation: 'single-root', differences: { onlyA: [], onlyB: [], changed: [] }, duplicates: [], errors: [] }, 'latest');
    await new Promise<void>((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
    db.close();
  });
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.getByRole('button', { name: 'Compare my folders' }).click();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeHidden();
  const stores = await page.evaluate(async () => {
    const read = (name: string) => new Promise<unknown>((resolve, reject) => {
      const open = indexedDB.open(name, 1);
      open.onerror = () => reject(open.error);
      open.onupgradeneeded = () => open.result.createObjectStore('reports');
      open.onsuccess = () => {
        const request = open.result.transaction('reports').objectStore('reports').get('latest');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      };
    });
    return { real: await read('mirrorbyte-local'), demo: await read('mirrorbyte-demo') };
  });
  expect((stores.real as { roots: Array<{ name: string }> }).roots[0]?.name).toBe('Real archive');
  expect(stores.demo).toBeUndefined();
});

test('@claim:local-persistence restores the latest real report after reload', async ({ page }) => {
  await demoResult(page);
  await page.getByRole('button', { name: 'Compare my folders' }).click();
  const report = {
    schemaVersion: 1,
    createdAt: '2026-08-28T00:00:00.000Z',
    mode: 'compare',
    roots: [
      { side: 'A', name: 'Archive', fileCount: 1, folderCount: 0, bytes: 4, hash: 'same' },
      { side: 'B', name: 'Backup', fileCount: 1, folderCount: 0, bytes: 4, hash: 'same' },
    ],
    relation: 'identical', differences: { onlyA: [], onlyB: [], changed: [] }, duplicates: [], errors: [],
  };
  await page.locator('#import-input').setInputFiles({ name: 'report.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(report)) });
  await expect(page.getByText('Report imported. File actions stay disabled until you re-select and scan the folders.')).toBeVisible();
  await page.reload();
  await expect(page.getByText(/Saved scan/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'These folders match exactly.' })).toBeVisible();
});

test('@claim:quarantine-verification keeps an original when the copied content does not match', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { removed: false, writes: 0 };
    class MemoryFileHandle {
      kind = 'file' as const;
      constructor(public name: string, public content: string, private corrupt = false) {}
      async getFile() { return new File([this.content], this.name, { lastModified: 1 }); }
      async createWritable() {
        return {
          write: async (blob: Blob) => { state.writes += 1; this.content = this.corrupt ? `${await blob.text()}-changed` : await blob.text(); },
          close: async () => undefined,
          abort: async () => undefined,
        };
      }
    }
    class MemoryDirectoryHandle {
      kind = 'directory' as const;
      children = new Map<string, MemoryDirectoryHandle | MemoryFileHandle>();
      constructor(public name: string, private corruptWrites = false) {}
      async *entries() { for (const entry of this.children) yield entry; }
      async getDirectoryHandle(name: string, options?: { create?: boolean }) {
        const found = this.children.get(name);
        if (found instanceof MemoryDirectoryHandle) return found;
        if (!options?.create) throw new DOMException('Missing folder', 'NotFoundError');
        const created = new MemoryDirectoryHandle(name, this.corruptWrites || name.startsWith('.mirrorbyte-quarantine-'));
        this.children.set(name, created);
        return created;
      }
      async getFileHandle(name: string, options?: { create?: boolean }) {
        const found = this.children.get(name);
        if (found instanceof MemoryFileHandle) return found;
        if (!options?.create) throw new DOMException('Missing file', 'NotFoundError');
        const created = new MemoryFileHandle(name, '', this.corruptWrites);
        this.children.set(name, created);
        return created;
      }
      async removeEntry(name: string) { state.removed = true; this.children.delete(name); }
      async requestPermission() { return 'granted'; }
    }
    const root = (name: string, folder: string) => {
      const item = new MemoryDirectoryHandle(name, name === 'Folder A');
      const child = new MemoryDirectoryHandle(folder, name === 'Folder A');
      child.children.set('same.txt', new MemoryFileHandle('same.txt', 'matching-content'));
      item.children.set(folder, child);
      return item;
    };
    const picks = [root('Folder A', 'copy'), root('Folder B', 'archive')];
    Object.assign(window, { __mirrorbyteState: state, showDirectoryPicker: async () => picks.shift() });
  });
  await demoResult(page);
  await page.getByRole('button', { name: 'Compare my folders' }).click();
  await page.getByRole('button', { name: 'Choose folder A', exact: true }).click();
  await page.getByRole('button', { name: 'Choose folder B', exact: true }).click();
  await page.getByRole('button', { name: 'Compare these folders' }).click();
  await page.getByRole('checkbox', { name: /Select copy/ }).check();
  await page.getByRole('button', { name: 'Review quarantine' }).click();
  await page.getByRole('button', { name: 'Copy, verify & move' }).click();
  await expect(page.getByRole('alert')).toContainText('Verification failed. The original was left in place');
  const state = await page.evaluate(() => (window as unknown as { __mirrorbyteState: { removed: boolean; writes: number } }).__mirrorbyteState);
  expect(state.writes).toBeGreaterThan(0);
  expect(state.removed).toBe(false);
});
