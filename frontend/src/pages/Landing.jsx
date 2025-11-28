import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();
  const [connected, setConnected] = useState(false);

  const handleConnect = () => {
    // TODO: Wire real wallet connection (e.g., MetaMask, QIE wallet)
    setConnected(true);
  };

  return (
    <section className="flex flex-col items-center text-center gap-6 mt-10">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
        EternaVault – Where Identity Meets Eternity
      </h1>
      <p className="text-slate-300 max-w-2xl">
        Encrypt your memories client-side, anchor them on QIE Testnet, and
        empower your heirs to access them only when the time is right.
      </p>
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        <button
          onClick={() => navigate('/upload')}
          className="px-5 py-2.5 rounded-full bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400"
        >
          Upload Memories
        </button>
        <button
          onClick={() => navigate('/heir')}
          className="px-5 py-2.5 rounded-full border border-emerald-400 text-emerald-200 hover:bg-emerald-950/40"
        >
          Heir Dashboard
        </button>
      </div>
      <button
        onClick={handleConnect}
        className="mt-6 px-4 py-2 rounded-lg border border-slate-600 bg-slate-900/60 hover:border-emerald-400 text-sm"
      >
        {connected ? 'Wallet Connected (stub)' : 'Connect Wallet'}
      </button>
      <p className="mt-4 text-xs text-slate-500 max-w-sm">
        This demo does not send real transactions yet. In a full version,
        connecting your QIE wallet would let you register heirs and anchor
        file references on-chain.
      </p>
    </section>
  );
}

export default Landing;
