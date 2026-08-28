import './style.css';
import { collectDirectory, filesFromInput, scanSources } from './scanner';
import { quarantineFolder } from './quarantine';
import { clearReport, loadReport, saveReport } from './storage';
import type { DuplicateFinding, ScanProgress, ScanReport, SelectedSource, Side } from './types';

const selected = new Map<Side, SelectedSource>();
const selectedFindings = new Set<string>();
let activeReport: ScanReport | undefined;
let activeFilter: 'duplicates' | 'onlyA' | 'onlyB' | 'changed' = 'duplicates';
let controller: AbortController | undefined;
let lastFocused: HTMLElement | null = null;
let demoMode = location.pathname.replace(/\/$/, '') === '/demo' || new URLSearchParams(location.search).get('demo') === '1';

const byId = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing element: ${id}`);
  return element as T;
};

const scanButton = byId<HTMLButtonElement>('scan-button');
const progressPanel = byId<HTMLDivElement>('scan-progress');
const errorMessage = byId<HTMLDivElement>('error-message');
const resultsSection = byId<HTMLElement>('results');
const dialog = byId<HTMLDialogElement>('quarantine-dialog');

for (const side of ['A', 'B'] as const) {
  byId<HTMLButtonElement>(`choose-${side.toLowerCase()}`).addEventListener('click', () => chooseFolder(side));
  byId<HTMLInputElement>(`input-${side.toLowerCase()}`).addEventListener('change', (event) => inputFolder(side, event));
}

scanButton.addEventListener('click', () => startScan());
for (const id of ['hero-demo', 'sample-button']) byId<HTMLAnchorElement>(id).addEventListener('click', enterDemoFromLink);
document.querySelectorAll<HTMLAnchorElement>('a[href="/demo"], a[href="/"]').forEach((link) => link.addEventListener('click', navigateInsideApp));
byId('reset-demo').addEventListener('click', resetDemo);
byId('start-real').addEventListener('click', startForReal);
byId('cancel-button').addEventListener('click', () => controller?.abort());
byId('export-json').addEventListener('click', () => exportJson());
byId('export-csv').addEventListener('click', () => exportCsv());
byId('import-button').addEventListener('click', () => byId<HTMLInputElement>('import-input').click());
byId<HTMLInputElement>('import-input').addEventListener('change', importReport);
byId('quarantine-button').addEventListener('click', openQuarantineDialog);
byId('confirm-quarantine').addEventListener('click', confirmQuarantine);
dialog.addEventListener('close', () => lastFocused?.focus());
document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((button) => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter as typeof activeFilter;
  document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((tab) => tab.setAttribute('aria-pressed', String(tab === button)));
  renderList();
}));

async function chooseFolder(side: Side): Promise<void> {
  clearError();
  const picker = (window as Window & { showDirectoryPicker?: (options?: { mode?: 'read' | 'readwrite' }) => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker;
  if (!picker) {
    byId<HTMLInputElement>(`input-${side.toLowerCase()}`).click();
    return;
  }
  try {
    const handle = await picker({ mode: 'read' });
    setSourceStatus(side, `Reading ${handle.name}…`, true);
    const collected = await collectDirectory(handle);
    selected.set(side, { side, name: handle.name, files: collected.files, directories: collected.directories, errors: collected.errors, handle });
    setSourceStatus(side, `${handle.name} · ${formatCount(collected.files.length, 'file')}`, true);
    if (collected.errors.length) showError(`Selected with ${collected.errors.length} unreadable item(s). They will be listed in the report.`);
    scanButton.disabled = false;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return;
    setSourceStatus(side, side === 'A' ? 'No folder selected' : 'Optional for a one-folder scan', false);
    showError(`Could not open folder ${side}. ${messageOf(error)} Try the folder-upload fallback in another browser.`);
  }
}

function inputFolder(side: Side, event: Event): void {
  clearError();
  const input = event.currentTarget as HTMLInputElement;
  if (!input.files?.length) return;
  const source = filesFromInput(input.files);
  selected.set(side, { side, name: source.name, files: source.files, directories: source.directories });
  setSourceStatus(side, `${source.name} · ${formatCount(source.files.length, 'file')} · read-only`, true);
  scanButton.disabled = false;
}

function setSourceStatus(side: Side, message: string, isSelected: boolean): void {
  byId(`source-${side.toLowerCase()}-status`).textContent = message;
  document.querySelector(`.source-card[data-side="${side}"]`)?.classList.toggle('selected', isSelected);
}

async function loadSample(): Promise<void> {
  const makeFile = (content: string, name: string): File => new File([content], name, { lastModified: 1, type: 'text/plain' });
  selected.set('A', {
    side: 'A', name: 'Photo archive', directories: ['albums', 'receipts'], files: [
      { path: 'albums/cover.txt', file: makeFile('pixels', 'cover.txt') },
      { path: 'albums/index.txt', file: makeFile('summer', 'index.txt') },
      { path: 'receipts/2025.txt', file: makeFile('paid', '2025.txt') },
    ],
  });
  selected.set('B', {
    side: 'B', name: 'Backup drive', directories: ['albums', 'receipts', 'new'], files: [
      { path: 'albums/cover.txt', file: makeFile('pixels', 'cover.txt') },
      { path: 'albums/index.txt', file: makeFile('summer', 'index.txt') },
      { path: 'receipts/2025.txt', file: makeFile('changed', '2025.txt') },
      { path: 'new/note.txt', file: makeFile('only in backup', 'note.txt') },
    ],
  });
  setSourceStatus('A', 'Photo archive · 3 files · sample', true);
  setSourceStatus('B', 'Backup drive · 4 files · sample', true);
  scanButton.disabled = false;
  await startScan();
}

async function startScan(): Promise<void> {
  const a = selected.get('A');
  if (!a) {
    showError('Choose folder A first. Folder B is optional.');
    return;
  }
  if (!crypto.subtle) {
    showError('Secure hashing is unavailable here. Open Mirrorbyte over HTTPS or on localhost.');
    return;
  }
  clearError();
  selectedFindings.clear();
  controller = new AbortController();
  const storageSpace = demoMode ? 'demo' : 'real';
  setScanning(true);
  try {
    const b = selected.get('B');
    const { report } = await scanSources(a, b, updateProgress, controller.signal, [...(a.errors ?? []), ...(b?.errors ?? [])]);
    activeReport = report;
    await saveReport(report, storageSpace);
    renderReport(report);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') showError('Scan cancelled. No files were changed.');
    else showError(`The scan stopped. ${messageOf(error)}`);
  } finally {
    setScanning(false);
    controller = undefined;
  }
}

function setScanning(scanning: boolean): void {
  progressPanel.hidden = !scanning;
  scanButton.disabled = scanning || !selected.has('A');
  document.querySelectorAll<HTMLButtonElement>('.choose-button, #reset-demo, #start-real').forEach((button) => { button.disabled = scanning; });
  for (const id of ['hero-demo', 'sample-button']) byId(id).setAttribute('aria-disabled', String(scanning));
}

function updateProgress(progress: ScanProgress): void {
  const labels = { discovering: 'Discovering files', hashing: 'Hashing file contents', comparing: 'Comparing folders' };
  const percent = progress.total === 0 ? 100 : Math.round((progress.done / progress.total) * 100);
  byId('progress-label').textContent = labels[progress.phase];
  byId('progress-count').textContent = `${progress.done.toLocaleString()} / ${progress.total.toLocaleString()}`;
  byId('progress-detail').textContent = progress.detail;
  byId('progress-bar').style.width = `${percent}%`;
  const track = document.querySelector<HTMLElement>('.progress-track');
  track?.setAttribute('aria-valuenow', String(percent));
}

function renderReport(report: ScanReport, restored = false): void {
  activeReport = report;
  resultsSection.hidden = false;
  const rootA = report.roots.find((root) => root.side === 'A');
  const rootB = report.roots.find((root) => root.side === 'B');
  byId('scan-time').textContent = `${restored ? 'Saved scan' : 'Scanned'} ${new Date(report.createdAt).toLocaleString()}`;
  const verdict = verdictFor(report);
  const verdictBox = byId('verdict');
  verdictBox.className = `verdict ${verdict.tone}`.trim();
  byId('verdict-icon').textContent = verdict.icon;
  byId('verdict-label').textContent = verdict.label;
  byId('verdict-title').textContent = verdict.title;
  byId('verdict-copy').textContent = verdict.copy;
  const totalDifferences = report.differences.onlyA.length + report.differences.onlyB.length + report.differences.changed.length;
  byId('summary-grid').innerHTML = [
    ['Files in A', rootA?.fileCount ?? 0],
    [rootB ? 'Files in B' : 'Folders scanned', rootB?.fileCount ?? rootA?.folderCount ?? 0],
    ['Exact folder pairs', report.duplicates.length],
    ['File differences', totalDifferences],
  ].map(([label, value]) => `<div><dt>${escapeHtml(String(label))}</dt><dd>${Number(value).toLocaleString()}</dd></div>`).join('');
  byId('duplicate-count').textContent = String(report.duplicates.length);
  byId('only-a-count').textContent = String(report.differences.onlyA.length);
  byId('only-b-count').textContent = String(report.differences.onlyB.length);
  byId('changed-count').textContent = String(report.differences.changed.length);
  const warnings = byId('scan-warnings');
  warnings.hidden = report.errors.length === 0;
  warnings.textContent = report.errors.length ? `${report.errors.length} item(s) could not be read and were excluded: ${report.errors.join(' · ')}` : '';
  if (!report.duplicates.length && activeFilter === 'duplicates' && totalDifferences) activeFilter = report.differences.onlyA.length ? 'onlyA' : report.differences.onlyB.length ? 'onlyB' : 'changed';
  document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((tab) => tab.setAttribute('aria-pressed', String(tab.dataset.filter === activeFilter)));
  renderList();
  if (!restored) {
    const protectedTop = demoMode ? (matchMedia('(max-width: 720px)').matches ? 248 : 72) : 16;
    const top = Math.max(0, resultsSection.getBoundingClientRect().top + window.scrollY - protectedTop);
    if (demoMode) {
      const previous = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo({ top, behavior: 'auto' });
      document.documentElement.style.scrollBehavior = previous;
    } else window.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
}

function verdictFor(report: ScanReport): { tone: string; icon: string; label: string; title: string; copy: string } {
  switch (report.relation) {
    case 'identical': return { tone: '', icon: '✓', label: 'IDENTICAL', title: 'These folders match exactly.', copy: 'Names, paths, sizes, and content hashes all agree.' };
    case 'a-contained': return { tone: 'warning', icon: '⊂', label: 'A IS CONTAINED IN B', title: 'Everything in A is present in B.', copy: 'B has additional items. Review them before treating B as a clean backup.' };
    case 'b-contained': return { tone: 'warning', icon: '⊃', label: 'B IS CONTAINED IN A', title: 'Everything in B is present in A.', copy: 'A has additional items. B is not a complete copy of A.' };
    case 'single-root': return { tone: report.duplicates.length ? 'warning' : '', icon: report.duplicates.length ? '≡' : '✓', label: 'ONE-FOLDER SCAN', title: report.duplicates.length ? 'Exact duplicate folders were found.' : 'No duplicate folders were found.', copy: 'Only non-nested folders with matching full structures and content are paired.' };
    default: return { tone: 'danger', icon: '≠', label: 'DIFFERENT', title: 'These folders do not fully match.', copy: 'Review items present on one side or changed at the same path.' };
  }
}

function renderList(): void {
  if (!activeReport) return;
  const list = byId('result-list');
  if (activeFilter === 'duplicates') {
    list.innerHTML = activeReport.duplicates.length ? activeReport.duplicates.map((finding) => duplicateRow(finding)).join('') : emptyRow('No exact duplicate folders in this scan.');
    list.querySelectorAll<HTMLInputElement>('input[data-finding]').forEach((input) => input.addEventListener('change', () => {
      if (input.checked) {
        const candidate = activeReport?.duplicates.find((finding) => finding.id === input.dataset.finding);
        const conflict = candidate && activeReport?.duplicates.find((finding) => selectedFindings.has(finding.id) && finding.sourceSide === candidate.sourceSide && pathsOverlap(finding.sourcePath, candidate.sourcePath));
        if (conflict) {
          input.checked = false;
          showToast(`Choose either ${conflict.sourceName} or ${candidate.sourceName}; nested folders move together.`);
          return;
        }
        selectedFindings.add(input.dataset.finding!);
      }
      else selectedFindings.delete(input.dataset.finding!);
      renderQuarantineBar();
    }));
  } else {
    const rows = activeReport.differences[activeFilter];
    const empty = activeFilter === 'onlyA' ? 'No files exist only in A.' : activeFilter === 'onlyB' ? 'No files exist only in B.' : 'No same-path files have changed content.';
    list.innerHTML = rows.length ? rows.map((difference) => `
      <div class="result-row">
        <span class="side-tag ${activeFilter === 'onlyB' ? 'b' : ''}">${activeFilter === 'onlyB' ? 'B' : activeFilter === 'onlyA' ? 'A' : 'A≠B'}</span>
        <code>${escapeHtml(difference.path)}</code>
        <span class="row-meta">${formatBytes(difference.size)}${difference.otherSize === undefined ? '' : ` / ${formatBytes(difference.otherSize)}`}</span>
      </div>`).join('') : emptyRow(empty);
  }
}

function duplicateRow(finding: DuplicateFinding): string {
  const hasHandle = Boolean(selected.get(finding.sourceSide)?.handle);
  const selectable = finding.canQuarantine && hasHandle;
  const reason = !finding.canQuarantine ? 'Selected folders are report-only' : !hasHandle ? 'Read-only selection; export this finding' : 'Can move to a holding folder';
  return `<div class="result-row">
    ${selectable ? `<input type="checkbox" data-finding="${escapeHtml(finding.id)}" ${selectedFindings.has(finding.id) ? 'checked' : ''} aria-label="Select ${escapeHtml(finding.sourceName)} in folder ${finding.sourceSide} to move to a holding folder">` : '<span aria-hidden="true">◆</span>'}
    <div><code><span class="side-tag ${finding.sourceSide === 'B' ? 'b' : ''}">${finding.sourceSide}</span>${escapeHtml(finding.sourceName)}</code>
      <span class="row-match">= ${finding.matchSide}:${escapeHtml(finding.matchName)}</span>
      <span class="row-meta">${escapeHtml(reason)}</span></div>
    <span class="row-meta">${formatCount(finding.fileCount, 'file')} · ${formatBytes(finding.bytes)}</span>
  </div>`;
}

function renderQuarantineBar(): void {
  const bar = byId('quarantine-bar');
  bar.hidden = selectedFindings.size === 0;
  byId('selected-count').textContent = `${formatCount(selectedFindings.size, 'folder')} selected`;
}

function openQuarantineDialog(): void {
  if (!activeReport || !selectedFindings.size) return;
  lastFocused = document.activeElement as HTMLElement;
  const findings = activeReport.duplicates.filter((finding) => selectedFindings.has(finding.id));
  byId('dialog-list').innerHTML = findings.map((finding) => `<li>${finding.sourceSide}: ${escapeHtml(finding.sourceName)} → holding folder</li>`).join('');
  dialog.showModal();
}

async function confirmQuarantine(event: Event): Promise<void> {
  event.preventDefault();
  if (!activeReport) return;
  const button = byId<HTMLButtonElement>('confirm-quarantine');
  const findings = activeReport.duplicates.filter((finding) => selectedFindings.has(finding.id));
  button.disabled = true;
  button.textContent = 'Copying & verifying…';
  const moved: string[] = [];
  try {
    for (const finding of findings) {
      const root = selected.get(finding.sourceSide)?.handle;
      if (!root) throw new Error(`Folder ${finding.sourceSide} is no longer writable. Re-select it and scan again.`);
      const permission = await root.requestPermission?.({ mode: 'readwrite' });
      if (permission && permission !== 'granted') throw new Error(`Write access to folder ${finding.sourceSide} was not granted. Nothing was moved.`);
      moved.push(await quarantineFolder({ root, side: finding.sourceSide, path: finding.sourcePath, expectedHash: finding.hash }));
    }
    dialog.close();
    selectedFindings.clear();
    renderQuarantineBar();
    showToast(`Moved ${formatCount(moved.length, 'folder')} into the holding folder. Re-scan to refresh results.`);
  } catch (error) {
    dialog.close();
    showError(`Moving to the holding folder stopped. ${messageOf(error)}`);
  } finally {
    button.disabled = false;
    button.textContent = 'Copy, verify & move';
  }
}

function exportJson(): void {
  if (!activeReport) return;
  download(`mirrorbyte-report-${dateStamp()}.json`, JSON.stringify(activeReport, null, 2), 'application/json');
}

function exportCsv(): void {
  if (!activeReport) return;
  const rows = [['type', 'side', 'path', 'matches_side', 'matches_path', 'files', 'bytes', 'sha256']];
  for (const finding of activeReport.duplicates) rows.push(['duplicate-folder', finding.sourceSide, finding.sourcePath, finding.matchSide, finding.matchPath, String(finding.fileCount), String(finding.bytes), finding.hash]);
  for (const item of activeReport.differences.onlyA) rows.push(['only-in-a', 'A', item.path, '', '', '', String(item.size), '']);
  for (const item of activeReport.differences.onlyB) rows.push(['only-in-b', 'B', item.path, '', '', '', String(item.size), '']);
  for (const item of activeReport.differences.changed) rows.push(['changed', 'A/B', item.path, '', '', '', `${item.size}/${item.otherSize ?? ''}`, '']);
  download(`mirrorbyte-report-${dateStamp()}.csv`, rows.map((row) => row.map(csvCell).join(',')).join('\n'), 'text/csv');
}

async function importReport(event: Event): Promise<void> {
  const input = event.currentTarget as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text()) as ScanReport;
    if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.roots) || !Array.isArray(parsed.duplicates) || !parsed.differences) throw new Error('This is not a Mirrorbyte v1 report.');
    activeReport = parsed;
    await saveReport(parsed, demoMode ? 'demo' : 'real');
    renderReport(parsed, true);
    showToast('Report imported. File actions stay disabled until you re-select and scan the folders.');
  } catch (error) {
    showError(`Could not import that report. ${messageOf(error)}`);
  }
}

function download(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvCell(value: string): string { return `"${value.replaceAll('"', '""')}"`; }
function dateStamp(): string { return new Date().toISOString().slice(0, 10); }
function emptyRow(message: string): string { return `<p class="empty-results">${escapeHtml(message)}</p>`; }
function formatCount(value: number, singular: string): string { return `${value.toLocaleString()} ${value === 1 ? singular : `${singular}s`}`; }
function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let size = value / 1024;
  let unit = units[0]!;
  for (let index = 1; size >= 1024 && index < units.length; index += 1) { size /= 1024; unit = units[index]!; }
  return `${size.toFixed(size >= 10 ? 1 : 2)} ${unit}`;
}
function escapeHtml(value: string): string { return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;'); }
function pathsOverlap(left: string, right: string): boolean { return left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`); }
function messageOf(error: unknown): string { return error instanceof Error ? error.message : 'An unexpected error occurred.'; }
function showError(message: string): void { errorMessage.textContent = message; errorMessage.hidden = false; errorMessage.scrollIntoView({ block: 'nearest' }); }
function clearError(): void { errorMessage.hidden = true; errorMessage.textContent = ''; }
function showToast(message: string): void {
  const toast = byId('toast');
  toast.textContent = message;
  toast.hidden = false;
  window.setTimeout(() => { toast.hidden = true; }, 6000);
}

function isDemoUrl(url: URL): boolean {
  return url.pathname.replace(/\/$/, '') === '/demo' || url.searchParams.get('demo') === '1';
}

function enterDemoFromLink(event: Event): void {
  event.preventDefault();
  if ((event.currentTarget as HTMLElement).getAttribute('aria-disabled') === 'true') return;
  history.pushState({}, '', '/?demo=1');
  void applyRoute(true);
}

function navigateInsideApp(event: MouseEvent): void {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.currentTarget as HTMLAnchorElement;
  const url = new URL(link.href);
  if (!['/', '/demo', '/demo/'].includes(url.pathname)) return;
  event.preventDefault();
  history.pushState({}, '', url.pathname === '/demo/' ? '/demo' : `${url.pathname}${url.search}`);
  void applyRoute(true);
}

function resetWorkspace(): void {
  selected.clear();
  selectedFindings.clear();
  activeReport = undefined;
  activeFilter = 'duplicates';
  resultsSection.hidden = true;
  renderQuarantineBar();
  setSourceStatus('A', 'No folder selected', false);
  setSourceStatus('B', 'Optional for a one-folder scan', false);
  scanButton.disabled = true;
  clearError();
}

async function resetDemo(): Promise<void> {
  const reset = byId<HTMLButtonElement>('reset-demo');
  const leave = byId<HTMLButtonElement>('start-real');
  reset.disabled = true;
  leave.disabled = true;
  try {
    await clearReport('demo');
    resetWorkspace();
    await loadSample();
    reset.focus();
    showToast('Demo reset to the original sample comparison.');
  } finally {
    reset.disabled = false;
    leave.disabled = false;
  }
}

async function startForReal(): Promise<void> {
  await clearReport('demo');
  history.pushState({}, '', '/');
  await applyRoute(true);
}

function updateRouteMetadata(inDemo: boolean): void {
  const title = inDemo ? 'Demo — Mirrorbyte' : 'Mirrorbyte — Compare folders and find duplicates';
  const description = inDemo
    ? 'Inspect a completed sample folder comparison without changing your saved report.'
    : 'Compare folders in your browser, find exact duplicates, and review differences without uploading files.';
  const canonical = `https://duplicate-folder-finder-web.sociobot.in${inDemo ? '/demo' : '/'}`;
  document.title = title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', canonical);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', canonical);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', title);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute('content', description);
}

async function applyRoute(moveFocus: boolean): Promise<void> {
  const nextDemoMode = isDemoUrl(new URL(location.href));
  const modeChanged = nextDemoMode !== demoMode;
  demoMode = nextDemoMode;
  document.documentElement.classList.toggle('demo-boot', demoMode);
  byId('demo-banner').hidden = !demoMode;
  updateRouteMetadata(demoMode);
  const heading = byId<HTMLHeadingElement>('hero-title');
  heading.innerHTML = demoMode
    ? 'Inspect sample folders and <span>exact duplicates.</span>'
    : 'Compare folders and find <span>exact duplicates.</span>';
  document.querySelector<HTMLAnchorElement>('.site-nav a[href="/demo"]')?.toggleAttribute('aria-current', demoMode);
  document.querySelector<HTMLAnchorElement>('.site-nav a[href="/"]')?.toggleAttribute('aria-current', !demoMode);
  if (modeChanged || demoMode || !activeReport) {
    resetWorkspace();
    if (demoMode) await loadSample();
    else {
      const report = await loadReport('real').catch(() => undefined);
      if (report) renderReport(report, true);
    }
  }
  if (moveFocus) {
    heading.focus({ preventScroll: true });
    byId('route-announcer').textContent = heading.textContent ?? '';
  }
}

function updateNetwork(event?: Event): void {
  const network = byId('network-status');
  const online = event?.type === 'offline' ? false : event?.type === 'online' ? true : navigator.onLine;
  network.textContent = online ? 'Offline ready' : 'You are offline';
  network.classList.toggle('offline', !online);
}
window.addEventListener('online', updateNetwork);
window.addEventListener('offline', updateNetwork);
updateNetwork();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  const wasAlreadyControlled = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.register('/sw.js').then((registration) => {
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) showToast('An update is available and will be ready on your next visit.');
      });
    });
  }).catch(() => showError('Offline setup could not finish. Scanning still works while this page stays open.'));
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (wasAlreadyControlled) showToast('Mirrorbyte was updated for offline use.'); });
}

window.addEventListener('popstate', () => { void applyRoute(true); });
window.addEventListener('pageshow', (event) => {
  if (event.persisted) void applyRoute(true);
});
const initialNavigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
void applyRoute(initialNavigation?.type === 'back_forward');
