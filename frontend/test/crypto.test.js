import { describe, it, expect } from 'vitest';
import { encryptFile, decryptArrayBuffer, blobToArrayBuffer } from '../src/utils/crypto.js';

// Web Crypto is available in jsdom via globalThis.crypto in modern Vitest/JSDOM.

describe('crypto round-trip', () => {
  it('encrypts and decrypts a file back to original content', async () => {
    const content = 'Hello EternaVault';
    const file = new File([content], 'hello.txt', { type: 'text/plain' });
    const passphrase = 'test-passphrase';

    const { encryptedBlob, meta } = await encryptFile(file, passphrase);
    const encryptedBuffer = await blobToArrayBuffer(encryptedBlob);

    const decryptedBlob = await decryptArrayBuffer(encryptedBuffer, passphrase, meta);
    const decryptedText = await decryptedBlob.text();

    expect(decryptedText).toBe(content);
  });
});
