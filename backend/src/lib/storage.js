import fs from 'fs';
import { getSupabaseClient, STORAGE_BUCKET } from './supabaseClient.js';

function assertBucket() {
  if (!STORAGE_BUCKET) {
    throw new Error('Supabase bucket is not configured (SUPABASE_BUCKET).');
  }
  return STORAGE_BUCKET;
}

export async function uploadEncryptedFile(localPath, remotePath) {
  const bucket = assertBucket();
  const client = getSupabaseClient();
  const fileBuffer = await fs.promises.readFile(localPath);
  const { error } = await client.storage.from(bucket).upload(remotePath, fileBuffer, {
    contentType: 'application/octet-stream',
    upsert: true,
  });
  if (error) {
    throw new Error(`Failed to upload encrypted file: ${error.message}`);
  }
}

export async function downloadEncryptedFile(remotePath) {
  const bucket = assertBucket();
  const client = getSupabaseClient();
  const { data, error } = await client.storage.from(bucket).download(remotePath);
  if (error) {
    throw new Error(`Failed to download encrypted file: ${error.message}`);
  }
  const buffer = Buffer.from(await data.arrayBuffer());
  return buffer;
}
