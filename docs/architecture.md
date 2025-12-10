# System Architecture

## Overview
EternaVault is a three-tier system built around a zero-knowledge storage model:
- **Client tier (React/Vite)** performs all AES-GCM encryption and interacts with wallets.
- **Service tier (Node/Express)** orchestrates Supabase persistence, optional Web3.Storage pinning, and QIE Mainnet contract calls via `ethers` v6.
- **Data/settlement tier** combines Supabase Storage + Postgres with the QIE Mainnet `LegacyVault` contract to guarantee auditability after death.

## High-Level Diagram
```
+-----------------+      AES-GCM       +-------------------+       signed tx        +------------------------+
| React Frontend  |  encrypts + forms | Express API Layer |  ------------------>  | QIE Mainnet LegacyVault|
| - Upload page   |------------------>| - /api/upload     |                       | - Heir registry        |
| - Heir console  |                   | - /api/validators |                       | - markDeceased         |
+---------+-------+                   +-----+-------------+                       +-----------+------------+
          |                                 |                                              ^
          | IPFS optional CID               | Supabase RPC+Storage                         |
          v                                 v                                              |
+-----------------+      metadata       +-------------------+                             |
| Web3.Storage    |<------------------->| Supabase Postgres |<----------------------------+
| (IPFS pinning)  |   (cid, status)     | vault_files/dids  |  anchors CID tx hash back
+-----------------+                     +-------------------+
```

## Client-Side AES-GCM Encryption
1. The uploader provides a **vault key**; the browser derives a 256-bit key via PBKDF2 (100k iterations) with random salt.
2. Each file is encrypted with AES-GCM using a fresh IV; only ciphertext + metadata (IV, salt, MIME type) leave the device.
3. The backend never receives the cleartext or the derived key, so even database compromise cannot expose memories.
4. During download, heirs provide the identical passphrase; the browser reconstructs the key and decrypts the blob entirely client-side.

## Data Flow
| Step | Action |
| --- | --- |
| 1 | React encrypts the file, optionally uploads the encrypted blob to Web3.Storage and retrieves a CID. |
| 2 | The encrypted blob is POSTed to `/api/upload` with metadata (owner DID, title, cryptoMeta). |
| 3 | Express stores the file in Supabase Storage (`encrypted-files`) and writes metadata/CID into `vault_files`. |
| 4 | Owners can later call `/api/anchor-cid` which takes the Supabase record, hashes the file ID, and submits `setFileCid` to LegacyVault for on-chain immutability. |
| 5 | Heirs query `/api/simulate-unlock` which invokes `LegacyVault.canAccess` before exposing record metadata. |
| 6 | Once authorized, heirs download `/api/file/:id?as=encrypted`, decrypt locally, and may request `/api/generate-story` for AI summaries. |

## Roles
- **Owner**: uploads encrypted artifacts, registers heirs via `/api/register-heir`, decides when to anchor CIDs, and can mark death status manually or via validator attestation.
- **Heir**: supplies wallet + vault key, waits for on-chain approval, then decrypts files and optionally generates AI narratives.
- **Validator**: community or family notary that registers through `/api/validators`/`registerValidator` and can help attest to death events (future work extends validator voting, current build logs registrations).

## Death Switch & CID Anchoring
- The backend exposes `/api/notify-death`, which sets Supabase `vault_statuses` and calls `LegacyVault.markDeceased`. Once mined, `canAccess` returns `true` for previously registered heirs.
- Owners may also set a **time-based unlock** by calling `setUnlockTimestamp` via Hardhat console (not wired into UI yet but contract-ready).
- CID anchoring uses `keccak256(fileId)` as the storage key to avoid leaking plaintext IDs. The transaction hash is persisted back into Supabase for explorer display, and Timeline UI links to https://mainnet.qie.digital/tx/<hash>.
- Because anchoring uses the same owner-controlled signer as `registerHeirs`, no centralized infrastructure can override or delete historical references after they are on-chain.
