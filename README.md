# EternaVault · QIE Digital Legacy Vault

**EternaVault is a decentralized digital inheritance system where encrypted memories unlock only after on-chain confirmation of death.**

Today, digital assets outlive their owners—but access is chaotic, insecure, or lost entirely. EternaVault introduces programmable inheritance: encrypted memories that unlock only when QIE validators confirm it is time, blending trustless contracts with human empathy.

EternaVault is a hackathon-ready prototype that mixes client-side encryption, self-sovereign identity concepts, and QIE smart contracts so people can preserve their most important files and grant heirs access only when the right on-chain signals fire. The monorepo contains:

> 🚀 **Demo URL:** coming soon (run locally via `npm run dev` for now)

- `frontend/` – Vite + React + Tailwind UI for uploads, timelines, validators, tokenization, heirs, and AI storytelling
- `backend/` – Express + lowdb API that manages encrypted blobs, contract calls, Gemini prompts, and DID/profile data
- `contracts/` – Hardhat workspace containing the `LegacyVault.sol` contract deployed to the QIE Mainnet

> ⚖️ **Prototype Only** – This is NOT a production inheritance system nor legal advice. Always involve real legal counsel and compliance experts before building on these ideas.

---

## Quick Facts

- **Goal:** Preserve encrypted memories, anchor them to the QIE Mainnet, and grant heirs access once validators or death events confirm eligibility.
- **Core differentiator:** Client-side encryption + on-chain governance + optional AI narrative of a person’s life.
- **Primary contract:** `LegacyVault.sol` (register heirs/validators, mark deceased, map fileId → CID).
- **Latest highlight:** Gemini-powered “AI Legacy Story” generator with placeholder PDF export path.
- **Status:** Hackathon MVP (alpha). Not audited.

---

## Why This Matters

- Most decentralized storage tools encrypt files, but **the moment of access is never programmable**—EternaVault ties unlock rights to verifiable death events.
- **Death-based governance** combines validator attestations with smart contracts so heirs gain access only when QIE confirms it.
- **AI storytelling** turns cryptographic blobs into human narratives, preserving emotion alongside encrypted data.
- Families retain sovereignty: encrypted data stays client-side, while anchors and policies live on-chain for resilience.

---

## UI Preview

| Upload | Heir Dashboard |
| ------ | -------------- |
| ![Upload Screen Preview](assets/upload.png) | ![Heir Dashboard Preview](assets/heir-dashboard.png) |

_(Add screenshots/GIFs above to give judges instant visual context.)_

---

## Table of Contents

1. [Quick Facts](#quick-facts)
2. [Why This Matters](#why-this-matters)
3. [UI Preview](#ui-preview)
4. [Feature Highlights](#feature-highlights)
5. [Architecture](#architecture)
6. [Prerequisites](#prerequisites)
7. [Environment Variables](#environment-variables)
8. [Quick Start](#quick-start)
9. [Common Workflows](#common-workflows)
10. [API Surface](#api-surface)
11. [Smart Contract Overview](#smart-contract-overview)
12. [Demo Script for Judges](#demo-script-for-judges)
13. [Troubleshooting (Quick)](#troubleshooting-quick)
14. [Directory Layout](#directory-layout)
15. [Data Flow](#data-flow)
16. [Security & Privacy](#security--privacy)
17. [Roadmap & Ideas](#roadmap--ideas)
18. [FAQ (Short)](#faq-short)
19. [Credits & License](#credits--license)

---

## Feature Highlights

- **Client-side encrypted memories** – Files are sealed with AES-GCM in the browser before upload so the backend never sees plaintext.
- **Off-chain storage + QIE anchoring** – Encrypted blobs live in `backend/storage` or Web3.Storage/IPFS, while their CIDs can be anchored to `LegacyVault` (fileId → CID mapping).
- **Heir & validator flows** – The Heir Dashboard checks `canAccess`, marks legacies as deceased, registers heirs on-chain, and downloads/decrypts files. The Validator view lets wallets call `registerValidator`.
- **Tokenization (DLT) page** – Owners can link a QIEDEX-created Digital Legacy Token to their DID/profile to illustrate future token-gated inheritance tiers.
- **AI Legacy Storytelling** – With a valid `GEMINI_API_KEY`, heirs convert metadata about preserved files into a sentimental multi-paragraph story powered by the Gemini `generateContent` API.
- **Low-lift persistence** – lowdb keeps files, profile, DID, and status records in JSON for reproducible demos.

---

## Architecture

| Layer        | Key Tech                          | Responsibilities |
|--------------|-----------------------------------|------------------|
| Frontend     | Vite, React, Tailwind             | Upload encryption, timeline, validator UI, heir dashboard, AI story modal, tokenization page |
| Backend      | Express, lowdb, ethers v6, node-fetch | File metadata API, Web3.Storage fallback, QIE contract helper, death-status tracker, Gemini proxy |
| Smart Contract | Solidity (`LegacyVault.sol`), Hardhat | Register validators/heirs, mark deceased, set CIDs, expose `canAccess` | 

Supporting pieces:
- `scripts/setup.(sh|ps1)` install workspace deps for Windows/macOS/Linux.
- Nodemon dev server auto-reloads backend on source changes.
- `frontend/src/utils/crypto.js` handles client-side AES-GCM.

---

## Prerequisites

- Node.js 18+
- npm 9+
- (Optional) Web3.Storage account for real IPFS uploads
- (Optional) Google Gemini API key for AI storytelling
- (Optional) QIE Mainnet wallet with QIEV3 for on-chain calls

---

## Environment Variables

Create `.env` in the repo root (or copy from `.env.example`) and fill the values you have available:

| Variable | Description |
|----------|-------------|
| `QIE_RPC_URL` | QIE Mainnet RPC endpoint (e.g., `https://rpc1mainnet.qie.digital/`) |
| `QIE_CHAIN_ID` | Chain ID for the selected QIE network (use `1990` for QIEMainnet) |
| `PRIVATE_KEY` | Backend signer for contract calls (never commit real keys) |
| `VAULT_ADDRESS` | Deployed `LegacyVault` contract address |
| `FRONTEND_PORT` | Port for Vite dev server (defaults to `5173`) |
| `WEB3_STORAGE_KEY` | Backend token for Web3.Storage (optional) |
| `VITE_WEB3_STORAGE_KEY` | Frontend token for direct uploads (optional) |
| `VITE_QIE_RPC_URL` | Frontend RPC endpoint (e.g., `https://rpc1mainnet.qie.digital/`) |
| `VITE_VAULT_ADDRESS` | Frontend contract address reference for QIEMainnet |
| `STORAGE_PROVIDER` | `NFT_STORAGE`/`WEB3_STORAGE`/`LOCAL` hint for future providers |
| `GEMINI_API_KEY` | Google Generative Language key used by `/api/generate-story` |

The frontend also respects `frontend/.env.local` for Vite-specific overrides.

---

## Quick Start

```bash
git clone https://github.com/Faleesha-Zaeen/EternaVault.git
cd EternaVault

cp .env.example .env           # then edit with your values
npm install                    # installs root + workspaces via npm workspaces

# Option 1: one command for both servers
npm run dev                    # concurrently starts backend + frontend

# Option 2: run separately
cd backend && npm run dev      # http://localhost:4000
cd frontend && npm run dev     # http://localhost:5173

# Contracts
cd contracts && npx hardhat compile
```

> Windows users can also run `npm run setup:ps1` to execute `scripts/setup.ps1` if WSL/bash isn’t configured.

Useful scripts from `package.json`:

| Script | What it does |
|--------|--------------|
| `npm run dev` | Runs backend (`npm run server`) + frontend (`npm run client`) concurrently |
| `npm run build` | Builds the frontend for production |
| `npm run test:*` | Placeholder commands for frontend/backend/contract tests |

---

## Common Workflows

1. **Upload & encrypt a memory** – Navigate to *Upload*, drop a file, enter metadata + passphrase. The file is encrypted locally before hitting the backend.
2. **Check timeline & anchor** – Visit *Timeline* to see version history, copy the CID, and anchor it on-chain if the backend signer + contract are configured.
3. **Register validators** – Open */validator*, connect an address, and register via the backend calling `registerValidator`.
4. **Activate legacy & unlock** – On *Heir Dashboard*, mark the owner as deceased (backend calls `markDeceased`), register a heir on-chain, and run *Check Unlock Status* to see files become available for download/decrypt.
5. **Generate AI legacy story** – After files exist, click **🧠 Generate AI Legacy Story**. The backend summarizes metadata, prompts Gemini, and renders a sentimental narrative with an export-ready block.
6. **Link a DLT token** – Use *Tokenization (DLT)* to associate a QIEDEX token address + liquidity link with the demo DID (`did:eternavault:...`).

---

## API Surface

| Method & Path | Purpose |
|---------------|---------|
| `POST /api/upload` | Accepts an encrypted file + metadata and stores it locally/IPFS |
| `GET /api/files?did=` | Lists files for a DID |
| `GET /api/file/:id?as=encrypted` | Streams the encrypted blob for browser decryption |
| `POST /api/register-did` | Generates a demo DID for front-end testing |
| `POST /api/notify-death` | Marks a DID as deceased and tries `markDeceased()` on-chain |
| `GET /api/death-status` | Returns local + on-chain death status for a DID |
| `GET /api/simulate-unlock?heir=` | Calls `canAccess()` for a wallet and filters downloadable files |
| `POST /api/register-heir` | Wraps `registerHeirs([address])` so UI can enroll heirs |
| `POST /api/generate-story` | Summarizes metadata and calls Gemini `generateContent` to build a narrative |
| `GET/POST /api/validators` | List/register validators using the `LegacyVault` contract |
| `GET/POST /api/profile/*` | Tokenization + profile helpers (lowdb persistence) |

Routers live in `backend/src/routes/*.js`, while the rest of the endpoints reside directly in `backend/src/index.js`.

---

## Smart Contract Overview

`contracts/LegacyVault.sol` exposes the following key functions (ABI mirrored in `backend/src/abi/LegacyVault.json`):

- `registerHeirs(address[] _heirs)` – whitelist heirs
- `registerValidator(address validator)` – emit validator registration event
- `markDeceased()` – flag owner as deceased so heirs can unlock
- `setFileCid(bytes32 fileId, string cid)` – anchor encrypted asset references
- `setUnlockTimestamp(uint256 ts)` – optional time-lock controls
- `canAccess(address user)` – read-only unlock check used by the backend

Compile via `npx hardhat compile` and deploy to QIE Mainnet to obtain the `VAULT_ADDRESS` consumed by the backend helper.

---

## Demo Script for Judges

1. **Login / DID** – Hit *Register DID* or reuse `demo-owner`.
2. **Encrypt & upload** – Show client-side encryption toast, note that the backend only stores ciphertext + metadata.
3. **Anchor on QIE** – Click *Anchor* in Timeline, show transaction hash and explorer link.
4. **Validator action** – Register a validator and highlight emitted `ValidatorRegistered` event.
5. **Heirs** – Mark legacy as activated, register a heir, run unlock simulation, download + decrypt the file, and show anchor tx link.
6. **AI Story** – Generate the Gemini narrative and mention potential PDF export.
7. **Tokenization** – Paste a token address on the Tokenization page to demonstrate tying DLTs to identities.

This path touches encryption, anchoring, contract writes, validator bonus criteria, heir UX, and AI storytelling.

---

## Troubleshooting (Quick)

- Recompile ABI (`npx hardhat compile`) if the contract changes.
- Gemini errors? Double-check `GEMINI_API_KEY` and API enablement.
- Ports busy? Stop stray `node`/`npm` processes and rerun `npm run dev`.

---

## Directory Layout

```
EternaVault/
├── frontend/                 # Vite + React app (Upload, Timeline, Validators, Heir Dashboard, Tokenization)
│   ├── src/pages/            # Page-level views incl. AI story button (`HeirDashboard.jsx`)
│   ├── src/utils/crypto.js   # AES-GCM encrypt/decrypt helpers
│   └── vite.config.js        # Vite + Tailwind pipeline
├── backend/                  # Express API + lowdb persistence
│   ├── src/index.js          # Primary server, QIE contract helper, AI story route
│   ├── src/abi/LegacyVault.json
│   ├── src/routes/           # Modular routers (files, validators, profile)
│   └── storage/              # Encrypted blobs (.enc)
├── contracts/                # Hardhat workspace + LegacyVault.sol
│   ├── contracts/LegacyVault.sol
│   ├── hardhat.config.js
│   └── artifacts/…
├── scripts/                  # Cross-platform setup helpers
├── package.json              # Workspace scripts (dev/build/test)
└── README.md                 # This guide
```

---

## Data Flow

1. **Encrypt & upload** – Browser derives AES key from passphrase → encrypts file → posts ciphertext + metadata to `/api/upload`.
2. **Persist** – Backend stores metadata in lowdb (`db.json`) and the encrypted blob on disk; optionally pushes to Web3.Storage to obtain a CID.
3. **Anchor** – When requested, backend signs a `setFileCid(fileId, cid)` transaction on `LegacyVault`, exposing immutable provenance.
4. **Death/validator signals** – `/api/notify-death` attempts `markDeceased`; `/api/register-heir` wraps `registerHeirs([addr])`; `/api/validators` manages validator registry.
5. **Unlock** – `GET /api/simulate-unlock?heir=…` calls `canAccess` and returns file metadata if contract returns true.
6. **Decrypt** – Heirs fetch encrypted blobs, decrypt locally with the original passphrase, and optionally request an AI-generated story summarizing the collection.

```
[Browser] --AES-GCM--> cipherblob ----> [Backend] ----optional----> [Web3.Storage/IPFS]
	|                                         |
	|----> anchors CIDs / death events ------> |--ethers--> [QIE LegacyVault]
	|<--- canAccess + files ------------------|
```

---

## Security & Privacy

- **Zero-knowledge uploads:** The backend never receives plaintext—only encrypted bytes + metadata necessary for indexing.
- **Signer isolation:** `PRIVATE_KEY` lives in backend `.env`; never expose in frontend or version control.
- **API guardrails:** Routes validate inputs (e.g., `register-heir` expects `heir`), and errors surface without crashing the process.
- **Audit checklist:** Key modules feature TODO comments for adding rate-limits, per-user auth, rotating storage secrets, and contract audits.
- **Compliance reminder:** Digital inheritance is jurisdiction-sensitive. Treat this as inspiration, not legal tooling.

---

## Roadmap & Ideas

1. **Multi-validator quorum governance** – only unlock after N-of-M validator attestations.
2. **Token-gated unlock logic** – require DLT ownership or staking before `canAccess` returns true.
3. **PDF export + mobile heir app** – portable keepsakes and emergency access UX.
- Add automated tests (contracts, backend, UI) once core flows stabilize.

---

## FAQ (Short)

- **Does the backend ever see plaintext?** No—encryption is fully client-side.
- **Does AI read stored files?** No—it only uses filenames, timestamps, and metadata.
- **Can heirs be multiple?** Yes—the contract supports arrays via `registerHeirs`.

---

