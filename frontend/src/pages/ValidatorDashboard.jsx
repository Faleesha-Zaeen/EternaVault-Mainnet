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
      const res = await axios.post("http://localhost:4000/api/validators", {
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Validator Dashboard</h1>

      {walletAddress ? (
        <p className="text-green-600 font-semibold mb-4">
          Connected: {shortAddress(walletAddress)}
        </p>
      ) : (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
          onClick={handleConnect}
        >
          Connect Wallet
        </button>
      )}

      {walletAddress && (
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded"
          onClick={handleRegisterValidator}
        >
          Register as Validator
        </button>
      )}

      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
