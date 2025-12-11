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
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/upload`, {
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
    <section className="min-h-screen max-w-2xl mx-auto bg-[#0d0e11] text-slate-100 font-['Inter'] px-4 py-10">
      <h2 className="text-3xl font-['Playfair_Display'] text-[#C4A87C] mb-3">Upload an encrypted memory</h2>
      <p className="text-sm text-slate-400 mb-6 leading-relaxed">
        Files are encrypted locally in your browser using AES-GCM before being
        sent to the backend. The server never sees your plaintext.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4 bg-[#111317] border border-white/5 rounded-2xl p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div>
          <label className="block text-sm uppercase tracking-wide text-[#C4A87C] mb-2">Vault Encryption Key</label>
          <p className="text-xs text-yellow-200 mb-3">⚠ Do not lose this key — your memories cannot be decrypted without it.</p>
          <input
            type="password"
            value={vaultKey}
            onChange={(e) => {
              setVaultKey(e.target.value);
              if (e.target.value) setShowKeyWarning(false);
            }}
            className="w-full rounded-md bg-[#0d0e11] border border-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#6aa4ff]"
            placeholder="Enter your vault key"
          />
          {showKeyWarning && (
            <p className="text-xs text-pink-200 mt-2">Enter the vault key before uploading.</p>
          )}
        </div>
        <div>
          <label className="block text-sm uppercase tracking-wide text-[#C4A87C] mb-2">File</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0] || null)}
            className="block w-full text-sm text-slate-200 file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#6aa4ff] file:text-[#0d0e11] hover:file:bg-[#82b4ff]"
          />
        </div>
        <div>
          <label className="block text-sm uppercase tracking-wide text-[#C4A87C] mb-2">Memory Title (optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md bg-[#0d0e11] border border-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#6aa4ff]"
            placeholder="e.g., Wedding toast, First recital"
          />
        </div>
        <div>
          <label className="block text-sm uppercase tracking-wide text-[#C4A87C] mb-2">Memory Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md bg-[#0d0e11] border border-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#6aa4ff]"
            placeholder="Add context so heirs understand why this matters"
            rows={3}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-md bg-emerald-500 text-[#0d0e11] font-semibold text-sm shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 disabled:opacity-40"
            disabled={!vaultKey}
          >
            Encrypt & Upload
          </button>
        </div>
        {uploadError && (
          <p className="text-yellow-200 text-sm mt-2 whitespace-pre-wrap">{uploadError}</p>
        )}
      </form>
      {status && <p className="mt-4 text-sm text-slate-400 whitespace-pre-line">{status}</p>}
    </section>
  );
}

export default Upload;
