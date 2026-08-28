import { describe, expect, it } from 'vitest';
import { buildSnapshot, compareSnapshots, findDuplicates, normalizePath } from '../src/scanner';
import type { HashedFile } from '../src/types';

const file = (path: string, hash: string, size = 10): HashedFile => ({ path, hash, size, lastModified: 1 });

describe('folder tree comparison', () => {
  it('normalizes browser paths consistently', () => {
    expect(normalizePath('backup\\photos//2025/a.jpg')).toBe('backup/photos/2025/a.jpg');
  });

  it('treats different root names as identical when their contents match', async () => {
    const a = await buildSnapshot('A', 'original', [file('docs/a.txt', 'aaa'), file('photo.jpg', 'bbb')], ['docs', 'empty']);
    const b = await buildSnapshot('B', 'backup', [file('docs/a.txt', 'aaa'), file('photo.jpg', 'bbb')], ['docs', 'empty']);
    expect(compareSnapshots(a, b).relation).toBe('identical');
    expect(a.hash).toBe(b.hash);
  });

  it('classifies A as contained when B has every A item and more', async () => {
    const a = await buildSnapshot('A', 'small', [file('docs/a.txt', 'aaa')], ['docs']);
    const b = await buildSnapshot('B', 'large', [file('docs/a.txt', 'aaa'), file('extra.txt', 'bbb')], ['docs']);
    const result = compareSnapshots(a, b);
    expect(result.relation).toBe('a-contained');
    expect(result.differences.onlyB.map((entry) => entry.path)).toEqual(['extra.txt']);
  });

  it('reports same-path content changes even when sizes match', async () => {
    const a = await buildSnapshot('A', 'left', [file('same.bin', 'hash-one', 42)]);
    const b = await buildSnapshot('B', 'right', [file('same.bin', 'hash-two', 42)]);
    const result = compareSnapshots(a, b);
    expect(result.relation).toBe('differs');
    expect(result.differences.changed).toEqual([{ path: 'same.bin', size: 42, otherSize: 42 }]);
  });

  it('includes empty directory structure in the Merkle signature', async () => {
    const a = await buildSnapshot('A', 'left', [], ['keep-empty']);
    const b = await buildSnapshot('B', 'right', []);
    expect(compareSnapshots(a, b).relation).toBe('b-contained');
  });

  it('finds matching subfolders across trees and never offers the root', async () => {
    const a = await buildSnapshot('A', 'left', [file('photos/a.jpg', 'pixels')], ['photos']);
    const b = await buildSnapshot('B', 'right', [file('archive/a.jpg', 'pixels')], ['archive']);
    const duplicates = findDuplicates(a, b);
    expect(duplicates).toHaveLength(1);
    expect(duplicates[0]).toMatchObject({ sourcePath: 'photos', matchPath: 'archive', canQuarantine: true });
  });

  it('@claim:single-folder-duplicates finds independent duplicates inside one tree but suppresses ancestor pairs', async () => {
    const tree = await buildSnapshot('A', 'drive', [
      file('copy-one/data.txt', 'same'),
      file('copy-two/data.txt', 'same'),
    ], ['copy-one', 'copy-two']);
    const duplicates = findDuplicates(tree);
    expect(duplicates).toHaveLength(1);
    expect(new Set([duplicates[0]?.sourcePath, duplicates[0]?.matchPath])).toEqual(new Set(['copy-one', 'copy-two']));
  });

  it('classifies a synthetic 50,000-file pair without dropping entries', async () => {
    const files = Array.from({ length: 50_000 }, (_, index) => file(`bucket-${index % 100}/item-${index}.bin`, `hash-${index}`, index + 1));
    const a = await buildSnapshot('A', 'large-a', files);
    const b = await buildSnapshot('B', 'large-b', files.map((entry) => ({ ...entry })));
    expect(compareSnapshots(a, b).relation).toBe('identical');
    expect(a.files).toHaveLength(50_000);
    expect(a.folders.find((folder) => folder.path === '')?.fileCount).toBe(50_000);
  }, 20_000);
});
