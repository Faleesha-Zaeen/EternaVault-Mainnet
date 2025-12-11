// import { NFTStorage, File } from 'nft.storage';

// export async function uploadEncryptedBlob(blob, token) {
//   if (!token) {
//     throw new Error('Missing NFT.Storage token');
//   }

//   const client = new NFTStorage({ token });
//   const cid = await client.storeBlob(new File([blob], 'encrypted.enc'));
//   return cid;
// }
import { NFTStorage } from 'nft.storage'

export async function uploadEncryptedBlob(blob, token) {
  if (!token) throw new Error("Missing NFT.Storage token")

  const client = new NFTStorage({ token })

  // Convert encrypted blob to File for upload
  const file = new File([blob], "encrypted.enc", {
    type: "application/octet-stream",
  })

  // Upload to IPFS via NFT.Storage
  const cid = await client.storeBlob(file)
  return cid
}
