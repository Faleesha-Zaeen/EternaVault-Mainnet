import { NFTStorage, File } from 'nft.storage';

export async function uploadEncryptedBlob(blob, token) {
  if (!token) {
    throw new Error('Missing NFT.Storage token');
  }

  const client = new NFTStorage({ token });
  const cid = await client.storeBlob(new File([blob], 'encrypted.enc'));
  return cid;
}
