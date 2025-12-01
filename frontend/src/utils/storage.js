import { Web3Storage } from 'web3.storage';

export function makeStorageClient(token) {
  return new Web3Storage({ token });
}

export async function uploadEncryptedBlob(blob, token) {
  const client = makeStorageClient(token);
  const file = new File([blob], 'encrypted.enc');
  const cid = await client.put([file], { wrapWithDirectory: false });
  return cid;
}
