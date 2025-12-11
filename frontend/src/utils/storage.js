import { create as createW3Client } from '@web3-storage/w3up-client';
import * as Delegation from '@ucanto/core/delegation';

let cachedClientPromise = null;
let cachedToken = null;

function base64ToBytes(input) {
  if (typeof input !== 'string' || !input.trim()) {
    throw new Error('Missing w3up delegation token');
  }
  const normalized = input.replace(/^Bearer\s+/i, '').trim();
  const hasBuffer = typeof globalThis !== 'undefined' && globalThis.Buffer && typeof globalThis.Buffer.from === 'function';
  if (hasBuffer) {
    return Uint8Array.from(globalThis.Buffer.from(normalized, 'base64'));
  }
  if (typeof globalThis !== 'undefined' && typeof globalThis.atob === 'function') {
    const binary = globalThis.atob(normalized);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  throw new Error('No base64 decoder available in this environment');
}

async function resolveClient(token) {
  if (cachedClientPromise && token === cachedToken) {
    return cachedClientPromise;
  }

  cachedToken = token;
  cachedClientPromise = (async () => {
    const proofBytes = base64ToBytes(token);
    const delegation = await Delegation.extract(proofBytes);
    if (!delegation.ok) {
      throw new Error('Invalid w3up delegation token provided');
    }

    const client = await createW3Client();
    const space = await client.addSpace(delegation.ok);
    await client.setCurrentSpace(space.did());
    return client;
  })();

  return cachedClientPromise;
}

export async function uploadEncryptedBlob(blob, token) {
  if (!token) {
    throw new Error('Cannot upload to w3up without VITE_WEB3_STORAGE_KEY');
  }
  const client = await resolveClient(token);
  const file = new File([blob], 'encrypted.enc', { type: blob?.type || 'application/octet-stream' });
  const cid = await client.uploadFile(file);
  return typeof cid === 'string' ? cid : cid?.toString?.();
}
