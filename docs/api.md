# Backend API Reference

## Route Matrix
| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/upload` | Accept encrypted file + metadata, persist to Supabase, optional CID
| `GET` | `/api/files?did=...` | List encrypted records for a DID
| `GET` | `/api/file/:id?as=encrypted` | Stream encrypted blob back to browser
| `POST` | `/api/register-did` | Mint demo DIDs and store in Supabase
| `POST` | `/api/register-heir` | Call `LegacyVault.registerHeirs`
| `GET` | `/api/simulate-unlock?heir=...` | Check `canAccess` before revealing entries
| `POST` | `/api/notify-death` | Set death status + call `markDeceased`
| `GET` | `/api/death-status?did=...` | Retrieve latest death/activation payload
| `POST` | `/api/generate-story` | Invoke OpenRouter for AI memorial text
| `POST` | `/api/anchor-cid` | Hash file ID, submit `setFileCid`, update Supabase
| `GET` | `/api/profile/token` | Fetch tokenization metadata
| `POST` | `/api/profile/token` | Upsert token address + market link
| `GET` | `/api/validators` | List validators (either hardcoded or event replay)
| `POST` | `/api/validators` | Register validator on-chain

## Request/Response Details
### POST /api/upload
- **Headers**: `multipart/form-data`
- **Body fields**:
  - `file`: encrypted blob (binary)
  - `meta`: JSON string: `{ ownerDid, originalName, timestamp, cryptoMeta, title?, description?, encryptionMode }`
  - `ownerDid`: DID string
  - `cid` (optional): IPFS CID from Web3.Storage
- **Response**: `{ ok: true, id: "nanoid" }`
- **Errors**:
  - `400 Missing file/meta/ownerDid`
  - `500 Upload failed` if Supabase Storage errors out

### GET /api/files?did=demo-owner
- Returns array sorted by `timestamp desc` each containing `id`, `storedPath`, `meta`, `cid`, `anchored`, `anchorTxHash` if available.

### GET /api/file/:id?as=encrypted
- Valid `as` currently equals `encrypted`.
- Streams raw ciphertext with headers `Content-Type: application/octet-stream` and `Content-Length`.
- Errors: `404 Not found`, `500 Download failed` if Supabase Storage cannot fetch data.

### POST /api/register-heir
- **Body**: `{ heir: "0x..." }`
- Calls `LegacyVault.registerHeirs([heir])` using backend signer.
- Response: `{ ok: true, heir, txHash }` or `500` with contract error message.

### GET /api/simulate-unlock?heir=0xabc
- Reads Supabase files for demo DID `demo-owner`.
- Calls `contract.canAccess(heir)`; returns `{ allowed: boolean, files: [...] }` (files array empty when false).

### POST /api/notify-death
- **Body**: `{ did }`
- Saves `{ deceased: true, markedAt, txHash? }` to `vault_statuses`.
- Attempts on-chain `markDeceased`; errors are logged but response still returns `{ ok: true, onChain: false }` when RPC fails.

### POST /api/generate-story
- **Body**: `{ did, memory?: { id, title, description, snippet } }`
- Collects metadata for either specific memory or entire DID, crafts prompt, sends to OpenRouter.
- Response: `{ ok: true, story: "..." }` or `{ ok: false, message: "AI story unavailable" }`.

### POST /api/anchor-cid
- **Body**: `{ fileId }`
- Fetch Supabase record, require `cid`.
- Compute `key = keccak256(toUtf8Bytes(fileId))` and call `setFileCid(key, cid)`.
- Update record with `{ anchored: true, anchorTxHash: tx.hash }`.
- Errors: `400 MISSING_FILE_ID/FILE_NOT_FOUND/NO_CID`, `500 ANCHOR_FAILED` for env or contract issues.

### Profile & Validator Routes
- `/api/profile/token` GET/POST uses Supabase `vault_profiles` to store `tokenAddress` and `marketLink` for later tokenization flows.
- `/api/validators` GET attempts to replay `ValidatorRegistered` events (last 10k blocks) when `VAULT_ADDRESS` present; fallback list ensures UI always has data.
- `/api/validators` POST signs `registerValidator(address)` and returns the transaction hash.

## Upload → Supabase → IPFS Pipeline
1. **Browser** encrypts file and optionally sends to Web3.Storage using `VITE_WEB3_STORAGE_KEY`. If successful, a **CID** is returned.
2. The same encrypted blob is sent to `/api/upload`; the backend writes it to Supabase Storage using the derived `storedPath` (e.g., `did/nanoid.enc`).
3. Supabase metadata row stores `cid`, `anchorTxHash`, and `cryptoMeta`.
4. Optional `anchor-cid` step ties the IPFS CID to QIE Mainnet, providing immutable linkage.
5. On download, `/api/file/:id` fetches the blob back from Supabase Storage; the CID is used only for redundancy or public verification.

## Common Error Cases
| Scenario | Cause | Mitigation |
| --- | --- | --- |
| `Supabase is not configured` | Missing `SUPABASE_URL` or key | Populate `.env`, restart server |
| `Missing RPC/PRIVATE_KEY/VAULT_ADDRESS` | Contract routes invoked without env | Ensure all three vars set before calling `/api/register-heir`, `/api/anchor-cid`, etc. |
| `Web3.Storage upload failed` | Service 503/maintenance | Frontend displays warning, and backend upload still succeeds. Retry later if CID needed. |
| `OpenRouter error 502` | Model unreachable | Response returns `{ ok: false }`; UI shows “AI story unavailable.” |
| `Invalid meta JSON` | Frontend bug or manual cURL | `/api/upload` returns 400; ensure `meta` is stringified JSON. |
