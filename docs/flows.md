# Product Flows

## Owner Flow
1. **Authenticate** (optional) by generating a DID via `/api/register-did`.
2. **Encrypt & Upload** on `/upload`:
   - Enter vault key (passphrase never leaves browser).
   - Pick file, optionally add title/description.
   - AES-GCM encrypt, optional Web3.Storage upload → CID.
   - Submit to backend; Supabase stores blob + metadata.
3. **Register heirs** inside Heir Dashboard or via API call to `/api/register-heir` (wallet address list).
4. **Anchor CID** in Timeline once satisfied with uploads:
   - Click “Anchor on QIE” → `/api/anchor-cid` → transaction recorded on explorer.
5. **Trigger legacy** when needed via `/api/notify-death` or future validator consensus.

## Heir Flow
1. **Provide wallet** in Heir Dashboard and ask owner to register it.
2. **Wait for unlock** – UI polls `/api/simulate-unlock` which checks `canAccess`.
3. **Enter vault key** once access is granted.
4. **Download encrypted files** (`/api/file/:id?as=encrypted`), decrypt locally.
5. **Generate AI summary** for each decrypted memory using `/api/generate-story` for compassionate context.

## Validator Flow
1. **Connect wallet** via `window.ethereum` integration on Validator Dashboard.
2. **Register as validator** by POSTing to `/api/validators` which calls `registerValidator(address)`.
3. **Attestations** (current build logs registration event; roadmap will require validator quorum before `markDeceased`).

## Tokenization Flow
1. Create a **DLT token** through QIEDEX or external tooling.
2. Navigate to `/tokenization` page.
3. Enter `tokenAddress` and optional `marketLink` (e.g., QIEDEX pair URL).
4. POST to `/api/profile/token`; Supabase stores metadata for display in future investor UX.

## UX Snapshot
```
Owner Upload  ->  Timeline (Anchor)  ->  Notify Death
             \->  Register Heir  ->  Heir Dashboard -> Decrypt -> AI Story
Validator Dashboard -> Register -> (Future) Death Attestations
Tokenization Page -> Link QIE token for inheritance tiers
```
