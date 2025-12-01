import React, { useEffect, useState } from 'react';

function TokenizationInfo() {
  const [tokenAddress, setTokenAddress] = useState('');
  const [marketLink, setMarketLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile/token?did=demo-owner');
        const data = await res.json();
        setTokenAddress(data.tokenAddress || '');
        setMarketLink(data.marketLink || '');
      } catch (e) {
        console.error('Failed to load tokenization profile', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          did: 'demo-owner',
          tokenAddress: tokenAddress || null,
          marketLink: marketLink || null,
        }),
      });

      // Ensure response is JSON-safe
      let data = {};
      try {
        data = await res.json();
      } catch {
        data = { ok: true }; // fallback for empty response bodies
      }

      if (data.ok) {
        alert('Saved successfully ✔️');
      } else {
        alert('Save failed ❌');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Save failed — Check console.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Digital Legacy Token (DLT)</h2>
      <p className="text-sm text-slate-300 mb-2">You can associate a QIEDEX-created token with your vault profile. A token can represent inheritance tiers, access rights, or membership.</p>
      <p className="text-sm text-slate-300 mb-4">For this hackathon, token creation happens outside this app via the QIEDEX Token Creator UI.</p>

      <div className="max-w-lg bg-slate-900/60 border border-slate-800 rounded-md p-4">
        <label className="block text-sm text-slate-400 mb-1">Your DLT Token Address</label>
        <input
          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm mb-3"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          placeholder="0x... or QIE token address"
        />

        <label className="block text-sm text-slate-400 mb-1">Liquidity / Market Link (optional)</label>
        <input
          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm mb-3"
          value={marketLink}
          onChange={(e) => setMarketLink(e.target.value)}
          placeholder="https://qiedex.example/market/123"
        />

        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400">{loading ? 'Loading…' : ''}</div>
          <button
            className="px-4 py-2 bg-emerald-600 rounded text-sm"
            onClick={save}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-3">Token minting is done externally with QIEDEX Token Creator. This screen links a QIE token to the user for future versions.</p>
      </div>
    </section>
  );
}

export default TokenizationInfo;
