import type {
  Difference,
  DuplicateFinding,
  FolderSnapshot,
  HashedFile,
  InputFile,
  Relation,
  ScanProgress,
  ScanReport,
  SelectedSource,
  Side,
  TreeSnapshot,
} from './types';

interface MutableFolder {
  name: string;
  path: string;
  files: HashedFile[];
  children: Map<string, MutableFolder>;
}

interface WorkerReply {
  id: number;
  hash?: string;
  error?: string;
}

const encoder = new TextEncoder();

export function normalizePath(value: string): string {
  return value.replaceAll('\\', '/').split('/').filter((part) => part && part !== '.').join('/');
}

export async function digestText(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function collectDirectory(
  handle: FileSystemDirectoryHandle,
  signal?: AbortSignal,
): Promise<{ files: InputFile[]; directories: string[]; errors: string[] }> {
  const files: InputFile[] = [];
  const directories: string[] = [];
  const errors: string[] = [];

  async function walk(directory: FileSystemDirectoryHandle, prefix: string): Promise<void> {
    const entries: [string, FileSystemHandle][] = [];
    try {
      for await (const entry of directory.entries()) entries.push(entry);
    } catch (error) {
      errors.push(`${prefix || directory.name}: ${messageOf(error)}`);
      return;
    }
    entries.sort(([a], [b]) => a.localeCompare(b));
    for (const [name, entry] of entries) {
      if (signal?.aborted) throw new DOMException('Scan cancelled', 'AbortError');
      if (name.startsWith('.mirrorbyte-quarantine-')) continue;
      const path = prefix ? `${prefix}/${name}` : name;
      try {
        if (entry.kind === 'file') files.push({ path, file: await (entry as FileSystemFileHandle).getFile() });
        else {
          directories.push(path);
          await walk(entry as FileSystemDirectoryHandle, path);
        }
      } catch (error) {
        errors.push(`${path}: ${messageOf(error)}`);
      }
    }
  }

  await walk(handle, '');
  return { files, directories, errors };
}

export function filesFromInput(fileList: FileList): { name: string; files: InputFile[]; directories: string[] } {
  const raw = Array.from(fileList);
  const firstPath = normalizePath(raw[0]?.webkitRelativePath ?? raw[0]?.name ?? 'Folder');
  const root = firstPath.split('/')[0] || 'Folder';
  const files = raw.map((file) => {
    const full = normalizePath(file.webkitRelativePath || file.name);
    const parts = full.split('/');
    return { path: parts.length > 1 ? parts.slice(1).join('/') : full, file };
  });
  const directories = new Set<string>();
  for (const input of files) {
    const segments = input.path.split('/');
    segments.pop();
    let current = '';
    for (const segment of segments) {
      current = current ? `${current}/${segment}` : segment;
      directories.add(current);
    }
  }
  return {
    name: root,
    files,
    directories: [...directories],
  };
}

export async function hashInputFiles(
  inputs: InputFile[],
  onProgress: (done: number, total: number, detail: string) => void,
  signal?: AbortSignal,
): Promise<HashedFile[]> {
  if (inputs.length === 0) return [];
  const workerCount = Math.min(4, Math.max(1, navigator.hardwareConcurrency ? Math.floor(navigator.hardwareConcurrency / 2) : 2), inputs.length);
  const workers = Array.from({ length: workerCount }, () => new Worker(new URL('./hash-worker.ts', import.meta.url), { type: 'module' }));
  const results: HashedFile[] = new Array(inputs.length);
  let next = 0;
  let done = 0;

  try {
    await Promise.all(workers.map((worker) => new Promise<void>((resolve, reject) => {
      const advance = (): void => {
        if (signal?.aborted) {
          reject(new DOMException('Scan cancelled', 'AbortError'));
          return;
        }
        const index = next++;
        const input = inputs[index];
        if (!input) {
          resolve();
          return;
        }
        worker.onmessage = (event: MessageEvent<WorkerReply>) => {
          if (event.data.error || !event.data.hash) {
            reject(new Error(`${input.path}: ${event.data.error || 'Hash failed'}`));
            return;
          }
          results[index] = {
            path: normalizePath(input.path),
            size: input.file.size,
            lastModified: input.file.lastModified,
            hash: event.data.hash,
          };
          done += 1;
          onProgress(done, inputs.length, input.path);
          advance();
        };
        worker.onerror = () => reject(new Error(`Hash worker failed while reading ${input.path}`));
        worker.postMessage({ id: index, file: input.file });
      };
      advance();
    })));
  } finally {
    workers.forEach((worker) => worker.terminate());
  }
  return results;
}

export async function buildSnapshot(side: Side, rootName: string, files: HashedFile[], directoryPaths: string[] = []): Promise<TreeSnapshot> {
  const root: MutableFolder = { name: rootName, path: '', files: [], children: new Map() };
  for (const directoryPath of directoryPaths) {
    let node = root;
    let currentPath = '';
    for (const segment of normalizePath(directoryPath).split('/').filter(Boolean)) {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;
      let child = node.children.get(segment);
      if (!child) {
        child = { name: segment, path: currentPath, files: [], children: new Map() };
        node.children.set(segment, child);
      }
      node = child;
    }
  }
  for (const file of files) {
    const parts = normalizePath(file.path).split('/');
    const fileName = parts.pop() ?? file.path;
    let node = root;
    let currentPath = '';
    for (const segment of parts) {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;
      let child = node.children.get(segment);
      if (!child) {
        child = { name: segment, path: currentPath, files: [], children: new Map() };
        node.children.set(segment, child);
      }
      node = child;
    }
    node.files.push({ ...file, path: fileName });
  }

  const folders: FolderSnapshot[] = [];
  async function finalize(node: MutableFolder): Promise<{ hash: string; fileCount: number; folderCount: number; bytes: number }> {
    const childRows: [string, string, string][] = [];
    let fileCount = node.files.length;
    let folderCount = 0;
    let bytes = node.files.reduce((sum, file) => sum + file.size, 0);
    for (const child of [...node.children.values()].sort((a, b) => a.name.localeCompare(b.name))) {
      const result = await finalize(child);
      childRows.push(['directory', child.name, result.hash]);
      fileCount += result.fileCount;
      folderCount += result.folderCount + 1;
      bytes += result.bytes;
    }
    const fileRows = node.files
      .sort((a, b) => a.path.localeCompare(b.path))
      .map((file): [string, string, string, string] => ['file', file.path, String(file.size), file.hash]);
    const hash = await digestText(JSON.stringify([...fileRows, ...childRows]));
    folders.push({ side, path: node.path, name: node.name, hash, fileCount, folderCount, bytes });
    return { hash, fileCount, folderCount, bytes };
  }

  const aggregate = await finalize(root);
  return {
    side,
    rootName,
    hash: aggregate.hash,
    files: files.map((file) => ({ ...file, path: normalizePath(file.path) })).sort((a, b) => a.path.localeCompare(b.path)),
    folders: folders.sort((a, b) => a.path.localeCompare(b.path)),
  };
}

export function compareSnapshots(a: TreeSnapshot, b?: TreeSnapshot): { relation: Relation; differences: ScanReport['differences'] } {
  if (!b) return { relation: 'single-root', differences: { onlyA: [], onlyB: [], changed: [] } };
  if (a.hash === b.hash) return { relation: 'identical', differences: { onlyA: [], onlyB: [], changed: [] } };
  const aFiles = new Map(a.files.map((file) => [file.path, file]));
  const bFiles = new Map(b.files.map((file) => [file.path, file]));
  const onlyA: Difference[] = [];
  const onlyB: Difference[] = [];
  const changed: Difference[] = [];
  for (const [path, file] of aFiles) {
    const other = bFiles.get(path);
    if (!other) onlyA.push({ path, size: file.size });
    else if (other.hash !== file.hash) changed.push({ path, size: file.size, otherSize: other.size });
  }
  for (const [path, file] of bFiles) if (!aFiles.has(path)) onlyB.push({ path, size: file.size });
  const aFolderPaths = new Set(a.folders.map((folder) => folder.path));
  const bFolderPaths = new Set(b.folders.map((folder) => folder.path));
  const aContained = onlyA.length === 0 && changed.length === 0 && [...aFolderPaths].every((path) => bFolderPaths.has(path));
  const bContained = onlyB.length === 0 && changed.length === 0 && [...bFolderPaths].every((path) => aFolderPaths.has(path));
  return {
    relation: aContained ? 'a-contained' : bContained ? 'b-contained' : 'differs',
    differences: { onlyA, onlyB, changed },
  };
}

export function findDuplicates(a: TreeSnapshot, b?: TreeSnapshot): DuplicateFinding[] {
  const findings: DuplicateFinding[] = [];
  if (b) {
    const byHash = new Map<string, FolderSnapshot[]>();
    for (const folder of b.folders) byHash.set(folder.hash, [...(byHash.get(folder.hash) ?? []), folder]);
    for (const folder of a.folders) {
      for (const match of byHash.get(folder.hash) ?? []) {
        findings.push(toFinding(folder, match));
      }
    }
  } else {
    const byHash = new Map<string, FolderSnapshot[]>();
    for (const folder of a.folders) {
      const prior = byHash.get(folder.hash) ?? [];
      for (const match of prior) {
        if (!isAncestor(folder.path, match.path) && !isAncestor(match.path, folder.path)) findings.push(toFinding(folder, match));
      }
      prior.push(folder);
      byHash.set(folder.hash, prior);
    }
  }
  return findings.sort((left, right) => right.bytes - left.bytes || left.sourcePath.localeCompare(right.sourcePath));
}

function toFinding(source: FolderSnapshot, match: FolderSnapshot): DuplicateFinding {
  const id = `${source.side}:${source.path}=>${match.side}:${match.path}`;
  return {
    id,
    sourceSide: source.side,
    sourcePath: source.path,
    sourceName: source.path || source.name,
    matchSide: match.side,
    matchPath: match.path,
    matchName: match.path || match.name,
    hash: source.hash,
    fileCount: source.fileCount,
    bytes: source.bytes,
    canQuarantine: source.path !== '',
  };
}

function isAncestor(parent: string, child: string): boolean {
  return parent === '' || child.startsWith(`${parent}/`);
}

export async function scanSources(
  a: SelectedSource,
  b: SelectedSource | undefined,
  onProgress: (progress: ScanProgress) => void,
  signal?: AbortSignal,
  priorErrors: string[] = [],
): Promise<{ report: ScanReport; snapshots: TreeSnapshot[] }> {
  const total = a.files.length + (b?.files.length ?? 0);
  onProgress({ phase: 'hashing', done: 0, total, detail: 'Preparing file hashes' });
  let offset = 0;
  const hashSource = async (source: SelectedSource): Promise<TreeSnapshot> => {
    const hashed = await hashInputFiles(source.files, (done, _count, detail) => {
      onProgress({ phase: 'hashing', done: offset + done, total, detail });
    }, signal);
    offset += source.files.length;
    return buildSnapshot(source.side, source.name, hashed, source.directories);
  };
  const snapshotA = await hashSource(a);
  const snapshotB = b ? await hashSource(b) : undefined;
  onProgress({ phase: 'comparing', done: total, total, detail: 'Building folder signatures' });
  const comparison = compareSnapshots(snapshotA, snapshotB);
  const duplicates = findDuplicates(snapshotA, snapshotB);
  const snapshots = snapshotB ? [snapshotA, snapshotB] : [snapshotA];
  const report: ScanReport = {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    mode: b ? 'compare' : 'single-root',
    roots: snapshots.map((snapshot) => {
      const root = snapshot.folders.find((folder) => folder.path === '')!;
      return { side: snapshot.side, name: snapshot.rootName, fileCount: root.fileCount, folderCount: root.folderCount, bytes: root.bytes, hash: root.hash };
    }),
    relation: comparison.relation,
    differences: comparison.differences,
    duplicates,
    errors: priorErrors,
  };
  return { report, snapshots };
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Unable to read this item';
}
