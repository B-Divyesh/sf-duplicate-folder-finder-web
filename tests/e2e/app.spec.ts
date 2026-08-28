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
  await page.getByRole('button', { name: 'Reset demo' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Demo reset to the original sample comparison.')).toBeVisible();
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
