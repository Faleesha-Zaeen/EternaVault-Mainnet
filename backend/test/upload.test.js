import request from 'supertest';
import fs from 'fs';
import path from 'path';
import app from '../src/index.js';

const tmpFile = path.join(process.cwd(), 'backend', 'storage', 'testfile.enc');

async function ensureTmpFile() {
  await fs.promises.writeFile(tmpFile, 'dummy');
}

describe('POST /api/upload', () => {
  it('stores metadata in lowdb', async () => {
    await ensureTmpFile();
    const res = await request(app)
      .post('/api/upload')
      .field('ownerDid', 'demo-owner')
      .field(
        'meta',
        JSON.stringify({ ownerDid: 'demo-owner', originalName: 'dummy.bin', timestamp: new Date().toISOString() })
      )
      .attach('file', tmpFile);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.id).toBeDefined();
  });
});
