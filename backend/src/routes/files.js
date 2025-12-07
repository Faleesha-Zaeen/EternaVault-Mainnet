import express from 'express';
import { join } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { JsonRpcProvider, Wallet, Contract, keccak256, toUtf8Bytes } from 'ethers';
import { getFileRecord, updateFileRecord } from '../lib/dataStore.js';

dotenv.config();
const router = express.Router();

const abiPath = join(process.cwd(), 'backend', 'src', 'abi', 'LegacyVault.json');
let LegacyVaultAbi = null;
try {
  LegacyVaultAbi = JSON.parse(fs.readFileSync(abiPath, 'utf-8'));
} catch (e) {
  // ABI may be missing in dev — anchor endpoint will return friendly error when VAULT_ADDRESS missing
  LegacyVaultAbi = null;
}

// POST /api/anchor-cid
router.post('/anchor-cid', async (req, res) => {
  try {
    const { fileId } = req.body || {};
    if (!fileId) return res.status(400).json({ ok: false, error: 'MISSING_FILE_ID' });

    const record = await getFileRecord(fileId);
    if (!record) return res.status(400).json({ ok: false, error: 'FILE_NOT_FOUND' });
    if (!record.cid) return res.status(400).json({ ok: false, error: 'NO_CID' });

    const rpcUrl = process.env.QIE_RPC_URL;
    const pk = process.env.PRIVATE_KEY;
    const vaultAddr = process.env.VAULT_ADDRESS || process.env.REACT_APP_VAULT_ADDRESS;

    if (!rpcUrl || !pk || !vaultAddr || !LegacyVaultAbi) {
      console.error('Missing env or ABI for anchoring', { rpcUrl: !!rpcUrl, pk: !!pk, vaultAddr: !!vaultAddr, hasAbi: !!LegacyVaultAbi });
      return res.status(500).json({ ok: false, error: 'ANCHOR_FAILED', message: 'Missing RPC/PRIVATE_KEY/VAULT_ADDRESS or ABI' });
    }

    const provider = new JsonRpcProvider(rpcUrl);
    const signer = new Wallet(pk, provider);
    const contract = new Contract(vaultAddr, LegacyVaultAbi, signer);

    try {
      const key = keccak256(toUtf8Bytes(fileId.toString()));
      const tx = await contract.setFileCid(key, record.cid);
      console.log('anchor tx hash:', tx.hash);
      const receipt = await tx.wait();

      // update db
      await updateFileRecord(fileId, {
        anchorTxHash: tx.hash,
        anchored: true,
      });

      return res.json({ ok: true, txHash: tx.hash, fileId });
    } catch (contractErr) {
      console.error('contract anchor error:', contractErr);
      return res.status(500).json({ ok: false, error: 'ANCHOR_FAILED', message: contractErr.message });
    }
  } catch (err) {
    console.error('POST /api/anchor-cid error:', err);
    res.status(500).json({ ok: false, error: 'ANCHOR_FAILED', message: err.message });
  }
});

export default router;
