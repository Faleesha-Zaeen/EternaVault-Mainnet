import express from 'express';
import { join } from 'path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import fs from 'fs';

const router = express.Router();

const dbFile = join(process.cwd(), 'backend', 'db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter, { files: [], dids: [], statuses: {}, profile: {} });

// Ensure db file exists and has profile container when first used
router.post('/token', async (req, res) => {
  try {
    const { did, tokenAddress, marketLink } = req.body || {};
    if (!did) return res.status(400).json({ ok: false, error: 'MISSING_DID' });

    await db.read();
    if (!db.data) db.data = { files: [], dids: [], statuses: {}, profile: {} };
    if (!db.data.profile) db.data.profile = {};

    db.data.profile[did] = { tokenAddress: tokenAddress || null, marketLink: marketLink || null };
    await db.write();
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

    await db.read();
    if (!db.data) db.data = { files: [], dids: [], statuses: {}, profile: {} };
    const entry = (db.data.profile && db.data.profile[did]) || { tokenAddress: null, marketLink: null };
    res.json(entry);
  } catch (err) {
    console.error('GET /api/profile/token error:', err);
    res.status(500).json({ tokenAddress: null, marketLink: null });
  }
});

export default router;
