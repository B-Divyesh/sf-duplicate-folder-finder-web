import type { ScanReport } from './types';

export type StorageSpace = 'real' | 'demo';

const DB_NAMES: Record<StorageSpace, string> = {
  real: 'mirrorbyte-local',
  demo: 'mirrorbyte-demo',
};
const STORE = 'reports';
const KEY = 'latest';

function openDatabase(space: StorageSpace): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAMES[space], 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveReport(report: ScanReport, space: StorageSpace = 'real'): Promise<void> {
  const db = await openDatabase(space);
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(report, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadReport(space: StorageSpace = 'real'): Promise<ScanReport | undefined> {
  const db = await openDatabase(space);
  const report = await new Promise<ScanReport | undefined>((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(KEY);
    request.onsuccess = () => resolve(request.result as ScanReport | undefined);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return report;
}

export async function clearReport(space: StorageSpace = 'real'): Promise<void> {
  const db = await openDatabase(space);
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}
