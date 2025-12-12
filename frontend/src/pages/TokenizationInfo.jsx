import React, { useEffect, useState } from 'react';
import { useWallet } from '../context/WalletContext';

function TokenizationInfo() {
  const [tokenAddress, setTokenAddress] = useState('');
  const [marketLink, setMarketLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { walletAddress } = useWallet();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/profile/token?did=${walletAddress}`);
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
  }, [walletAddress]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/profile/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          did: walletAddress,
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
    <section className="min-h-screen w-full max-w-4xl mx-auto bg-[#0d0e11] text-slate-100 font-['Inter'] px-4 py-10 sm:px-10 space-y-6">
      <div>
        <h2 className="text-3xl font-['Playfair_Display'] text-[#C4A87C] tracking-[0.08em]">Digital Legacy Token (DLT)</h2>
        <p className="text-sm text-[#8A8F99] mt-3">
          You can associate a QIEDEX-created token with your vault profile. A token can represent inheritance tiers, access rights, or membership.
        </p>
        <p className="text-sm text-[#8A8F99]">
          For this hackathon, token creation happens outside this app via the QIEDEX Token Creator UI.
        </p>
      </div>

      <div className="max-w-xl bg-[#111317] border border-white/5 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.35)] space-y-4">
        <div>
          <label className="block text-sm uppercase tracking-wide text-[#C4A87C] mb-2">Your DLT Token Address</label>
          <input
            className="w-full bg-[#0d0e11] border border-white/5 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-[#6c707a] focus:outline-none focus:border-[#6aa4ff] transition"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="0x... or QIE token address"
          />
        </div>

        <div>
          <label className="block text-sm uppercase tracking-wide text-[#C4A87C] mb-2">Liquidity / Market Link (optional)</label>
          <input
            className="w-full bg-[#0d0e11] border border-white/5 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-[#6c707a] focus:outline-none focus:border-[#6aa4ff] transition"
            value={marketLink}
            onChange={(e) => setMarketLink(e.target.value)}
            placeholder="https://qiedex.example/market/123"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="text-xs text-[#8A8F99]">{loading ? 'Loading…' : ''}</div>
          <button
            className="px-4 py-2 rounded-md bg-[#6aa4ff] text-[#0d0e11] text-sm font-semibold shadow-lg shadow-[#6aa4ff26] hover:bg-[#82b4ff] transition-all duration-300 hover:-translate-y-1"
            onClick={save}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>

        <p className="text-xs text-[#8A8F99]">
          Token minting is done externally with QIEDEX Token Creator. This screen links a QIE token to the user for future versions.
        </p>
      </div>
    </section>
  );
}

export default TokenizationInfo;
