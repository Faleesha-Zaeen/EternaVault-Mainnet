import * as ethers from "ethers";

export async function connectWallet() {
  if (!window.ethereum) {
    console.error("connectWallet: window.ethereum not found");
    alert("MetaMask/QIE Wallet not detected!");
    return null;
  }

  // Request account access (wrap in try/catch so failures don't silently break UI)
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  } catch (reqErr) {
    console.error("connectWallet: eth_requestAccounts failed", reqErr);
    // continue — we'll try to read accounts below
  }

  // Support ethers v5 (ethers.providers.Web3Provider) and v6 (ethers.BrowserProvider)
  let provider = null;
  let signer = null;
  let address = null;
  try {
    if (ethers.providers && ethers.providers.Web3Provider) {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      if (signer && signer.getAddress) {
        address = await signer.getAddress();
      }
    } else if (ethers.BrowserProvider) {
      // ethers v6
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = provider.getSigner ? provider.getSigner() : null;
      if (signer && signer.getAddress) {
        // v6 signer.getAddress is async
        address = await signer.getAddress();
      }
    } else {
      throw new Error("Unsupported ethers version in frontend; please install ethers v5 or v6.");
    }
  } catch (err) {
    console.error("connectWallet: error creating provider/signer", err);
  }

  // Fallback: if address still not found, query eth_accounts directly and take first
  if (!address) {
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (Array.isArray(accounts) && accounts.length > 0) {
        address = accounts[0];
      }
    } catch (acctErr) {
      console.error("connectWallet: eth_accounts failed", acctErr);
    }
  }

  console.debug("connectWallet result", { address });
  return { provider, signer, address };
}

export function shortAddr(addr) {
  return addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "";
}

// Export an alternative name expected by some components
export const shortAddress = shortAddr;
