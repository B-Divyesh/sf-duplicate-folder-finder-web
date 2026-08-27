import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('sample scan completes and exposes differences and exports', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await page.getByRole('button', { name: 'Try a tiny example' }).click();
  await expect(page.getByRole('heading', { name: 'These folder trees do not fully match.' })).toBeVisible();
  await expect(page.locator('.row-match').filter({ hasText: 'B:albums' })).toBeVisible();
  await page.getByRole('button', { name: /Changed/ }).click();
  await expect(page.getByText('receipts/2025.txt')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export JSON' })).toBeEnabled();
  expect(errors).toEqual([]);
});

test('home and legal pages have no serious accessibility violations', async ({ page }) => {
  for (const path of ['/', '/privacy/', '/terms/']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  }
});

test('app shell reloads offline after service worker installation', async ({ page, context }) => {
  await page.goto('/');
  await page.waitForFunction(() => navigator.serviceWorker?.ready);
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: /Know which folders/ })).toBeVisible();
  await page.getByRole('button', { name: 'Try a tiny example' }).click();
  await expect(page.getByRole('heading', { name: 'These folder trees do not fully match.' })).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));
  await expect(page.getByText('You are offline')).toBeVisible();
  await context.setOffline(false);
});

test('mobile layout keeps primary actions visible at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Try a tiny example' }).click();
  await expect(page.getByRole('heading', { name: 'These folder trees do not fully match.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export JSON' })).toBeVisible();
});
