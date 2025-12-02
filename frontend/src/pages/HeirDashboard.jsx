import React, { useEffect, useState } from 'react';
import { decryptArrayBuffer } from '../utils/crypto.js';

function HeirDashboard() {
  const [entries, setEntries] = useState([]);
  const [message, setMessage] = useState('');
  const [heirAddress, setHeirAddress] = useState('');
  const [heirRegistered, setHeirRegistered] = useState(false);
  const [flowNote, setFlowNote] = useState('');
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [unlockResult, setUnlockResult] = useState(null);
  const [deathStatus, setDeathStatus] = useState(null);
  const [activating, setActivating] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalNote, setModalNote] = useState('');
  const [memorySummary, setMemorySummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [decryptedEntries, setDecryptedEntries] = useState({});
  const [decryptedSnippets, setDecryptedSnippets] = useState({});
  const [masterPassphrase, setMasterPassphrase] = useState('');

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

  useEffect(() => {
    let cancelled = false;
    const autoUnlock = async () => {
      if (!modalOpen || !selectedEntry) return;
      if (decryptedEntries[selectedEntry.id]) return;
      if (!masterPassphrase) {
        setModalNote('Enter the vault key to access memories.');
        return;
      }
      setModalNote('Unlocking memory…');
      const success = await decryptMemory(selectedEntry, masterPassphrase, { silent: true, skipDownload: true });
      if (cancelled) return;
      if (success) {
        setModalNote('Memory decrypted. File saved locally.');
      } else {
        setModalNote('Incorrect vault key — try again');
      }
    };
    autoUnlock();
    return () => {
      cancelled = true;
    };
  }, [modalOpen, selectedEntry, masterPassphrase, decryptedEntries]);

  const getEntryTitle = (entry) =>
    entry?.meta?.title?.trim() || entry?.title || entry?.meta?.originalName || 'Encrypted file';

  const getEntryDescription = (entry) => entry?.meta?.description || entry?.description || '';

  const isTextLike = (type = '') => {
    if (!type) return false;
    const lower = type.toLowerCase();
    return lower.startsWith('text/') || lower.includes('json') || lower.includes('csv') || lower.includes('markdown');
  };

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
        setFlowNote('Unlocked. Review downloadable memories below.');
        setSelectedEntry(null);
        setModalOpen(false);
        setMemorySummary('');
        setModalNote('');
        setDecryptedEntries({});
        setDecryptedSnippets({});
      } else {
        setEntries([]);
        setMessage('Access locked by smart contract 🔒');
        setFlowNote('Unlock still pending validator confirmation.');
        setSelectedEntry(null);
        setModalOpen(false);
        setMemorySummary('');
        setModalNote('');
        setDecryptedEntries({});
        setDecryptedSnippets({});
      }
    } catch (err) {
      console.error('Unlock check failed', err);
      setMessage('Failed to verify unlock status.');
      setFlowNote('');
    } finally {
      setCheckingAccess(false);
    }
  };

  const registerHeir = async () => {
    if (!heirAddress) {
      setMessage('Enter a wallet address first.');
      setFlowNote('');
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
        setHeirRegistered(true);
        setFlowNote('✔ Heir successfully registered on blockchain. Next: Verify unlock permission.');
      } else {
        setMessage('Registration failed — see logs.');
        setHeirRegistered(false);
        setFlowNote('');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error registering heir.');
      setHeirRegistered(false);
      setFlowNote('');
    }
  };

  const openMemoryModal = (entry) => {
    setSelectedEntry(entry);
    setModalOpen(true);
    setMemorySummary('');
    setModalNote('');
  };

  const closeMemoryModal = () => {
    setModalOpen(false);
    setSelectedEntry(null);
    setMemorySummary('');
    setModalNote('');
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

  const decryptMemory = async (entry, providedPassphrase, options = {}) => {
    if (!entry) return false;
    const { silent = false, skipDownload = false } = options;
    const activePassphrase = providedPassphrase || masterPassphrase;
    if (!activePassphrase) {
      if (!silent) {
        setMessage('Please enter the vault key before decrypting.');
        setModalNote('Enter the vault key to access memories.');
      }
      return false;
    }
    try {
      if (!silent) {
        setMessage('Downloading encrypted blob...');
        setModalNote('Downloading encrypted blob...');
      }
      const res = await fetch(`/api/file/${entry.id}?as=encrypted`);
      const buffer = await res.arrayBuffer();
      if (!silent) {
        setMessage('Decrypting in browser...');
        setModalNote('Decrypting in browser...');
      }
      const cryptoPayload = entry.meta?.cryptoMeta || entry.meta;
      const blob = await decryptArrayBuffer(buffer, activePassphrase, cryptoPayload);
      if (!skipDownload) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = entry.meta?.originalName || 'decrypted-file';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        if (!silent) {
          setMessage('Downloaded & decrypted.');
          setModalNote('Memory decrypted. File saved locally.');
        }
      }
      setDecryptedEntries((prev) => ({ ...prev, [entry.id]: true }));
      const metaType = cryptoPayload?.type || blob.type;
      if (isTextLike(metaType)) {
        try {
          const text = await blob.text();
          setDecryptedSnippets((prev) => ({ ...prev, [entry.id]: text.slice(0, 1200) }));
        } catch (err) {
          console.warn('Failed to read decrypted text snippet', err);
        }
      }
    } catch (err) {
      console.error(err);
      if (!silent) {
        setMessage('Incorrect vault key — try again');
        setModalNote('Incorrect vault key — try again');
      }
      return false;
    }
    return true;
  };

  const generateMemorySummary = async (entry) => {
    if (!entry) return;
    if (!decryptedEntries[entry.id]) {
      setModalNote('Decrypt this memory before generating AI summary.');
      return;
    }

    setSummaryLoading(true);
    setMessage('Generating AI legacy narrative...');
    setModalNote('Generating AI legacy narrative...');
    try {
      const payload = {
        did: entry.ownerDid || 'demo-owner',
        memory: {
          id: entry.id,
          title: getEntryTitle(entry),
          description: getEntryDescription(entry),
          originalName: entry.meta?.originalName,
          snippet: decryptedSnippets[entry.id] || '',
        },
      };
      const res = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) {
        setMemorySummary(data.story);
        setModalNote('AI memory summary ready.');
      } else {
        setModalNote('Failed to generate story.');
      }
    } catch (err) {
      console.error('generateMemorySummary failed', err);
      setModalNote('Story generation failed — see console.');
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Heir Dashboard (demo)</h2>
      <p className="text-sm text-slate-400 mb-4">
        This view pretends you are an approved heir. In this phase, we now call the
        QIE LegacyVault contract to decide unlock rights and to record when a legacy is activated.
      </p>

      <div className="mb-6 max-w-sm">
        <label className="block text-sm mb-1">Vault Encryption Key</label>
        <input
          type="password"
          value={masterPassphrase}
          onChange={(e) => setMasterPassphrase(e.target.value)}
          className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
          placeholder="Enter the key shared by the owner"
        />
        <p className="text-xs text-slate-400 mt-1">This single key unlocks every encrypted memory.</p>
      </div>

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
          onChange={(e) => {
            setHeirAddress(e.target.value);
            setHeirRegistered(false);
            setFlowNote('');
          }}
          className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
          placeholder="0x..."
        />
        <button
          type="button"
          className="mt-3 px-4 py-2 rounded-md bg-blue-500 text-sm"
          onClick={registerHeir}
        >
          Register Heir On Chain
        </button>
        {heirRegistered && (
          <button
            type="button"
            onClick={checkUnlockStatus}
            className="mt-3 px-4 py-2 rounded-md bg-emerald-500 text-slate-950 font-semibold text-sm hover:bg-emerald-400"
            disabled={checkingAccess}
          >
            {checkingAccess ? 'Checking…' : 'Check Unlock Status'}
          </button>
        )}
        {flowNote && <p className="mt-2 text-xs text-slate-400">{flowNote}</p>}
      </div>
      {unlockResult ? (
        unlockResult.allowed ? (
          entries.length > 0 ? (
            <ul className="space-y-3">
              {entries.map((e) => {
                const title = getEntryTitle(e);
                const description = getEntryDescription(e);
                return (
                  <li
                    key={e.id}
                    className="border border-slate-800 rounded-lg p-3 bg-slate-900/60 flex items-center justify-between gap-3"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{title}</p>
                      {description && (
                        <p className="text-xs text-slate-400 mt-1">{description}</p>
                      )}
                      <p className="text-[11px] text-slate-500 mt-1">ID: {e.id}</p>
                    </div>
                    <button
                      onClick={() => openMemoryModal(e)}
                      className="px-3 py-1.5 rounded-md bg-emerald-500 text-slate-950 text-xs font-semibold hover:bg-emerald-400"
                    >
                      View Memory
                    </button>
                  </li>
                );
              })}
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
      {modalOpen && selectedEntry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 z-50">
          <div className="bg-slate-950 border border-slate-800 rounded-lg w-full max-w-lg p-6">
            <h3 className="text-xl font-semibold mb-1">{getEntryTitle(selectedEntry)}</h3>
            {getEntryDescription(selectedEntry) && (
              <p className="text-sm text-slate-300 mb-4">{getEntryDescription(selectedEntry)}</p>
            )}
            {!decryptedEntries[selectedEntry.id] ? (
              <div className="p-3 border border-slate-800 rounded-md bg-slate-900/40">
                <p className="text-sm text-slate-300">
                  {modalNote || (masterPassphrase ? 'Unlocking memory…' : 'Enter the vault key to access memories.')}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => decryptMemory(selectedEntry, masterPassphrase)}
                  className="px-4 py-2 rounded-md bg-emerald-500 text-slate-950 text-sm font-semibold hover:bg-emerald-400"
                >
                  Download & Decrypt
                </button>
                <button
                  onClick={() => generateMemorySummary(selectedEntry)}
                  className="px-4 py-2 rounded-md bg-purple-500 text-sm font-semibold hover:bg-purple-400 disabled:opacity-40"
                  disabled={!decryptedEntries[selectedEntry.id] || summaryLoading}
                >
                  {summaryLoading ? 'Summoning AI…' : '🧠 Generate AI Legacy Story'}
                </button>
              </div>
            )}
            {memorySummary && (
              <div className="mt-4 p-3 border border-purple-300 rounded-md bg-purple-900/30">
                <p className="whitespace-pre-line text-sm">{memorySummary}</p>
              </div>
            )}
            {modalNote && decryptedEntries[selectedEntry.id] && (
              <p className="mt-3 text-xs text-slate-400 whitespace-pre-line">{modalNote}</p>
            )}
            <button
              onClick={closeMemoryModal}
              className="mt-6 px-4 py-2 rounded-md bg-slate-800 text-sm"
            >
              Back to Memories
            </button>
          </div>
        </div>
      )}
      {message && <p className="mt-4 text-xs text-slate-300">{message}</p>}
    </section>
  );
}

export default HeirDashboard;
