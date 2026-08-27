export type Side = 'A' | 'B';

export interface InputFile {
  path: string;
  file: File;
}

export interface HashedFile {
  path: string;
  size: number;
  lastModified: number;
  hash: string;
}

export interface FolderSnapshot {
  side: Side;
  path: string;
  name: string;
  hash: string;
  fileCount: number;
  folderCount: number;
  bytes: number;
}

export interface TreeSnapshot {
  side: Side;
  rootName: string;
  hash: string;
  files: HashedFile[];
  folders: FolderSnapshot[];
}

export type Relation = 'identical' | 'a-contained' | 'b-contained' | 'differs' | 'single-root';

export interface Difference {
  path: string;
  size: number;
  otherSize?: number;
}

export interface DuplicateFinding {
  id: string;
  sourceSide: Side;
  sourcePath: string;
  sourceName: string;
  matchSide: Side;
  matchPath: string;
  matchName: string;
  hash: string;
  fileCount: number;
  bytes: number;
  canQuarantine: boolean;
}

export interface ScanReport {
  schemaVersion: 1;
  createdAt: string;
  mode: 'compare' | 'single-root';
  roots: { side: Side; name: string; fileCount: number; folderCount: number; bytes: number; hash: string }[];
  relation: Relation;
  differences: {
    onlyA: Difference[];
    onlyB: Difference[];
    changed: Difference[];
  };
  duplicates: DuplicateFinding[];
  errors: string[];
}

export interface ScanProgress {
  phase: 'discovering' | 'hashing' | 'comparing';
  done: number;
  total: number;
  detail: string;
}

export interface SelectedSource {
  side: Side;
  name: string;
  files: InputFile[];
  directories: string[];
  errors?: string[];
  handle?: FileSystemDirectoryHandle;
}
