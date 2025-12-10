# Troubleshooting

## Supabase Issues
| Symptom | Cause | Fix |
| --- | --- | --- |
| `Supabase is not configured` | Missing `SUPABASE_URL` or key at startup | Populate `.env`, restart backend |
| `Failed to upload encrypted file` | Bucket missing or wrong `SUPABASE_BUCKET` | Create bucket (e.g., `encrypted-files`) and update env |
| `PGRST116` errors | Table not found | Run migrations or rename tables to match `SUPABASE_TABLE_*` env values |

## RPC / PRIVATE_KEY Problems
| Symptom | Cause | Fix |
| --- | --- | --- |
| `Missing RPC/PRIVATE_KEY/VAULT_ADDRESS` | Contract routes invoked without env | Set all three vars before hitting `/api/anchor-cid`, `/api/register-heir`, etc. |
| `markDeceased on-chain failed` | RPC outage or insufficient funds | Verify RPC health; ensure deployer wallet has QIE for gas |
| `invalid sender` | PRIVATE_KEY not prefixed with `0x` | Store key as `0x...` string |

## Web3.Storage / IPFS
| Issue | Explanation | Resolution |
| --- | --- | --- |
| 503 or `service unavailable` | Maintenance window | Frontend already warns users; retry later |
| CID missing during anchor | User skipped Web3.Storage step | Reupload or manually pin file to obtain CID before calling `/api/anchor-cid` |

## AES-GCM Decryption Failures
- **Mismatched vault key**: Heirs must use the exact passphrase used during upload; even whitespace differs.
- **Corrupted metadata**: Ensure `meta.cryptoMeta` contains IV/salt arrays; tampering or manual edits break decryption.
- **Binary truncation**: Browser download interrupted; re-fetch `/api/file/:id`.

## Hardhat Compile/Test Errors
| Error | Cause | Fix |
| --- | --- | --- |
| `HH8` missing config | `.env` not found when requiring Hardhat config | Ensure `contracts/hardhat.config.js` can load `../.env`
| `ProviderError: insufficient funds` | Attempting to deploy to net without gas | Fund deployer account |
| `npx hardhat test` fails on timestamp test | Hardhat network not resetting | Run `npx hardhat clean` and rerun tests |

## General Tips
- Always re-run `npm run setup` after pulling new dependencies.
- For Supabase outages, consider switching the service role key to a backup project temporarily.
- Keep `LegacyVault` ABI synchronized: `backend/src/abi/LegacyVault.json` should match the compiled artifact used for deployment.
