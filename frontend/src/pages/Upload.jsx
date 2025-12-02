import React, { useState } from 'react';
import { encryptFile } from '../utils/crypto.js';
import { uploadEncryptedBlob } from '../utils/storage.js';

function Upload() {
  const [file, setFile] = useState(null);
  const [vaultKey, setVaultKey] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [showKeyWarning, setShowKeyWarning] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !vaultKey) {
      setStatus('Please choose a file and enter the vault key.');
      setShowKeyWarning(!vaultKey);
      return;
    }
    setShowKeyWarning(false);
    try {
      setStatus('Encrypting file...');
      const { encryptedBlob, meta } = await encryptFile(file, vaultKey);

      // Upload encrypted blob to Web3.Storage (IPFS) if a token is available
      const WEB3_STORAGE_KEY = import.meta.env.VITE_WEB3_STORAGE_KEY;
      let cid = null;
      if (!WEB3_STORAGE_KEY) {
        console.warn('VITE_WEB3_STORAGE_KEY is missing — skipping Web3.Storage upload');
      } else {
        try {
          setUploadError('');
          setStatus('Uploading encrypted blob to Web3.Storage...');
          cid = await uploadEncryptedBlob(encryptedBlob, WEB3_STORAGE_KEY);
          console.log('Uploaded to Web3.Storage CID:', cid);
        } catch (err) {
          console.error('Web3.Storage upload failed', err);
          const msg = (err && err.message) ? err.message.toLowerCase() : String(err).toLowerCase();
          if (msg.includes('503') || msg.includes('service unavailable') || msg.includes('maintenance')) {
            setUploadError('⚠ Web3.Storage is temporarily offline.\nPlease retry in a few minutes.');
          }
          // continue — we still upload to backend storage
        }
      }

      const formData = new FormData();
      formData.append('file', encryptedBlob, `${file.name}.enc`);
      formData.append('meta', JSON.stringify({
        ownerDid: 'demo-owner',
        originalName: file.name,
        timestamp: new Date().toISOString(),
        cryptoMeta: meta,
        title,
        description,
        encryptionMode: 'single-key',
      }));
      formData.append('ownerDid', 'demo-owner');
      if (cid) formData.append('cid', cid);

      setStatus('Uploading to backend...');
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.ok) {
        setStatus(`Uploaded successfully. Vault entry id: ${data.id}` + (cid ? `\nCID: ${cid}` : ''));
        // clear any previous upload-specific errors on success
        setUploadError('');
        setTitle('');
        setDescription('');
      } else {
        setStatus('Upload failed. Check console/logs.');
      }
    } catch (err) {
      console.error(err);
      setStatus('Error during encryption or upload.');
      // If the top-level error mentions web3.storage availability, show friendly message
      const msg = (err && err.message) ? err.message.toLowerCase() : String(err).toLowerCase();
      if (msg.includes('503') || msg.includes('service unavailable') || msg.includes('maintenance')) {
        setUploadError('⚠ Web3.Storage is temporarily offline.\nPlease retry in a few minutes.');
      }
    }
  };

  return (
    <section className="max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Upload an encrypted memory</h2>
      <p className="text-sm text-slate-400 mb-4">
        Files are encrypted locally in your browser using AES-GCM before being
        sent to the backend. The server never sees your plaintext.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Vault Encryption Key</label>
          <p className="text-xs text-yellow-300 mb-2">⚠ Do not lose this key — your memories cannot be decrypted without it.</p>
          <input
            type="password"
            value={vaultKey}
            onChange={(e) => {
              setVaultKey(e.target.value);
              if (e.target.value) setShowKeyWarning(false);
            }}
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
            placeholder="Enter your vault key"
          />
          {showKeyWarning && (
            <p className="text-xs text-pink-300 mt-1">Enter the vault key before uploading.</p>
          )}
        </div>
        <div>
          <label className="block text-sm mb-1">File</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0] || null)}
            className="block w-full text-sm text-slate-200 file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-slate-950 hover:file:bg-emerald-400"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Memory Title (optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
            placeholder="e.g., Wedding toast, First recital"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Memory Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
            placeholder="Add context so heirs understand why this matters"
            rows={3}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-emerald-500 text-slate-950 font-semibold text-sm hover:bg-emerald-400 disabled:opacity-40"
            disabled={!vaultKey}
          >
            Encrypt & Upload
          </button>
        </div>
        {uploadError && (
          <p className="text-yellow-400 text-sm mt-2 whitespace-pre-wrap">{uploadError}</p>
        )}
      </form>
      {status && <p className="mt-4 text-sm text-slate-300">{status}</p>}
    </section>
  );
}

export default Upload;
