import request from 'supertest';
import express from 'express';

// Basic smoke test: ensure the validators route responds to GET/POST when env missing
import validatorsRouter from '../src/routes/validators.js';

const app = express();
app.use(express.json());
app.use('/api/validators', validatorsRouter);

describe('validators route (smoke)', () => {
  it('GET /api/validators returns validators array', async () => {
    const res = await request(app).get('/api/validators');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.validators)).toBeTruthy();
  });

  it('POST /api/validators without env returns 400', async () => {
    const res = await request(app).post('/api/validators').send({ address: '0x123' });
    expect(res.status).toBe(400);
  });
});
