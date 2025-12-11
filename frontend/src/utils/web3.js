import { BrowserProvider } from 'ethers';

export async function connectWallet() {
  if (!window || !window.ethereum) {
    console.error('connectWallet: window.ethereum not found');
    alert('MetaMask/QIE Wallet not detected!');
    return null;
  }

  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  } catch (reqErr) {
    console.error('connectWallet: eth_requestAccounts failed', reqErr);
  }

  let provider = null;
  let signer = null;
  let address = null;

  try {
    if (typeof BrowserProvider === 'function') {
      provider = new BrowserProvider(window.ethereum);
      signer = provider.getSigner ? await provider.getSigner() : null;
      if (signer && signer.getAddress) {
        address = await signer.getAddress();
      }
    } else {
      throw new Error('BrowserProvider is unavailable. Install ethers v6.');
    }
  } catch (err) {
    console.error('connectWallet: error creating provider/signer', err);
  }

  if (!address) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (Array.isArray(accounts) && accounts.length > 0) {
        address = accounts[0];
      }
    } catch (acctErr) {
      console.error('connectWallet: eth_accounts failed', acctErr);
    }
  }

  console.debug('connectWallet result', { address });
  return { provider, signer, address };
}

export function shortAddr(addr) {
  return addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : '';
}

// Export an alternative name expected by some components
export const shortAddress = shortAddr;
