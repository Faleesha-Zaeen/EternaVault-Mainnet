# EternaVault – Where Identity Meets Eternity

EternaVault is a digital legacy vault designed for the QIE Blockchain Hackathon. Users can upload and client-side-encrypt important memories, which are stored off-chain while being anchored on the QIE Testnet via smart contracts. After a death notification or unlock time, designated heirs can access encrypted assets. The project explores how self-sovereign identity, encryption, and smart contracts can work together for long-term digital inheritance.

This repository is a monorepo containing the frontend (Vite + React + Tailwind), backend (Node.js + Express + lowdb), and smart contracts (Hardhat + Solidity) for the EternaVault prototype.

## How to run locally

```bash
cp .env.example .env
# Edit .env and fill values (QIE testnet only)
# QIE_RPC_URL, QIE_CHAIN_ID, PRIVATE_KEY, FRONTEND_PORT

npm install
npm run setup
npm run dev
# Frontend will be available at http://localhost:5173 (or FRONTEND_PORT)
```

## Ethics & Legal

This project is an experimental prototype built for a hackathon. It is **not** legal advice and does not constitute a production-ready inheritance solution. Real-world use of digital legacy or inheritance products must comply with local laws, data protection regulations, and involve qualified legal professionals.

## QIE Integration (Phase 1)

- The `LegacyVault.sol` contract is deployable to QIE Testnet via Hardhat.
- The backend includes a QIE configuration helper ready to connect to the testnet, but contract calls are intentionally minimal in this phase.
- Future phases can wire death notifications and unlock logic on-chain and anchor off-chain file references (e.g., IPFS/Web3Storage CIDs) to the QIE network.

## Validator Integration – QIE Bonus

This phase adds a simple validator registration flow to qualify for QIE validator bonus points.

- Smart contract: `registerValidator(address)` on `LegacyVault` marks an address as a validator and emits a `ValidatorRegistered` event.
- Backend endpoints: `GET /api/validators` (lists validators, reads events when a `VAULT_ADDRESS` is configured) and `POST /api/validators` (calls `registerValidator` using the backend signer and `VAULT_ADDRESS`).
- Frontend: `/validator` dashboard where a connected wallet address can register itself as a validator and view active validators.

See https://docs.qie.digital/how-to-become-a-validator-on-qie-v3 for QIE validator docs and operational details. In production, validators would be part of a permissioned process with staking and governance; this demo is intentionally simplified for the hackathon.

## Decentralized Storage & On-Chain Anchoring

- Files are encrypted client-side using AES-GCM in the browser before being uploaded.
- Encrypted blobs are optionally uploaded to IPFS via Web3.Storage, which returns a CID (Content Identifier).
- The frontend includes the CID when creating the backend record; the backend stores the CID in its lowdb file entry.
- Users can optionally "Anchor on QIE" which stores a mapping (fileId → CID) on the `LegacyVault` smart contract.

Environment variables
- `WEB3_STORAGE_KEY` — API token for Web3.Storage used by backend (optional)
- `VITE_WEB3_STORAGE_KEY` — API token injected into the frontend for direct uploads to Web3.Storage (optional)

Quick checklist

- [ ] Sign up for web3.storage and get an API token
- [ ] Fill `WEB3_STORAGE_KEY` and `VITE_WEB3_STORAGE_KEY` in `.env` files
- [ ] `npm install` in `/frontend` and `/backend`
- [ ] `npm run dev`
- [ ] Upload a file, see CID in the upload success message, click "Anchor on QIE" (when testnet/mainnet is ready)

## Tokenization – QIEDEX Integration

- **What is DLT?** Digital Legacy Tokens (DLT) are on-chain tokens created with QIEDEX Token Creator which can be associated with a user's vault profile. In this prototype a DLT can represent inheritance tiers, access rights, or membership that a vault owner wishes to link to their preserved assets.

- **How it works in this demo:** Token minting and token metadata are created outside of EternaVault using the QIEDEX Token Creator. The user can paste their token's address into the Tokenization page in the app to link that token to their DID/profile.

- **Where to add the token:** Navigate to the `Tokenization (DLT)` page in the app and paste the token address (and an optional market/liquidity link). This will persist the token address to the local `lowdb` backend for demonstration purposes.

### Demo Flow for Judges

1. Upload an encrypted memory via the Upload page.
2. A CID is generated (client-side upload to Web3.Storage) and recorded in the backend entry.
3. Anchor the CID on QIE using the "Anchor on QIE" button in the Timeline (requires RPC/contract configured).
4. Use the Validator UI to simulate validator actions and registration where applicable.
5. Open the `Tokenization (DLT)` page and paste a QIEDEX token address to associate with the demo DID (`demo-owner`).

### Judging Criteria Mapping

- **Security & Privacy:** Files are encrypted client-side before upload; server stores encrypted blobs and optional CID only.
- **On-Chain Anchoring:** Anchoring stores a mapping (fileId → CID) on the `LegacyVault` contract; judges can verify anchor transactions when the testnet RPC and contract are configured.
- **Extensibility / UX:** The Tokenization page demonstrates how tokens can be linked to a user's profile for future access-control or inheritance semantics.

### Notes & Future Work

- The current Tokenization page stores token metadata in `lowdb` for demonstration. A future iteration would verify token existence and metadata on-chain via QIEDEX APIs and optionally map token-gated access to vault contents. TODO comments have been added in the backend route as integration points.

