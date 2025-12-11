import { NFTStorage, File } from 'nft.storage'

export async function uploadEncryptedBlob(blob, token) {
  if (!token) {
    throw new Error("Missing NFT.Storage token")
  }

  // Initialize the client
  const client = new NFTStorage({ token });

  // Convert encrypted blob → File for upload
  const file = new File([blob], "encrypted.enc", {
    type: "application/octet-stream",
  });

  // Upload to IPFS
  const cid = await client.storeBlob(file);

  return cid;
}