import dotenv from 'dotenv';
import { JsonRpcProvider, Wallet } from 'ethers';

dotenv.config();

export function getQieProvider() {
  const rpcUrl = process.env.QIE_RPC_URL;
  if (!rpcUrl) {
    // For local dev we can just return a default provider-less instance or null.
    return null;
  }
  return new JsonRpcProvider(rpcUrl);
}

export function getQieSigner() {
  const provider = getQieProvider();
  const pk = process.env.PRIVATE_KEY;
  if (!provider || !pk) return null;
  // TODO: In production, private keys should not live in env vars.
  return new Wallet(pk, provider);
}

// TODO: Later add helpers for calling LegacyVault contract on QIEMainnet,
// e.g., getLegacyVaultContract(address) using ABI + signer.
