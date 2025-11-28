import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { join } from 'path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { nanoid } from 'nanoid';
import fs from 'fs';
import validatorsRouter from './routes/validators.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: join(process.cwd(), 'backend', 'storage', 'tmp') });

const dbFile = join(process.cwd(), 'backend', 'db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter, { files: [], dids: [], statuses: {} });

await db.read();
if (!db.data) {
  db.data = { files: [], dids: [], statuses: {} };
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
    // TODO: Support streaming or partial retrieval for large files.
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
  // TODO: Call LegacyVault.markDeceased or oracle/validator on QIE Testnet.
  res.json({ ok: true });
});

app.get('/api/simulate-unlock', async (req, res) => {
  const user = req.query.user; // unused for now, demo only
  void user;
  const demoDid = 'demo-owner';
  const status = db.data.statuses[demoDid];
  const now = Date.now();
  const unlocked = !!(status && status.deceased);
  await db.read();
  const files = db.data.files.filter((f) => f.ownerDid === demoDid);

  const result = unlocked
    ? files
    : files.filter((f) => new Date(f.timestamp).getTime() + 5 * 60 * 1000 < now); // 5-min demo unlock

  res.json(result);
});

// Validator routes
app.use('/api/validators', validatorsRouter);

const port = process.env.BACKEND_PORT || 4000;
app.listen(port, () => {
  console.log(`EternaVault backend listening on http://localhost:${port}`);
});

export default app;
