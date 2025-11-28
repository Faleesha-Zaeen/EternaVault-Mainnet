// Simple AES-GCM wrapper using Web Crypto API.
// NOTE: This is for demo purposes only.
// TODO: Use real key management / KMS / shared key exchange in production.

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function getKeyFromPassphrase(passphrase, salt) {
  const passphraseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passphraseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptFile(file, passphrase) {
  let arrayBuffer;
  if (file.arrayBuffer) {
    arrayBuffer = await file.arrayBuffer();
  } else if (file.text) {
    // Some test environments (jsdom) provide File.text() but not arrayBuffer()
    const txt = await file.text();
    arrayBuffer = encoder.encode(txt).buffer;
  } else {
    // Last resort: try Response API
    try {
      arrayBuffer = await new Response(file).arrayBuffer();
    } catch (e) {
      throw new Error('Unable to read file data in this environment');
    }
  }
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const key = await getKeyFromPassphrase(passphrase, salt);

  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    arrayBuffer
  );

  const encryptedBlob = new Blob([encrypted], { type: 'application/octet-stream' });
  const meta = {
    iv: Array.from(iv),
    salt: Array.from(salt),
    originalName: file.name,
    type: file.type,
  };

  return { encryptedBlob, meta };
}

export async function decryptArrayBuffer(encryptedBuffer, passphrase, meta) {
  const iv = new Uint8Array(meta.iv);
  const salt = new Uint8Array(meta.salt);
  const key = await getKeyFromPassphrase(passphrase, salt);

  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedBuffer
  );

  const blob = new Blob([decrypted], { type: meta.type || 'application/octet-stream' });
  return blob;
}

// Helper for tests to convert Blob to ArrayBuffer
export async function blobToArrayBuffer(blob) {
  return await blob.arrayBuffer();
}
