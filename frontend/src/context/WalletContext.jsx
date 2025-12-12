import React, { createContext, useContext, useState } from "react";
import { connectWallet } from "../utils/web3";

const WalletContext = createContext({ walletAddress: null, connect: async () => {} });

export function WalletProvider({ children }) {
  const [walletAddress, setWalletAddress] = useState(null);

  const connect = async () => {
    try {
      const wallet = await connectWallet();
      if (wallet?.address) {
        setWalletAddress(wallet.address);
      }
      return wallet;
    } catch (err) {
      console.error("Wallet connection error:", err);
      throw err;
    }
  };

  return (
    <WalletContext.Provider value={{ walletAddress, connect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
