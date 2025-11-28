import React, { useEffect, useState } from 'react';
import { decryptArrayBuffer } from '../utils/crypto.js';

function HeirDashboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [passphrase, setPassphrase] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUnlocked = async () => {
      try {
        const res = await fetch('/api/simulate-unlock?user=demo');
        const data = await res.json();
        setEntries(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUnlocked();
  }, []);

  const handleDownload = async (entry) => {
    if (!passphrase) {
      setMessage('Please enter the passphrase used by the owner.');
      return;
    }
    try {
      setMessage('Downloading encrypted blob...');
      const res = await fetch(`/api/file/${entry.id}?as=encrypted`);
      const buffer = await res.arrayBuffer();
      setMessage('Decrypting in browser...');
      const blob = await decryptArrayBuffer(buffer, passphrase, entry.meta.cryptoMeta || entry.meta);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = entry.meta?.originalName || 'decrypted-file';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMessage('Downloaded & decrypted.');
    } catch (err) {
      console.error(err);
      setMessage('Failed to decrypt. Check passphrase and try again.');
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Heir Dashboard (demo)</h2>
      <p className="text-sm text-slate-400 mb-4">
        This view pretends you are an approved heir. In a full version, the
        contract on QIE Testnet would check your address and unlock conditions
        before serving any pointers.
      </p>
      <div className="mb-4 max-w-sm">
        <label className="block text-sm mb-1">Owner&apos;s passphrase</label>
        <input
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
          placeholder="Passphrase chosen by the owner"
        />
      </div>
      {loading ? (
        <p>Loading unlocked entries...</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-slate-400">No unlocked entries yet.</p>
      ) : (
        <ul className="space-y-3">
          {entries.map((e) => (
            <li
              key={e.id}
              className="border border-slate-800 rounded-lg p-3 bg-slate-900/60 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {e.meta?.originalName || 'Encrypted file'}
                </p>
                <p className="text-xs text-slate-400">ID: {e.id}</p>
              </div>
              <button
                onClick={() => handleDownload(e)}
                className="px-3 py-1.5 rounded-md bg-emerald-500 text-slate-950 text-xs font-semibold hover:bg-emerald-400"
              >
                Download & Decrypt
              </button>
            </li>
          ))}
        </ul>
      )}
      {message && <p className="mt-4 text-xs text-slate-300">{message}</p>}
    </section>
  );
}

export default HeirDashboard;
