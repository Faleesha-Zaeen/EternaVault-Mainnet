# Testing Strategy

## Frontend (Vitest + jsdom)
- Located in `frontend/test/crypto.test.js`.
- Validates AES-GCM round-trip by encrypting a text file, reusing derived metadata, and confirming decrypted blob equals original string.
- Uses browser-compatible Web Crypto available in jsdom; ensures edge cases (File.text fallback) are covered.

## Backend (Supertest)
- `backend/test/upload.test.js` spins up Express app via module exports and invokes `/api/upload` using a temporary file.
- Confirms response `{ ok: true, id }` and ensures Supabase insert path is called (mock/stub or live depending on env).
- Provides regression coverage for multipart handling, metadata parsing, and Supabase error surfacing.

## Smart Contracts (Hardhat)
- `contracts/test/LegacyVault.js` uses Hardhat network with chai assertions.
- Tests include:
  - **Heir unlock timestamp**: verifying `canAccess` flips after `evm_setNextBlockTimestamp`.
  - **markDeceased**: immediate access for heirs once owner toggles flag.
  - **Validator registration**: ensures `isValidator(address)` returns true after registration.

## Test Commands
| Layer | Command | Notes |
| --- | --- | --- |
| Frontend | `cd frontend && npm test` | Runs Vitest with jsdom environment |
| Backend | `cd backend && npm test` | Executes Supertest suite via Node |
| Contracts | `cd contracts && npx hardhat test` | Spins up in-memory Hardhat network |
| Full | `npm run test` | Runs all three sequentially from root |

## CI Considerations
- Mock Supabase + RPC during CI to avoid hitting live services; environment variables can point to local dockerized services.
- For deterministic contract tests, Hardhat’s default network is already deterministic; avoid forking mainnet unless necessary.
