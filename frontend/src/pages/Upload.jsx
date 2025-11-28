import React, { useState } from 'react';
import { encryptFile } from '../utils/crypto.js';

function Upload() {
  const [file, setFile] = useState(null);
  const [passphrase, setPassphrase] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !passphrase) {
      setStatus('Please choose a file and enter a passphrase.');
      return;
    }
    try {
      setStatus('Encrypting file...');
      const { encryptedBlob, meta } = await encryptFile(file, passphrase);

      const formData = new FormData();
      formData.append('file', encryptedBlob, `${file.name}.enc`);
      formData.append('meta', JSON.stringify({
        ownerDid: 'demo-owner',
        originalName: file.name,
        timestamp: new Date().toISOString(),
        cryptoMeta: meta,
      }));
      formData.append('ownerDid', 'demo-owner');

      setStatus('Uploading to backend...');
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.ok) {
        setStatus(`Uploaded successfully. Vault entry id: ${data.id}`);
      } else {
        setStatus('Upload failed. Check console/logs.');
      }
    } catch (err) {
      console.error(err);
      setStatus('Error during encryption or upload.');
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
          <label className="block text-sm mb-1">File</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0] || null)}
            className="block w-full text-sm text-slate-200 file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-slate-950 hover:file:bg-emerald-400"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Passphrase</label>
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
            placeholder="Choose something memorable but strong"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-emerald-500 text-slate-950 font-semibold text-sm hover:bg-emerald-400"
        >
          Encrypt & Upload
        </button>
      </form>
      {status && <p className="mt-4 text-sm text-slate-300">{status}</p>}
    </section>
  );
}

export default Upload;
