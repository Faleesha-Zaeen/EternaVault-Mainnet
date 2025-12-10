# Setup Guide

## Prerequisites
- **Operating system**: macOS, Linux, or Windows 11 with WSL/PowerShell 5.1+
- **Node.js**: v18.x (needed for native fetch, workspaces, and optional `--watch` support)
- **npm**: v9.x (required for npm workspaces used by root `package.json`)
- **Supabase account** with Storage bucket + Postgres tables (or local dockerized Supabase)
- **QIE Mainnet RPC endpoint** and funded deployer wallet for contract operations
- Optional: **Web3.Storage API token** and **OpenRouter API key** if you want IPFS pinning + AI summaries

## Environment Variables
Create `.env` in repo root and `frontend/.env.local` for Vite-only secrets.

| Variable | Required | Purpose |
| --- | --- | --- |
| `QIE_RPC_URL` | ✅ | HTTPS RPC endpoint used by both backend and Hardhat
| `QIE_CHAIN_ID` | ⛭ | Defaults to `1990`; override for testnets
| `PRIVATE_KEY` | ✅ | Hex key that signs `LegacyVault` transactions (never commit)
| `VAULT_ADDRESS` | ✅ | Deployed `LegacyVault` address on QIE Mainnet
| `BACKEND_PORT` | ⛭ | Defaults to `4000`
| `SUPABASE_URL` | ✅ | Supabase project URL
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Full-access key for writes to Postgres + Storage
| `SUPABASE_ANON_KEY` | ⛭ | Read-only fallback when service role unavailable
| `SUPABASE_BUCKET` | ✅ | Storage bucket for encrypted blobs (default `encrypted-files`)
| `SUPABASE_TABLE_FILES/DIDS/STATUSES/PROFILES` | ⛭ | Override table names if needed
| `OPENROUTER_API_KEY` | ⛭ | Enables `/api/generate-story`
| `OPENROUTER_MODEL` | ⛭ | Defaults to `deepseek/deepseek-r1:free`
| `OPENROUTER_REFERRER/TITLE` | ⛭ | Branding metadata sent to OpenRouter
| `VITE_WEB3_STORAGE_KEY` | ⛭ | Stored in `frontend/.env.local`; enables optional IPFS upload

## Local Development Setup
1. **Clone the repo**
   ```bash
   git clone https://github.com/Faleesha-Zaeen/EternaVault-Mainnet.git
   cd EternaVault-Mainnet
   ```
2. **Install workspaces** (single command)
   ```bash
   npm install
   ```
3. **Configure env files**
   - Root `.env` containing Supabase + QIE credentials
   - `frontend/.env.local` with `VITE_WEB3_STORAGE_KEY`
4. **Run dev stack**
   ```bash
   npm run dev
   ```
   This uses `concurrently` to start `backend` on `4000` and `frontend` on Vite `5173` with a proxy for `/api`.

## Production Build Steps
1. **Build frontend**
   ```bash
   cd frontend
   npm run build
   npm run preview   # optional smoke-check
   ```
2. **Deploy backend** (Render, Fly, etc.)
   - Copy `frontend/dist` into a static bucket or serve via CDN.
   - Run `npm run start` inside `backend` host with identical `.env`.
3. **Environment sync**
   - Ensure the deployment platform exposes Supabase + RPC secrets securely.
   - Use `VAULT_ADDRESS` from production contract deployment.

## Workspace Commands
From repo root:
- `npm run dev`: start frontend + backend together
- `npm run server`: backend only
- `npm run client`: frontend only
- `npm run build`: builds frontend production bundle
- `npm run test`: runs frontend, backend, and contract test suites sequentially

Within subpackages:
- `frontend`: `npm run dev|build|preview|test`
- `backend`: `npm run dev|start|test`
- `contracts`: `npx hardhat test`, `npx hardhat run scripts/deploy.js --network qieMainnet`

## Setup Scripts Explained
- `scripts/setup.sh` and `scripts/setup.ps1` perform **idempotent installation**:
  1. Check for `node_modules` in each workspace and install if missing.
  2. Run `npx hardhat compile` to ensure ABI availability.
  3. Build the Vite frontend so asset pipeline is validated before demos.
- These scripts are safe to re-run; they skip installations when dependencies already exist and continue even if Hardhat or Vite builds fail (printing warnings instead of exiting).
