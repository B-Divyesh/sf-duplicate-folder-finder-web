/// <reference types="vite/client" />

interface FileSystemDirectoryHandle {
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
  requestPermission?(options?: { mode?: 'read' | 'readwrite' }): Promise<PermissionState>;
}
