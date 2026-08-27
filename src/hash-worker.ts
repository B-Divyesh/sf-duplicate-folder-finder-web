/// <reference lib="webworker" />

interface HashRequest {
  id: number;
  file: File;
}

const scope: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;

scope.addEventListener('message', async (event: MessageEvent<HashRequest>) => {
  try {
    const buffer = await event.data.file.arrayBuffer();
    const digest = await crypto.subtle.digest('SHA-256', buffer);
    const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
    scope.postMessage({ id: event.data.id, hash });
  } catch (error) {
    scope.postMessage({ id: event.data.id, error: error instanceof Error ? error.message : 'Unable to read file' });
  }
});
