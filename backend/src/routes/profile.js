import express from 'express';
import { upsertProfile, getProfile } from '../lib/dataStore.js';

const router = express.Router();

// Stores tokenization metadata for a DID using Supabase tables
router.post('/token', async (req, res) => {
  try {
    const { did, tokenAddress, marketLink } = req.body || {};
    if (!did) return res.status(400).json({ ok: false, error: 'MISSING_DID' });

    await upsertProfile(did, {
      tokenAddress: tokenAddress || null,
      marketLink: marketLink || null,
    });
    // TODO: future integration point — verify token on-chain via QIEDEX or fetch token metadata
    res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/profile/token error:', err);
    res.status(500).json({ ok: false, error: 'SAVE_FAILED' });
  }
});

router.get('/token', async (req, res) => {
  try {
    const did = req.query.did;
    if (!did) return res.status(400).json({ tokenAddress: null, marketLink: null });

    const entry = (await getProfile(did)) || { tokenAddress: null, marketLink: null };
    res.json({
      tokenAddress: entry.tokenAddress || null,
      marketLink: entry.marketLink || null,
    });
  } catch (err) {
    console.error('GET /api/profile/token error:', err);
    res.status(500).json({ tokenAddress: null, marketLink: null });
  }
});

export default router;
