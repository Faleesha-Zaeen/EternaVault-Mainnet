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
    <section className="min-h-screen bg-[#0d0e11] text-slate-100 font-['Inter'] flex flex-col items-center text-center gap-8 px-6 py-12">
      <h1 className="text-4xl md:text-5xl font-['Playfair_Display'] text-[#C4A87C] tracking-tight">
        EternaVault – Where Identity Meets Eternity
      </h1>
      <p className="text-slate-400 max-w-2xl leading-relaxed">
        Encrypt your memories client-side, anchor them on QIE Testnet, and
        empower your heirs to access them only when the time is right.
      </p>
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        <button
          onClick={() => navigate('/upload')}
          className="px-6 py-2.5 rounded-full bg-[#6aa4ff] text-[#0d0e11] font-semibold shadow-lg shadow-[#6aa4ff26] hover:bg-[#82b4ff] transition"
        >
          Upload Memories
        </button>
        <button
          onClick={() => navigate('/heir')}
          className="px-6 py-2.5 rounded-full border border-white/5 text-[#C4A87C] hover:bg-[#111317]"
        >
          Heir Dashboard
        </button>
      </div>
      <button
        onClick={handleConnect}
        className="mt-8 px-5 py-2.5 rounded-lg border border-white/5 bg-[#111317] text-sm text-slate-200 shadow-[0_15px_45px_rgba(0,0,0,0.4)] hover:border-[#6aa4ff]"
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
