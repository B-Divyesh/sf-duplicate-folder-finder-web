import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';

const base = 'https://duplicate-folder-finder-web.sociobot.in';
const evidence = '/work/repo/.factory/evidence/polish-3';
const fail = (message) => { throw new Error(message); };
const browser = await chromium.launch({ headless: true });
const report = { base, checkedAt: new Date().toISOString(), routes: {}, checks: [], consoleErrors: [] };

try {
  const routeContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const routePage = await routeContext.newPage();
  for (const [path, title, status] of [
    ['/', 'Mirrorbyte — Compare folders and find duplicates', 200],
    ['/demo', 'Demo — Mirrorbyte', 200],
    ['/privacy/', 'Privacy — Mirrorbyte', 200],
    ['/terms/', 'Terms — Mirrorbyte', 200],
    ['/cold-live-not-found', 'Page not found — Mirrorbyte', 404],
  ]) {
    const response = await routePage.goto(base + path, { waitUntil: 'networkidle' });
    if (response?.status() !== status) fail(`${path} expected ${status}, got ${response?.status()}`);
    if (await routePage.title() !== title) fail(`${path} title mismatch`);
    if (await routePage.locator('h1').count() !== 1 || await routePage.locator('main').count() !== 1) fail(`${path} landmark count mismatch`);
    const results = await new AxeBuilder({ page: routePage }).analyze();
    const seriousCritical = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? '')).map((v) => v.id);
    if (seriousCritical.length) fail(`${path} axe ${seriousCritical.join(',')}`);
    report.routes[path] = { status: response?.status(), title, axeSeriousCritical: seriousCritical.length };
  }
  await routeContext.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const mobilePage = await mobile.newPage();
  mobilePage.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('404')) report.consoleErrors.push(message.text());
  });
  await mobilePage.goto(base + '/', { waitUntil: 'networkidle' });
  const cta = mobilePage.getByRole('link', { name: 'Try it with sample data' }).first();
  const ctaBox = await cta.boundingBox();
  if (!ctaBox || ctaBox.y + ctaBox.height > 844 || await mobilePage.evaluate(() => document.documentElement.scrollWidth > 390)) fail('mobile first action unavailable');
  await cta.click();
  await mobilePage.getByRole('heading', { name: 'These folders do not fully match.' }).waitFor();
  await mobilePage.waitForTimeout(350);
  const banner = await mobilePage.locator('#demo-banner').boundingBox();
  for (const locator of [mobilePage.getByRole('heading', { name: 'Comparison result' }), mobilePage.getByRole('heading', { name: 'These folders do not fully match.' })]) {
    const box = await locator.boundingBox();
    if (!banner || !box || box.y < banner.y + banner.height || box.y + box.height > 844) fail('demo result hidden by banner');
  }
  await mobilePage.screenshot({ path: `${evidence}/live-demo-mobile.png`, fullPage: false });
  report.checks.push('cold 390px first action, one-click demo, and unobscured result');

  await mobilePage.getByRole('button', { name: 'Compare my folders' }).click();
  const single = { schemaVersion: 1, createdAt: '2026-08-28T00:00:00.000Z', mode: 'single-root', roots: [{ side: 'A', name: 'Archive', fileCount: 1, folderCount: 0, bytes: 4, hash: 'same' }], relation: 'single-root', differences: { onlyA: [], onlyB: [], changed: [] }, duplicates: [], errors: [] };
  await mobilePage.locator('#import-input').setInputFiles({ name: 'single-folder-report.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(single)) });
  await mobilePage.getByText('ONE-FOLDER SCAN', { exact: true }).waitFor();
  const mainText = await mobilePage.locator('main').innerText();
  if (!mainText.includes('ONE-FOLDER SCAN') || /ONE-ROOT|one-root|SHA-256|quarantine|folder tree/i.test(mainText)) fail('visitor terminology regression');
  await mobilePage.evaluate(() => document.getElementById('quarantine-dialog').showModal());
  const dialogText = await mobilePage.getByRole('dialog').innerText();
  if (!dialogText.includes('holding folder') || /SHA-256|quarantine/i.test(dialogText)) fail('holding dialog terminology regression');
  report.checks.push('live single-folder and holding-folder wording');
  await mobile.close();

  const focus = await browser.newContext();
  const focusPage = await focus.newPage();
  await focusPage.goto(base + '/', { waitUntil: 'networkidle' });
  await focusPage.getByRole('link', { name: 'Privacy', exact: true }).first().click();
  await focusPage.getByRole('heading', { name: 'Privacy without fine print.' }).waitFor();
  if (!await focusPage.getByRole('heading', { name: 'Privacy without fine print.' }).evaluate((node) => document.activeElement === node)) fail('privacy focus not moved');
  await focusPage.goBack();
  await focusPage.getByRole('heading', { name: /Compare folders/ }).waitFor();
  if (!await focusPage.getByRole('heading', { name: /Compare folders/ }).evaluate((node) => document.activeElement === node)) fail('back focus not moved');
  report.checks.push('live legal route and Back focus');
  await focus.close();

  const service = await browser.newContext();
  const servicePage = await service.newPage();
  await servicePage.goto(base + '/demo', { waitUntil: 'networkidle' });
  await servicePage.waitForFunction(() => navigator.serviceWorker?.ready);
  await servicePage.reload({ waitUntil: 'networkidle' });
  await servicePage.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  const controlled = await servicePage.goto(base + '/controlled-live-not-found', { waitUntil: 'networkidle' });
  if (controlled?.status() !== 404 || !await servicePage.getByRole('heading', { name: 'This folder path ends here.' }).isVisible()) fail('controlled unknown route is not a 404');
  await servicePage.goto(base + '/demo', { waitUntil: 'networkidle' });
  await service.setOffline(true);
  await servicePage.reload({ waitUntil: 'networkidle' });
  await servicePage.getByRole('heading', { name: 'These folders do not fully match.' }).waitFor();
  await servicePage.getByRole('button', { name: 'Reset demo' }).click();
  await servicePage.getByText('Demo reset to the original sample comparison.').waitFor();
  for (const [path, heading] of [['/privacy/', 'Privacy without fine print.'], ['/terms/', 'Review before you remove.']]) {
    await servicePage.goto(base + path, { waitUntil: 'networkidle' });
    await servicePage.getByRole('heading', { name: heading }).waitFor();
  }
  const offline404 = await servicePage.goto(base + '/offline-live-not-found', { waitUntil: 'networkidle' });
  if (offline404?.status() !== 404 || !await servicePage.getByRole('heading', { name: 'This folder path ends here.' }).isVisible()) fail('offline unknown route is not a 404');
  await service.setOffline(false);
  report.checks.push('service-worker 404 and offline demo/privacy/terms/404');
  await service.close();

  if (report.consoleErrors.length) fail(`console errors: ${report.consoleErrors.join(' | ')}`);
  await writeFile(`${evidence}/live-recheck.json`, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
