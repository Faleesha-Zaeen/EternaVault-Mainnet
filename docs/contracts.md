# Smart Contracts – LegacyVault.sol

## Overview
`LegacyVault.sol` is a minimalist inheritance contract deployed on QIE Mainnet (chainId 1990). It tracks three critical states:
1. **Heirs** allowed to decrypt data when access flips
2. **Validators** that can be expanded for future attestations
3. **Death/unlock state** (timestamp or explicit flag) controlling `canAccess`

The backend (`/api/register-heir`, `/api/notify-death`, `/api/validators`, `/api/anchor-cid`) interacts with this contract via `ethers` v6.

## Role Permissions
| Role | Capabilities |
| --- | --- |
| Owner (contract deployer) | Register heirs, set unlock timestamp, mark deceased, set file CIDs, register validators |
| Heir | Read-only view via `canAccess(address)` |
| Validator | Currently informational (events only); future logic can guard `markDeceased` |

## Function Breakdown
| Function | Visibility | Description |
| --- | --- | --- |
| `constructor()` | `public` | Sets `owner = msg.sender`
| `registerHeirs(address[] calldata _heirs)` | `external onlyOwner` | Mark wallet addresses as heirs (`mapping(address => bool) heirs`)
| `setUnlockTimestamp(uint256 ts)` | `external onlyOwner` | Defines Unix timestamp after which `canAccess` returns true
| `markDeceased()` | `external onlyOwner` | Sets `deceased = true`
| `setFileCid(bytes32 fileId, string calldata cid)` | `external onlyOwner` | Writes CID pointer into `fileCidById`
| `registerValidator(address validator)` | `external onlyOwner` | Adds to `isValidator` map and emits `ValidatorRegistered`
| `canAccess(address user)` | `external view` | Returns true if `heirs[user]` and either `deceased == true` or `block.timestamp >= unlockTimestamp`

## Events
- `event ValidatorRegistered(address validator);`
  - Emitted whenever the owner calls `registerValidator`
  - Backend `/api/validators` replays this event to populate validator lists

## canAccess Usage
- **Backend `/api/simulate-unlock`**: before returning Supabase records, the API calls `contract.canAccess(heirAddress)`.
- **Heir Dashboard**: uses API response (`allowed: boolean`) to conditionally render encrypted file list and prompts for vault key.
- Because `canAccess` has no side effects, it is safe to poll frequently without gas cost (read-only provider call).

## Deployment Instructions
1. Configure `.env` with `QIE_RPC_URL`, `QIE_CHAIN_ID=1990`, and deployer `PRIVATE_KEY`.
2. Compile and deploy using Hardhat:
   ```bash
   cd contracts
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network qieMainnet
   ```
3. Copy the printed `LegacyVault` address into root `.env` as `VAULT_ADDRESS`.
4. Rebuild backend or restart dev server so ABI path `backend/src/abi/LegacyVault.json` matches compiled artifact.
5. (Optional) If using a different network for testing, update `QIE_CHAIN_ID` and RPC endpoints consistently across backend + contracts.
