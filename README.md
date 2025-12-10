# EternaVault – QIE Mainnet Digital Legacy Vault

**TL;DR**
- Client-side encrypted inheritance vault anchored on QIE Mainnet (chainId 1990).
- Owners encrypt memories locally with AES-GCM and store ciphertext in Supabase, optionally pinning to Web3.Storage/IPFS.
- `LegacyVault.sol` governs heirs, validators, and CID proofs so unlocks stay publicly auditable.
- Heirs decrypt entirely in-browser once validators confirm death status, then can request AI-written memorial summaries.

## Overview
EternaVault is a digital legacy vault where every file, memory, and instruction is encrypted before leaving the browser. Supabase stores only ciphertext, Web3.Storage can hold redundant CIDs, and the `LegacyVault.sol` contract on QIE Mainnet proves who can access what after the owner’s death. Validators attest to death events, heirs unlock data client-side, and optional AI summaries help craft compassionate narratives without touching plaintext.

## Why EternaVault
| Problem | Our Answer |
| --- | --- |
| Families lack an auditable way to share high-value secrets with heirs. | AES-GCM encryption + PBKDF2 key derivation happens in-browser; the backend never sees plaintext. |
| Executors need provable death switches. | `LegacyVault.sol` tracks heirs, validators, timestamps, and `markDeceased` attestations on QIE Mainnet. |
| Memories include context, not just hashes. | Supabase stores encrypted blobs + metadata, Web3.Storage/IPFS keeps immutable CIDs, and AI summaries provide narrative context once heirs decrypt. |

## Core Features
- **Client-side security**: AES-GCM 256 + PBKDF2 (100k iterations) keys per upload; IVs and salt stored with ciphertext.
- **On-chain governance**: `registerHeirs`, `registerValidators`, `setFileCid`, and `canAccess` enforce transparent unlock logic.
- **Supabase data plane**: Storage buckets hold encrypted blobs, Postgres tables (`vault_files`, `vault_statuses`, `vault_dids`) capture metadata and death proofs.
- **Optional Web3.Storage anchoring**: `/api/anchor-cid` writes CID proofs on-chain for redundancy.
- **Heir + validator dashboards**: React/Vite frontend lets heirs verify eligibility, download blobs, and trigger AI memorial summaries via OpenRouter.

## Architecture Diagram
```
┌────────────┐    AES-GCM     ┌──────────────┐      RPC tx      ┌──────────────────┐
│ React/Vite │ ─────────────▶ │ Express API  │ ───────────────▶ │ LegacyVault.sol  │
│ (owner/heir│                │ (Node 18)    │                  │ QIE Mainnet 1990 │
└─────┬──────┘                └─────┬────────┘                  └────────┬─────────┘
      │ encrypted blob              │ metadata + status rows             │
      ▼                             ▼                                    ▼
┌─────────────┐   CID optional   ┌──────────────┐   death proofs     ┌─────────────┐
│ Web3.Storage│ ◀──────────────▶ │ Supabase     │ ◀────────────────▶ │ Heir UI     │
└─────────────┘                  │ Storage/DB   │                    └─────────────┘
```
Owner actions start inside the SPA, the backend only brokers ciphertext + metadata, and every authorization is double-checked on-chain. Full technical notes live in [`docs/architecture.md`](docs/architecture.md).

## Tech Stack
- **Frontend**: React 18, Vite 5, Tailwind CSS, Vitest.
- **Backend**: Node.js 18, Express 4, Multer, Supabase JS, ethers v6.
- **Smart Contracts**: Solidity 0.8.18, Hardhat 2.x, QIE Mainnet (chainId 1990).
- **Data & Storage**: Supabase Storage + Postgres, optional Web3.Storage/IPFS.
- **AI**: OpenRouter (default `deepseek/deepseek-r1:free`).

## Setup & Installation
```bash
git clone https://github.com/Faleesha-Zaeen/EternaVault-Mainnet.git
cd EternaVault-Mainnet
npm install              # installs root + workspaces
npm run dev              # starts backend (4000) + frontend (5173)
```
Detailed environment prep, deployment scripts, and testing notes → [`docs/setup.md`](docs/setup.md) and [`docs/testing.md`](docs/testing.md).

## Environment Variables
| Variable | Description |
| --- | --- |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | Supabase project credentials for storage + Postgres access. |
| `SUPABASE_SERVICE_KEY` | Service role used by the backend for privileged inserts. |
| `SUPABASE_TABLE_FILES` | Defaults to `vault_files`; tracks encrypted uploads. |
| `SUPABASE_TABLE_STATUSES` | Stores death notifications and validator attestations. |
| `SUPABASE_TABLE_DIDS` | Optional DID registry for linking heirs to external identities. |
| `OPENROUTER_API_KEY` | Credentials for AI memorial summaries. |
| `WEB3_STORAGE_TOKEN` | Optional token for pushing encrypted blobs to Web3.Storage. |
| `RPC_URL` / `CHAIN_ID` | QIE Mainnet endpoint (`1990`) for Hardhat + backend calls. |

## Project Structure
```
├── backend/
│   ├── src/
│   │   ├── routes/ (files, profile, validators)
│   │   ├── lib/ (encryption helpers, Supabase client)
│   │   └── config/
│   └── storage/ (encrypted sample blobs)
├── contracts/
│   ├── LegacyVault.sol
│   ├── scripts/deploy.js
│   └── test/LegacyVault.js
├── docs/ (architecture, flows, api, setup, testing, troubleshooting)
├── frontend/
│   ├── src/App.jsx + pages (Landing, Upload, Timeline, Validators, Heirs)
│   └── utils/crypto.js (AES-GCM + PBKDF2)
└── scripts/ (setup automation)
```

## Roadmap
- Multi-validator quorum logic (threshold signatures on `markDeceased`).
- Gas-optimized CID anchoring + batch updates.
- Mobile-ready heir experience with biometric key release.
- Automated audit hooks that post unlock events to Supabase Edge Functions.

## License
Distributed under the [MIT License](LICENSE) © 2025 TeamFlare.
