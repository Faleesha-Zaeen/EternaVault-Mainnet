import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { nanoid } from 'nanoid';
import fs from 'fs';
import { JsonRpcProvider, Wallet, Contract } from 'ethers';
import fetch from 'node-fetch';
import validatorsRouter from './routes/validators.js';
import filesRouter from './routes/files.js';
import profileRouter from './routes/profile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
console.log("🔍 ENV CHECK:");
console.log("QIE_RPC_URL:", process.env.QIE_RPC_URL);
console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY?.slice(0,8) + "..."); // don't expose full key
console.log("VAULT_ADDRESS:", process.env.VAULT_ADDRESS);

// --- Contract helper (LegacyVault) ---
let LegacyVaultAbi = null;
try {
  const abiPath = join(__dirname, 'abi', 'LegacyVault.json');
  const parsedAbi = JSON.parse(fs.readFileSync(abiPath, 'utf-8'));
  LegacyVaultAbi = Array.isArray(parsedAbi) ? parsedAbi : parsedAbi?.abi;
  if (!LegacyVaultAbi) {
    throw new Error('LegacyVault ABI file missing ABI array');
  }
  console.log(`✅ Loaded LegacyVault ABI (${LegacyVaultAbi.length} entries)`);
} catch (e) {
  console.error('Failed to load LegacyVault ABI:', e.message);
  LegacyVaultAbi = null;
}

const rpcUrl = process.env.QIE_RPC_URL;
const pk = process.env.PRIVATE_KEY;
const vaultAddr = process.env.VAULT_ADDRESS || '0x2A29BeCCe643dD1a6f4D823deE3F28F45BdBc7cd';

function getVaultContract() {
  if (!rpcUrl || !pk || !vaultAddr || !LegacyVaultAbi) {
    throw new Error('Missing RPC/PRIVATE_KEY/VAULT_ADDRESS or ABI for LegacyVault');
  }
  const provider = new JsonRpcProvider(rpcUrl);
  const signer = new Wallet(pk, provider);
  return new Contract(vaultAddr, LegacyVaultAbi, signer);
}

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: join(process.cwd(), 'backend', 'storage', 'tmp') });

// ✅ FIXED: DB now includes profile object
const dbFile = join(process.cwd(), 'backend', 'db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter, { files: [], dids: [], statuses: {}, profile: {} });

await db.read();

// Ensure structure exists even if db.json already existed but was missing profile
if (!db.data) {
  db.data = { files: [], dids: [], statuses: {}, profile: {} };
  await db.write();
} else {
  if (!db.data.profile) db.data.profile = {};
  await db.write();
}

const storageDir = join(process.cwd(), 'backend', 'storage');
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { ownerDid } = req.body;
    const { cid } = req.body;
    const metaStr = req.body.meta;

    if (!file || !metaStr || !ownerDid) {
      return res.status(400).json({ ok: false, error: 'Missing file/meta/ownerDid' });
    }

    const meta = JSON.parse(metaStr);
    const id = nanoid();
    const filename = `${id}.enc`;
    const storedPath = join(storageDir, filename);

    fs.renameSync(file.path, storedPath);

    const record = {
      id,
      ownerDid,
      storedPath,
      meta,
      cid: cid || null,
      anchored: false,
      timestamp: new Date().toISOString(),
    };

    db.data.files.push(record);
    await db.write();

    res.json({ ok: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Upload failed' });
  }
});

app.get('/api/files', async (req, res) => {
  const did = req.query.did;
  if (!did) return res.status(400).json([]);
  await db.read();
  const list = db.data.files.filter((f) => f.ownerDid === did);
  res.json(list);
});

app.get('/api/file/:id', async (req, res) => {
  const { id } = req.params;
  const as = req.query.as;
  if (as !== 'encrypted') {
    return res.status(400).json({ error: 'Only as=encrypted is supported for now' });
  }
  await db.read();
  const record = db.data.files.find((f) => f.id === id);
  if (!record) return res.status(404).json({ error: 'Not found' });

  res.download(record.storedPath, record.meta?.originalName || `${id}.enc`);
});

app.post('/api/register-did', async (_req, res) => {
  const did = `did:eternavault:${nanoid(10)}`;
  db.data.dids.push({ did, createdAt: new Date().toISOString() });
  await db.write();
  res.json({
    did,
    note: 'QIE on-chain mapping will go here',
    sampleChainResponse: {},
  });
});

app.post('/api/notify-death', async (req, res) => {
  const { did } = req.body || {};
  if (!did) return res.status(400).json({ error: 'did is required' });

  db.data.statuses[did] = {
    deceased: true,
    markedAt: new Date().toISOString(),
  };
  await db.write();

  // Attempt on-chain markDeceased
  try {
    const contract = getVaultContract();
    const tx = await contract.markDeceased();
    console.log('markDeceased tx hash:', tx.hash);
    await tx.wait();
    db.data.statuses[did].txHash = tx.hash;
    db.data.statuses[did].chain = 'qie-testnet';
    await db.write();
    return res.json({ ok: true, txHash: tx.hash });
  } catch (err) {
    console.error('markDeceased on-chain failed:', err);
    // Still return ok locally, but include error metadata
    return res.json({ ok: true, onChain: false, error: 'On-chain markDeceased failed', details: err.message });
  }
});

app.get('/api/simulate-unlock', async (req, res) => {
  const heir = req.query.heir;
  const demoDid = 'demo-owner';
  await db.read();
  const files = db.data.files.filter((f) => f.ownerDid === demoDid);

  let allowed = false;
  if (heir) {
    try {
      const contract = getVaultContract();
      // contract.canAccess may return a boolean or a value convertible to boolean
      const can = await contract.canAccess(heir);
      allowed = !!can;
    } catch (err) {
      console.error('canAccess check failed:', err);
      allowed = false;
    }
  }

  const result = allowed ? files : [];
  return res.json({ allowed, files: result });
});

// Death status route — returns local + on-chain info if present
app.get('/api/death-status', async (req, res) => {
  const did = req.query.did || 'demo-owner';
  await db.read();
  const status = db.data.statuses[did] || null;
  res.json(status || { deceased: false });
});

app.post('/api/register-heir', async (req, res) => {
  const { heir } = req.body || {};
  if (!heir) return res.status(400).json({ ok: false, error: 'Missing heir address' });

  try {
    const contract = getVaultContract();
    const tx = await contract.registerHeirs([heir]);
    console.log('registerHeirs tx:', tx.hash);
    await tx.wait();

    res.json({
      ok: true,
      heir,
      txHash: tx.hash,
    });
  } catch (err) {
    console.error('registerHeirs failed:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/generate-story', async (req, res) => {
  try {
    const { did } = req.body || {};
    if (!did) return res.status(400).json({ ok: false, error: 'Missing DID' });

    await db.read();
    const files = db.data.files.filter((f) => f.ownerDid === did);
    if (!files.length) {
      return res.json({ ok: false, message: 'No files available to summarize.' });
    }

    const summaryData = files.map((file) => ({
      filename: file.meta?.originalName,
      timestamp: file.timestamp,
      type: file.meta?.originalName?.split('.').pop() || 'unknown',
    }));

    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_KEY) {
      return res.status(500).json({ ok: false, error: 'Missing GEMINI_API_KEY' });
    }

    const aiPrompt = `Create a sentimental, heartwarming memorial-style biography using the following preserved memories. DO NOT mention file extensions.\n\nMemories:\n${JSON.stringify(summaryData, null, 2)}\n\nTone: Emotional, respectful, reflective. Write 2–5 paragraphs.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: aiPrompt }],
            },
          ],
        }),
      },
    );

    const data = await response.json();
    const story = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
    return res.json({ ok: true, story });
  } catch (err) {
    console.error('generate-story failed:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Validator routes
app.use('/api/validators', validatorsRouter);

// File / anchoring routes
app.use('/api', filesRouter);

// Tokenization profile routes
app.use('/api/profile', profileRouter);

const port = process.env.BACKEND_PORT || 4000;
app.listen(port, () => {
  console.log(`EternaVault backend listening on http://localhost:${port}`);
});

export default app;
