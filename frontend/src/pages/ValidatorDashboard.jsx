import React, { useState } from "react";
import { connectWallet, shortAddress } from "../utils/web3";
import axios from "axios";

export default function ValidatorDashboard() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [message, setMessage] = useState("");

  const handleConnect = async () => {
    try {
      const wallet = await connectWallet();
      if (wallet?.address) {
        setWalletAddress(wallet.address);
      }
    } catch (err) {
      console.error("Wallet connection error:", err);
    }
  };

  const handleRegisterValidator = async () => {
    try {
      setMessage("⏳ Sending transaction...");
      const res = await axios.post(`${import.meta.env.VITE_API_BASE}/api/validators`, {
        address: walletAddress,
      });

      if (res.data?.txHash) {
        setMessage(`✅ Registered! Tx: ${res.data.txHash}`);
      } else {
        setMessage("⚠️ Request sent but no transaction returned.");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed — check backend logs.");
    }
  };

  return (
    <section className="min-h-screen w-full max-w-3xl mx-auto bg-[#0d0e11] text-slate-100 font-['Inter'] px-4 py-10 sm:px-10">
      <div className="bg-[#111317] border border-white/5 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.35)] space-y-4">
        <h1 className="text-3xl font-['Playfair_Display'] text-[#C4A87C] tracking-[0.08em]">Validator Dashboard</h1>

        {walletAddress ? (
          <p className="text-sm text-emerald-300 font-semibold">
            Connected: {shortAddress(walletAddress)}
          </p>
        ) : (
          <button
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-[#6aa4ff] text-[#0d0e11] text-sm font-semibold shadow-lg shadow-[#6aa4ff26] hover:bg-[#82b4ff] transition-all duration-300 hover:-translate-y-1"
            onClick={handleConnect}
          >
            Connect Wallet
          </button>
        )}

        {walletAddress && (
          <button
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-[#6a5b99] text-sm font-semibold text-white shadow-lg shadow-[#6a5b9926] hover:bg-[#8170b3] transition-all duration-300 hover:-translate-y-1"
            onClick={handleRegisterValidator}
          >
            Register as Validator
          </button>
        )}

        {message && (
          <p className="text-sm text-[#8A8F99] whitespace-pre-line">
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
