import React, { useEffect, useState } from 'react';
import { decryptArrayBuffer } from '../utils/crypto.js';

function HeirDashboard() {
  const [entries, setEntries] = useState([]);
  const [passphrase, setPassphrase] = useState('');
  const [message, setMessage] = useState('');
  const [heirAddress, setHeirAddress] = useState('');
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [unlockResult, setUnlockResult] = useState(null);
  const [deathStatus, setDeathStatus] = useState(null);
  const [activating, setActivating] = useState(false);
  const [aiStory, setAiStory] = useState('');

  useEffect(() => {
    const fetchDeathStatus = async () => {
      try {
        const res = await fetch('/api/death-status?did=demo-owner');
        const data = await res.json();
        setDeathStatus(data);
      } catch (e) {
        console.error('Failed to fetch death status', e);
      }
    };
    fetchDeathStatus();
  }, []);

  const checkUnlockStatus = async () => {
    if (!heirAddress) {
      setMessage('Enter a heir wallet address before checking access.');
      return;
    }
    setCheckingAccess(true);
    setMessage('Checking on-chain access permissions...');
    try {
      const res = await fetch(`/api/simulate-unlock?heir=${encodeURIComponent(heirAddress)}`);
      const data = await res.json();
      setUnlockResult(data);
      if (data.allowed) {
        setEntries(data.files || []);
        setMessage('Access granted by smart contract.');
      } else {
        setEntries([]);
        setMessage('Access locked by smart contract 🔒');
      }
    } catch (err) {
      console.error('Unlock check failed', err);
      setMessage('Failed to verify unlock status.');
    } finally {
      setCheckingAccess(false);
    }
  };

  const markLegacyActivated = async () => {
    setActivating(true);
    setMessage('Sending Legacy activation transaction...');
    try {
      const res = await fetch('/api/notify-death', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ did: 'demo-owner' }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage('Legacy Activated on Chain ✅');
        setDeathStatus((prev) => ({
          ...(prev || {}),
          deceased: true,
          markedAt: new Date().toISOString(),
          txHash: data.txHash || prev?.txHash,
          chain: 'qie-testnet',
        }));
      } else {
        setMessage('Activation failed. Check console for details.');
      }
    } catch (err) {
      console.error('markLegacyActivated error', err);
      setMessage('Activation failed — see console.');
    } finally {
      setActivating(false);
    }
  };

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

  const generateStory = async () => {
    setMessage('Generating AI legacy narrative...');
    try {
      const res = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ did: 'demo-owner' }),
      });
      const data = await res.json();
      if (data.ok) {
        setAiStory(data.story);
        setMessage('AI Story generated ✔');
      } else {
        setMessage('Failed to generate story.');
      }
    } catch (err) {
      console.error('generateStory failed', err);
      setMessage('Story generation failed — see console.');
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Heir Dashboard (demo)</h2>
      <p className="text-sm text-slate-400 mb-4">
        This view pretends you are an approved heir. In this phase, we now call the
        QIE LegacyVault contract to decide unlock rights and to record when a legacy is activated.
      </p>

      <div className="bg-slate-900/60 border border-slate-800 rounded-md p-4 mb-6">
        <p className="text-sm font-semibold mb-2">Legacy Status</p>
        {!deathStatus ? (
          <p className="text-xs text-slate-400">Fetching status from backend…</p>
        ) : deathStatus.deceased ? (
          <div>
            <p className="text-sm text-emerald-300">Status: Legacy activated on QIE ✅</p>
            {deathStatus.txHash && (
              <a
                href={`https://testnet.qie.digital/tx/${deathStatus.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 underline text-xs"
              >
                View on Explorer
              </a>
            )}
          </div>
        ) : (
          <p className="text-sm text-yellow-300">Status: Owner still alive — access locked 🔒</p>
        )}
        <button
          className="mt-3 px-4 py-2 rounded-md bg-pink-600 text-sm"
          onClick={markLegacyActivated}
          disabled={activating}
        >
          {activating ? 'Activating…' : 'Mark Legacy Activated'}
        </button>
      </div>

      <div className="mb-4 max-w-sm">
        <label className="block text-sm mb-1">Heir Wallet Address</label>
        <input
          type="text"
          value={heirAddress}
          onChange={(e) => setHeirAddress(e.target.value)}
          className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
          placeholder="0x..."
        />
        <button
          type="button"
          onClick={checkUnlockStatus}
          className="mt-3 px-4 py-2 rounded-md bg-emerald-500 text-slate-950 font-semibold text-sm hover:bg-emerald-400"
          disabled={checkingAccess}
        >
          {checkingAccess ? 'Checking…' : 'Check Unlock Status'}
        </button>
        <button
          type="button"
          className="mt-3 px-4 py-2 rounded-md bg-blue-500 text-sm"
          onClick={async () => {
            if (!heirAddress) {
              setMessage('Enter a wallet address first.');
              return;
            }

            setMessage('Registering heir on QIE blockchain...');
            try {
              const res = await fetch('/api/register-heir', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ heir: heirAddress }),
              });
              const data = await res.json();

              if (data.ok) {
                setMessage(`Heir registered on-chain 🎉\nTX: ${data.txHash}`);
              } else {
                setMessage('Registration failed — see logs.');
              }
            } catch (err) {
              console.error(err);
              setMessage('Error registering heir.');
            }
          }}
        >
          Register Heir On Chain
        </button>
      </div>
      <div className="mb-4 max-w-sm">
        <label className="block text-sm mb-1">Owner&apos;s passphrase</label>
        <input
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
          placeholder="Passphrase chosen by the owner"
        />
        <button
          type="button"
          onClick={generateStory}
          className="mt-3 px-4 py-2 rounded-md bg-purple-500 text-sm font-semibold hover:bg-purple-400"
        >
          🧠 Generate AI Legacy Story
        </button>
      </div>
      {unlockResult ? (
        unlockResult.allowed ? (
          entries.length > 0 ? (
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
          ) : (
            <p className="text-sm text-slate-400">No files available yet.</p>
          )
        ) : (
          <p className="text-sm text-slate-400">
            Heir cannot access files until legacy is activated on-chain.
          </p>
        )
      ) : (
        <p className="text-sm text-slate-400">Check unlock status to see available files.</p>
      )}
      {aiStory && (
        <div className="mt-6 p-4 border border-purple-300 rounded-md bg-purple-900/30">
          <h3 className="font-semibold text-lg mb-2">📜 Legacy Story</h3>
          <p className="whitespace-pre-line text-sm">{aiStory}</p>
        </div>
      )}
      {message && <p className="mt-4 text-xs text-slate-300">{message}</p>}
    </section>
  );
}

export default HeirDashboard;
