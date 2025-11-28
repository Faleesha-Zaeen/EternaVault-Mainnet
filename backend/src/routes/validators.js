import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JsonRpcProvider, Wallet, Contract } from 'ethers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load ABI manually instead of using import assertions
const abiPath = path.join(__dirname, '../abi/LegacyVault.json');
const LegacyVaultAbi = JSON.parse(fs.readFileSync(abiPath, 'utf-8'));

dotenv.config();
const router = express.Router();

// GET /api/validators
router.get('/', async (req, res) => {
  try {
    const rpcUrl = process.env.QIE_RPC_URL;
    if (!rpcUrl) return res.json({ validators: [] });
    const provider = new JsonRpcProvider(rpcUrl);

    // If VAULT_ADDRESS is provided, try to read past events. If not, return demo list.
    const vaultAddr = process.env.VAULT_ADDRESS || process.env.REACT_APP_VAULT_ADDRESS;
    if (!vaultAddr) {
      // Demo hard-coded list
      return res.json({ validators: [
        '0x000000000000000000000000000000000000dEaD'
      ]});
    }

    const contract = new Contract(vaultAddr, LegacyVaultAbi, provider);

    try {
      // Try reading past ValidatorRegistered events
      const filter = contract.filters.ValidatorRegistered();
      const events = await contract.queryFilter(filter, -10000);
      const addrs = events.map(e => e.args?.validator).filter(Boolean);
      return res.json({ validators: addrs });
    } catch (e) {
      console.error('Error reading events', e);
      return res.json({ validators: [] });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to list validators' });
  }
});

// POST /api/validators
router.post('/', async (req, res) => {
  try {
    const { address } = req.body || {};
    if (!address) return res.status(400).json({ error: 'address required' });
    console.log('POST /api/validators received address:', address);

    const rpcUrl = process.env.QIE_RPC_URL;
    const pk = process.env.PRIVATE_KEY;
    const vaultAddr = process.env.VAULT_ADDRESS || process.env.REACT_APP_VAULT_ADDRESS;

    if (!rpcUrl || !pk || !vaultAddr) {
      return res.status(400).json({ error: 'missing QIE_RPC_URL/PRIVATE_KEY/VAULT_ADDRESS in env' });
    }

    const provider = new JsonRpcProvider(rpcUrl);
    const signer = new Wallet(pk, provider);
    const contract = new Contract(vaultAddr, LegacyVaultAbi, signer);

    try {
      const tx = await contract.registerValidator(address);
      console.log('registerValidator tx hash:', tx.hash);
      const receipt = await tx.wait();
      return res.json({ ok: true, txHash: tx.hash, receipt });
    } catch (contractErr) {
      console.error('contract/registerValidator error:', contractErr);
      return res.status(500).json({ error: contractErr.message, stack: contractErr.stack });
    }
  } catch (err) {
    console.error('POST /api/validators outer error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

export default router;
