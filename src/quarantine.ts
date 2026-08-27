import { buildSnapshot, hashInputFiles } from './scanner';
import type { InputFile, Side } from './types';

export interface QuarantineRequest {
  root: FileSystemDirectoryHandle;
  side: Side;
  path: string;
  expectedHash: string;
}

export async function quarantineFolder(request: QuarantineRequest): Promise<string> {
  if (!request.path) throw new Error('The selected root cannot be quarantined. Choose a duplicate subfolder.');
  const segments = request.path.split('/');
  const folderName = segments.pop();
  if (!folderName) throw new Error('Folder path is invalid.');
  let parent = request.root;
  for (const segment of segments) parent = await parent.getDirectoryHandle(segment);
  const source = await parent.getDirectoryHandle(folderName);
  const stamp = new Date().toISOString().replaceAll(/[:.]/g, '-');
  const quarantineName = `.mirrorbyte-quarantine-${stamp}`;
  const quarantineRoot = await request.root.getDirectoryHandle(quarantineName, { create: true });
  const safePath = request.path.replaceAll('/', '__');
  const targetName = `${request.side}-${safePath}`;
  const target = await quarantineRoot.getDirectoryHandle(targetName, { create: true });
  await copyDirectory(source, target);

  const copied: InputFile[] = [];
  const directories: string[] = [];
  await collectCopied(target, '', copied, directories);
  const hashed = await hashInputFiles(copied, () => undefined);
  const snapshot = await buildSnapshot(request.side, folderName, hashed, directories);
  if (snapshot.hash !== request.expectedHash) {
    throw new Error(`Verification failed. The original was left in place; a partial copy may exist in ${quarantineName}.`);
  }
  await parent.removeEntry(folderName, { recursive: true });
  return `${quarantineName}/${targetName}`;
}

async function copyDirectory(source: FileSystemDirectoryHandle, target: FileSystemDirectoryHandle): Promise<void> {
  for await (const [name, entry] of source.entries()) {
    if (entry.kind === 'file') {
      const sourceFile = await (entry as FileSystemFileHandle).getFile();
      const targetFile = await target.getFileHandle(name, { create: true });
      const writable = await targetFile.createWritable();
      try {
        await writable.write(sourceFile);
        await writable.close();
      } catch (error) {
        await writable.abort();
        throw error;
      }
    } else {
      const child = await target.getDirectoryHandle(name, { create: true });
      await copyDirectory(entry as FileSystemDirectoryHandle, child);
    }
  }
}

async function collectCopied(directory: FileSystemDirectoryHandle, prefix: string, output: InputFile[], directories: string[]): Promise<void> {
  for await (const [name, entry] of directory.entries()) {
    const path = prefix ? `${prefix}/${name}` : name;
    if (entry.kind === 'file') output.push({ path, file: await (entry as FileSystemFileHandle).getFile() });
    else {
      directories.push(path);
      await collectCopied(entry as FileSystemDirectoryHandle, path, output, directories);
    }
  }
}
