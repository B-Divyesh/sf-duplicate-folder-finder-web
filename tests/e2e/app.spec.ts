import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('one-click sample enters the isolated demo and can return to real mode', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).first().click();
  await expect(page).toHaveURL(/\?demo=1$/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'These folders do not fully match.' })).toBeVisible();
  await page.getByRole('button', { name: 'Compare my folders' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeHidden();
  expect(errors).toEqual([]);
});

test('routes have titles, metadata, one h1, shared navigation, and no serious accessibility violations', async ({ page }) => {
  const routes = [
    { path: '/', title: 'Mirrorbyte — Compare folders and find duplicates' },
    { path: '/demo', title: 'Demo — Mirrorbyte' },
    { path: '/privacy/', title: 'Privacy — Mirrorbyte' },
    { path: '/terms/', title: 'Terms — Mirrorbyte' },
  ];
  for (const route of routes) {
    await page.goto(route.path);
    await expect(page).toHaveTitle(route.title);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /1200x630/);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/icons/icon-180.png');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  }
});

test('demo navigation uses history and moves focus to the route heading', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Demo', exact: true }).first().click();
  await expect(page).toHaveURL('/demo');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Inspect sample folders');
  await page.goBack();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Compare folders');
});

test('unknown URLs return the designed 404 with a working recovery link', async ({ page }) => {
  const response = await page.goto('/not-a-real-route');
  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle('Page not found — Mirrorbyte');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://duplicate-folder-finder-web.sociobot.in/404');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /1200x630/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  await expect(page.getByRole('heading', { name: 'This folder path ends here.' })).toBeVisible();
  await page.getByRole('link', { name: 'Return to folder comparison' }).click();
  await expect(page).toHaveURL('/');
});

test('a service-worker-controlled unknown URL still returns the designed 404 status', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => navigator.serviceWorker?.ready);
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  const response = await page.goto('/controlled-not-found');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'This folder path ends here.' })).toBeVisible();
});

test('app shell and direct demo route work offline after installation', async ({ page, context }) => {
  await page.goto('/demo');
  await page.waitForFunction(() => navigator.serviceWorker?.ready);
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: /Inspect sample folders/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'These folders do not fully match.' })).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));
  await expect(page.getByText('You are offline')).toBeVisible();
  await context.setOffline(false);
});

test('390px first viewport shows the job and primary sample action without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const heading = page.getByRole('heading', { name: /Compare folders and find exact duplicates/ });
  const action = page.getByRole('link', { name: 'Try it with sample data' }).first();
  await expect(heading).toBeVisible();
  await expect(action).toBeVisible();
  const box = await action.boundingBox();
  expect(box && box.y + box.height).toBeLessThanOrEqual(844);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('keyboard skip link and demo reset controls remain operable', async ({ page }) => {
  await page.goto('/demo');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to folder comparison' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  const reset = page.getByRole('button', { name: 'Reset demo' });
  await expect(page.getByRole('heading', { name: 'These folders do not fully match.' })).toBeVisible();
  await expect(reset).toBeEnabled();
  await reset.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Demo reset to the original sample comparison.')).toBeVisible();
});

test('demo controls cannot run while the sample is still scanning', async ({ page }) => {
  await page.addInitScript(() => {
    const NativeWorker = window.Worker;
    class DelayedWorker extends NativeWorker {
      postMessage(message: any, options?: StructuredSerializeOptions | Transferable[]): void {
        window.setTimeout(() => {
          if (Array.isArray(options)) super.postMessage(message, options);
          else super.postMessage(message, options);
        }, 350);
      }
    }
    Object.defineProperty(window, 'Worker', { configurable: true, value: DelayedWorker });
  });
  await page.goto('/demo');
  const reset = page.getByRole('button', { name: 'Reset demo' });
  const leave = page.getByRole('button', { name: 'Compare my folders' });
  await expect(reset).toBeDisabled();
  await expect(leave).toBeDisabled();
  await expect(page.getByText('Demo reset to the original sample comparison.')).toBeHidden();
  await expect(page.getByRole('heading', { name: 'These folders do not fully match.' })).toBeVisible();
  await expect(reset).toBeEnabled();
  await expect(leave).toBeEnabled();
});

test('390px demo banner and controls remain visible after the sample result scrolls into view', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).first().click();
  await expect(page.getByRole('heading', { name: 'These folders do not fully match.' })).toBeVisible();
  await page.waitForTimeout(300);
  for (const control of [
    page.getByText('Demo — sample data, nothing is saved'),
    page.getByRole('button', { name: 'Reset demo' }),
    page.getByRole('button', { name: 'Compare my folders' }),
  ]) {
    const box = await control.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(844);
  }
  const banner = await page.locator('#demo-banner').boundingBox();
  expect(banner).not.toBeNull();
  for (const resultPart of [page.getByRole('heading', { name: 'Comparison result' }), page.getByRole('heading', { name: 'These folders do not fully match.' })]) {
    const box = await resultPart.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(banner!.y + banner!.height);
    expect(box!.y + box!.height).toBeLessThanOrEqual(844);
  }
});

test('legal routes and Back place focus on their route heading', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Privacy', exact: true }).first().click();
  await expect(page).toHaveURL('/privacy/');
  await expect(page.getByRole('heading', { name: 'Privacy without fine print.' })).toBeFocused();
  await page.getByRole('link', { name: 'Terms', exact: true }).click();
  await expect(page).toHaveURL('/terms/');
  await expect(page.getByRole('heading', { name: 'Review before you remove.' })).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL('/privacy/');
  await expect(page.getByRole('heading', { name: 'Privacy without fine print.' })).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
});

test('single-folder results and holding-folder review avoid implementation jargon', async ({ page }) => {
  await page.goto('/');
  const report = {
    schemaVersion: 1,
    createdAt: '2026-08-28T00:00:00.000Z',
    mode: 'single-root',
    roots: [{ side: 'A', name: 'Archive', fileCount: 1, folderCount: 0, bytes: 4, hash: 'same' }],
    relation: 'single-root', differences: { onlyA: [], onlyB: [], changed: [] }, duplicates: [], errors: [],
  };
  await page.locator('#import-input').setInputFiles({ name: 'single-folder-report.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(report)) });
  await expect(page.getByText('ONE-FOLDER SCAN', { exact: true })).toBeVisible();
  await expect(page.locator('main')).not.toContainText(/ONE-ROOT|one-root|SHA-256|quarantine|folder tree/i);
  await page.evaluate(() => (document.getElementById('quarantine-dialog') as HTMLDialogElement).showModal());
  await expect(page.getByRole('dialog')).toContainText('Move the reviewed copies to a holding folder?');
  await expect(page.getByRole('dialog')).not.toContainText(/SHA-256|quarantine/i);
});

test('390px visible navigation and footer links have 44px touch targets', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/', '/demo', '/privacy/', '/terms/', '/not-a-real-route']) {
    await page.goto(route);
    for (const link of await page.locator('header a:visible, footer a:visible').all()) {
      const box = await link.boundingBox();
      expect(box, `${route} has a visible link without a box`).not.toBeNull();
      expect(box!.width, `${route} link ${await link.innerText()} is too narrow`).toBeGreaterThanOrEqual(44);
      expect(box!.height, `${route} link ${await link.innerText()} is too short`).toBeGreaterThanOrEqual(44);
    }
  }
});
