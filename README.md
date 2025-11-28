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
