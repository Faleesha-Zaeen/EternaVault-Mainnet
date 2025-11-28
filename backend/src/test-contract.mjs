import "dotenv/config";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JsonRpcProvider, Wallet, Contract } from "ethers";

// Read ABI file without import assertions to avoid Node import-assertion issues
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const abiPath = path.join(__dirname, 'abi', 'LegacyVault.json');
const abiFile = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
const abi = abiFile.abi || abiFile;

async function test() {
  try {
    console.log("🌐 Connecting to QIE...");

    const provider = new JsonRpcProvider(process.env.QIE_RPC_URL);
    let pk = process.env.PRIVATE_KEY;
    if (pk && !pk.startsWith('0x')) pk = '0x' + pk;
    const wallet = new Wallet(pk, provider);

    console.log("🔑 Wallet:", wallet.address);

    const contract = new Contract(process.env.VAULT_ADDRESS, abi, wallet);

    console.log("⚙️ Sending registerValidator tx...");
    const tx = await contract.registerValidator(wallet.address);

    console.log("⏳ Tx sent:", tx.hash);
    await tx.wait();

    console.log("🎉 Transaction confirmed!");
  } catch (err) {
    console.error("❌ ERROR:", err && err.message ? err.message : err);
    if (err && err.stack) console.error(err.stack.split('\n').slice(0,8).join('\n'));
    process.exitCode = 1;
  }
}

test();
