# EternaVault – QIE Mainnet Digital Legacy Vault

EternaVault is a client-side encrypted digital inheritance vault powered by QIE Mainnet. Every unlock is cryptographically authorized, publicly verifiable, and impossible to alter — not even the company can override the owner’s final wishes. By anchoring ownership, access control, and final intent on-chain, EternaVault delivers a guarantee no centralized system can offer after death.

<p align="center">
	<!-- Core -->
	<img src="https://img.shields.io/badge/Blockchain-QIE_Mainnet-4A90E2?logo=ethereum&logoColor=white" alt="QIE Mainnet" />
	<img src="https://img.shields.io/badge/Chain_ID-1990-blue" alt="Chain ID 1990" />
	<img src="https://img.shields.io/badge/Status-Hackathon_Prototype-orange" alt="Hackathon Prototype" />
	<!-- Smart Contracts -->
	<img src="https://img.shields.io/badge/Solidity-0.8.18-363636?logo=solidity" alt="Solidity" />
	<img src="https://img.shields.io/badge/Framework-Hardhat-fcc23c" alt="Hardhat" />
	<!-- Frontend -->
	<img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React" />
	<img src="https://img.shields.io/badge/Vite-Bundler-646CFF?logo=vite&logoColor=white" alt="Vite" />
	<!-- Backend -->
	<img src="https://img.shields.io/badge/Node.js-18-339933?logo=node.js&logoColor=white" alt="Node.js" />
	<img src="https://img.shields.io/badge/API-Express.js-000000?logo=express" alt="Express" />
	<!-- Storage -->
	<img src="https://img.shields.io/badge/Storage-Supabase-3ECF8E?logo=supabase&logoColor=white" alt="Supabase" />
	<img src="https://img.shields.io/badge/Database-Postgres-336791?logo=postgresql&logoColor=white" alt="Postgres" />
	<!-- Security -->
	<img src="https://img.shields.io/badge/Encryption-AES--GCM_256bit-black" alt="AES-GCM" />
	<img src="https://img.shields.io/badge/Security-Client--Side_Only-green" alt="Client-side security" />
	<!-- AI -->
	<img src="https://img.shields.io/badge/AI-OpenRouter-purple" alt="OpenRouter" />
	<img src="https://img.shields.io/badge/Model-deepseek_r1-orange" alt="deepseek_r1" />
	<!-- Deployment -->
	<img src="https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel" alt="Vercel" />
	<img src="https://img.shields.io/badge/Backend-Render-blue?logo=render" alt="Render" />
	<!-- Hackathon -->
	<img src="https://img.shields.io/badge/QIE_Hackathon-2025-orange" alt="QIE Hackathon 2025" />
</p>


> Client-side encrypted digital vault that anchors heir permissions on the QIE Mainnet (chainId `1990`), streams encrypted blobs through Supabase + Web3.Storage, and unlocks stories for heirs only after validators confirm the legacy.

## Table of Contents
- [Why EternaVault](#why-eternavault)
- [Core Differentiators](#core-differentiators)
- [Architecture](#architecture)
- [Feature Tour](#feature-tour)
- [Tech Stack](#tech-stack)
- [Repository Layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Run the Stack](#run-the-stack)
- [Testing Matrix](#testing-matrix)
- [Smart Contracts](#smart-contracts)
- [Backend API](#backend-api)
- [Product Flows](#product-flows)
- [Demo Script (Hackathon Ready)](#demo-script-hackathon-ready)
- [Roadmap](#roadmap)
- [Troubleshooting](#troubleshooting)

## Why EternaVault
| Problem | Our Answer |
| --- | --- |
| Families lack a tamper-evident way to share high-value secrets and memories with heirs. | AES-GCM encrypts every file inside the browser; the backend never sees plaintext. |
| Executors need an auditable switch to unlock data only after owner death. | `LegacyVault.sol` tracks heirs, validators, timestamps, and death attestations on QIE Mainnet. |
| Digital estates contain multimedia + explanations, not just hashes. | Supabase stores encrypted blobs & metadata, Web3.Storage/IPFS keeps redundant immutable copies, and OpenRouter AI crafts empathetic recaps. |

## Core Differentiators
- **Client-first security** – AES-GCM in the browser with derived keys (PBKDF2 100k iterations) before uploads.
- **On-chain governance** – QIE Mainnet contract registers heirs, validators, and anchors encrypted CID pointers.
- **Supabase data plane** – Storage buckets for blobs, Postgres tables (`vault_files`, `vault_statuses`, etc.) for metadata & death proofs.
- **AI legacy notes** – Optional OpenRouter-powered summaries give heirs narratives without touching raw files.
- **Multi-role UX** – Owners upload, heirs unlock, validators attest, and tokenization teams link QIEDEX assets.

## Architecture
```
┌────────────┐     AES-GCM      ┌────────────────────┐
│ React/Vite │ ───────────────▶ │ Node/Express API   │
│ (owner/heir│                  │ (/backend/src)     │
└─────┬──────┘                  └─────────┬──────────┘
			│ folders/flows                      │
			│ Web3.Storage (optional IPFS)       │
			▼                                    ▼
┌───────────────┐      metadata      ┌──────────────────────┐
│ Supabase Blob │ ◀────────────────▶ │ Supabase Postgres    │
│ Bucket        │                    │ (files/dids/status)  │
└───────────────┘                    └─────────┬────────────┘
																							 │ ethers v6
																							 ▼
																			┌────────────────────┐
																			│ LegacyVault.sol    │
																			│ (QIE Mainnet 1990)│
																			└────────────────────┘
```

- **Data residency** – Encrypted files live in Supabase storage; optional IPFS CID anchoring via `/api/anchor-cid` writes `setFileCid` on-chain.
- **Death switch** – `/api/notify-death` calls `markDeceased` so heirs pass `canAccess` instantly.
- **AI helper** – `/api/generate-story` funnels curated metadata into OpenRouter (default `deepseek/deepseek-r1:free`).

## Feature Tour
- **Landing** – QIE-branded hero with wallet stub and quick navigation.
- **Memory Uploads** – AES-GCM encryption, Web3.Storage CID fallback, Supabase persistence.
- **Vault Timeline** – Grouped history, manual “Anchor on QIE” CTA that records `txHash` links to https://mainnet.qie.digital.
- **Heir Dashboard** – Register heirs, poll contract `canAccess`, decrypt in-browser, and request AI memorial summaries.
- **Validator Console** – Connect wallet (ethers v5/v6 compatible) and register validator addresses on-chain.
- **Digital Legacy Token** – Associate QIEDEX token addresses + market links with a DID for future monetization models.

## Tech Stack
- **Frontend** – React 18, Vite 5, Tailwind classes, Vitest for crypto utilities.
- **Backend** – Node 18+, Express 4, Multer, Supabase JS v2, ethers v6, OpenRouter fetch, Jest-style Supertest.
- **Web3** – Hardhat 2.22, LegacyVault contract (Solidity 0.8.18), QIE Mainnet RPC URL + explorer.
- **Storage & DB** – Supabase Storage bucket (`encrypted-files` default) + Postgres tables for files, DIDs, death status, and tokenization metadata.
- **AI** – OpenRouter API key + pluggable model name via `OPENROUTER_MODEL`.

## Repository Layout
```
├── backend/              # Express API, Supabase data layer, tests
│   ├── src/
│   │   ├── routes/       # files, validators, profile endpoints
│   │   ├── lib/          # dataStore (Supabase), storage helpers
│   │   ├── abi/          # LegacyVault ABI consumed by backend
│   │   └── index.js      # server bootstrap + core routes
│   ├── storage/          # local encrypted files + tmp uploads
│   └── test/upload.test.js
├── frontend/             # React/Vite SPA with pages + utils
│   ├── src/pages         # Landing, Upload, Heir, Validator, Timeline, Tokenization
│   ├── src/utils         # crypto.js, storage.js, web3.js
│   └── test/crypto.test.js
├── contracts/            # LegacyVault.sol + Hardhat config + tests
├── scripts/              # setup.sh / setup.ps1 bootstrap installers
└── README.md
```

## Prerequisites
- Node.js 18+ (needed for workspaces + native fetch in backend).
- npm 9+ (workspace-aware scripts).
- Supabase project (Storage bucket + Postgres tables) or compatible environment.
- QIE Mainnet RPC endpoint + funded deployer key for contract interactions.
- Optional: Web3.Storage API token & OpenRouter API key for bonus flows.

## Setup
### 1. Clone & install once
```bash
git clone https://github.com/<your-org>/EternaVault-Mainnet.git
cd EternaVault-Mainnet
npm install        # installs root + workspaces via npm workspaces
```

### 2. One-command bootstrap (recommended for demos)
- macOS/Linux: `npm run setup`
- Windows (PowerShell): `npm run setup:ps1`

The script installs workspace deps (frontend/backend/contracts), compiles the Solidity project, and builds the Vite frontend to confirm everything links.

### 3. Manual workspace installs (if you prefer)
```bash
cd frontend && npm install && cd -
cd backend && npm install && cd -
cd contracts && npm install && cd -
```

## Environment Variables
Create a `.env` file at the repo root (Hardhat + backend both read it). Reference table:

| Variable | Required? | Description |
| --- | --- | --- |
| `QIE_RPC_URL` | ✅ | QIE Mainnet RPC endpoint (e.g., https://rpc.qie.digital). |
| `QIE_CHAIN_ID` | ⛭ | Defaults to `1990` if omitted. |
| `PRIVATE_KEY` | ✅ (backend + contracts) | Hex private key that can call `LegacyVault`. Keep it off Git. |
| `VAULT_ADDRESS` | ✅ | Deployed `LegacyVault` contract address on QIE. |
| `BACKEND_PORT` | ⛭ | Defaults to `4000`. |
| `SUPABASE_URL` | ✅ | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ (preferred) | Service key for Postgres + Storage writes. |
| `SUPABASE_ANON_KEY` | ⛭ | Fallback when service key unavailable. |
| `SUPABASE_TABLE_FILES` | ⛭ | Defaults to `vault_files`. |
| `SUPABASE_TABLE_DIDS` | ⛭ | Defaults to `vault_dids`. |
| `SUPABASE_TABLE_STATUSES` | ⛭ | Defaults to `vault_statuses`. |
| `SUPABASE_TABLE_PROFILES` | ⛭ | Defaults to `vault_profiles`. |
| `SUPABASE_BUCKET` | ✅ | Storage bucket for encrypted files (default `encrypted-files`). |
| `OPENROUTER_API_KEY` | ⛭ | Enables `/api/generate-story`. |
| `OPENROUTER_MODEL` | ⛭ | Defaults to `deepseek/deepseek-r1:free`. |
| `OPENROUTER_REFERRER`, `OPENROUTER_TITLE` | ⛭ | Branding metadata for OpenRouter. |
| `VITE_WEB3_STORAGE_KEY` | ⛭ | Enables optional IPFS uploads from the frontend. Store inside `frontend/.env` as `VITE_WEB3_STORAGE_KEY`. |

> Tip: keep backend `.env` at repo root so both Express and Hardhat read the same secrets. Frontend Vite variables live in `frontend/.env.local`.

## Run the Stack
### Dev mode (hot reload everywhere)
```bash
# from repo root
npm run dev
# concurrently starts: backend (port 4000) + frontend (Vite on 5173 with proxy → 4000)
```

### Run pieces individually
```bash
# backend
cd backend && npm run dev

# frontend
cd frontend && npm run dev

# contracts (Hardhat console / tests)
cd contracts && npx hardhat node
```

### Build for production
```bash
cd frontend && npm run build && npm run preview
cd backend && npm run start   # serves API with compiled frontend if you reverse proxy
```

## Testing Matrix
| Layer | Command | What it covers |
| --- | --- | --- |
| Frontend crypto utilities | `cd frontend && npm test` | Vitest + jsdom confirm AES-GCM round trips succeed. |
| Backend API smoke | `cd backend && npm test` | Supertest posts `/api/upload` to ensure metadata persistence path works. |
| Smart contracts | `cd contracts && npx hardhat test` | Registers heirs/validators, unlock timestamps, and `markDeceased` logic. |
| Full suite | `npm run test` (root) | Runs all three layers sequentially. |

## Smart Contracts
- `contracts/contracts/LegacyVault.sol`
	- Owner-only controls for heirs, validators, unlock timestamps, CIDs, and death flag.
	- `canAccess(address)` exposes a single boolean for the backend/frontend heirs to check.
	- Emits `ValidatorRegistered` so `/api/validators` can replay logs and display the validator set.
- Deploy with `cd contracts && npx hardhat run scripts/deploy.js --network qieMainnet` (requires env vars above).
- Update backend `.env` with the resulting contract address to enable on-chain actions.

## Backend API
| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/upload` | Receives encrypted file + metadata, uploads to Supabase, stores record (optionally includes IPFS CID). |
| `GET` | `/api/files?did=...` | Lists encrypted files for a DID. |
| `GET` | `/api/file/:id?as=encrypted` | Streams encrypted blob back to heir for browser decryption. |
| `POST` | `/api/register-did` | Generates demo DIDs and records them.
| `POST` | `/api/register-heir` | Calls `LegacyVault.registerHeirs` for a given wallet. |
| `GET` | `/api/simulate-unlock?heir=...` | Invokes `canAccess` to gate downloads. |
| `POST` | `/api/notify-death` | Persists death status + calls `markDeceased` on-chain if available. |
| `GET` | `/api/death-status?did=...` | Reads current death/activation info from Supabase.
| `POST` | `/api/generate-story` | Builds memorial text via OpenRouter using decrypted snippets metadata. |
| `POST` | `/api/anchor-cid` | Hashes file ID, writes CID on-chain via `setFileCid`, and marks record anchored.
| `GET` | `/api/profile/token` | Fetches tokenization metadata for a DID. |
| `POST` | `/api/profile/token` | Saves QIE token address + liquidity link. |
| `GET` | `/api/validators` | Lists validator addresses (event replay). |
| `POST` | `/api/validators` | Registers validator on-chain using backend wallet. |

All routes live under `backend/src`, so it is easy to extend with additional guardianship logic.

## Product Flows
- **Owner** – Visit `/upload`, encrypt files locally, optionally pin to IPFS, push metadata to Supabase, then “Anchor on QIE” later from Timeline.
- **Heir** – Provide wallet + vault key in `/heir`, wait for validator/death attestation, then decrypt & optionally request AI-written narrative.
- **Validator** – Connect wallet in `/validator` and trigger `/api/validators` to call `registerValidator` (and appear in history if explorer is queried).
- **Tokenization Lead** – Use `/tokenization` to document QIEDEX token + market links so heirs know how to trade or move the estate.

## Demo Script (Hackathon Ready)
1. **Elevator pitch (30s)** – “Encrypted legacy vault anchored on QIE Mainnet enabling conditional unlocks + AI memories.”
2. **Upload flow** – Show AES-GCM encryption log + Web3.Storage CID + `/api/upload` success.
3. **Timeline** – Display grouped entries, click “Anchor on QIE”, copy explorer link.
4. **Heir unlock** – Enter heir wallet, register on-chain, trigger `markDeceased`, refresh to see files appear, decrypt one memory.
5. **AI summary** – After decrypting, hit “Generate AI story” to demonstrate OpenRouter integration.
6. **Validator dashboard** – Connect wallet + register validator to highlight community governance.
7. **Tokenization** – Paste sample token + market link to show future monetization path.

## Roadmap
- Threshold encryption / multi-party key shares instead of single passphrase.
- Real validator smart contract flow (multi-sig or zk proof) before `markDeceased` can succeed.
- Automated Supabase migrations + Prisma schema.
- Mobile-optimized PWA shell with push notifications for heirs/validators.
- Native upload worker that chunks gigabyte files and streams them into Supabase buckets.

## Troubleshooting
- **`Supabase is not configured` error** – Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` exist before starting backend.
- **`Missing RPC/PRIVATE_KEY/VAULT_ADDRESS` responses** – Contract routes require all three env vars and a compiled ABI under `backend/src/abi/LegacyVault.json`.
- **Web3.Storage 503s** – Frontend already shows a friendly warning; retry later or skip CID upload (backend storage still succeeds).
- **Heir decrypt fails** – Confirm the master passphrase matches the one used at upload time; AES-GCM is unforgiving.
- **Hardhat compile/test fails** – Delete `contracts/cache` and rerun `npx hardhat clean && npx hardhat test`.

---

