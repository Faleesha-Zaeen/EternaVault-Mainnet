import {
  getSupabaseClient,
  FILES_TABLE,
  DIDS_TABLE,
  STATUS_TABLE,
  PROFILE_TABLE,
} from './supabaseClient.js';

function supabase() {
  return getSupabaseClient();
}

function handleError(context, error) {
  if (!error) return;
  throw new Error(`${context}: ${error.message}`);
}

export async function insertFileRecord(record) {
  const { error } = await supabase().from(FILES_TABLE).insert(record);
  handleError('insertFileRecord', error);
  return record;
}

export async function getFileRecord(id) {
  const { data, error } = await supabase().from(FILES_TABLE).select('*').eq('id', id).maybeSingle();
  if (error && error.code !== 'PGRST116') {
    handleError('getFileRecord', error);
  }
  return data || null;
}

export async function listFilesByDid(ownerDid) {
  const { data, error } = await supabase()
    .from(FILES_TABLE)
    .select('*')
    .eq('ownerDid', ownerDid)
    .order('timestamp', { ascending: false });
  handleError('listFilesByDid', error);
  return data || [];
}

export async function updateFileRecord(id, fields) {
  const { data, error } = await supabase()
    .from(FILES_TABLE)
    .update(fields)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error && error.code !== 'PGRST116') {
    handleError('updateFileRecord', error);
  }
  return data || null;
}

export async function registerDid(did) {
  const payload = { did, createdAt: new Date().toISOString() };
  const { error } = await supabase().from(DIDS_TABLE).upsert(payload, { onConflict: 'did' });
  handleError('registerDid', error);
  return payload;
}

export async function saveDeathStatus(did, status) {
  const payload = { did, ...status };
  const { data, error } = await supabase()
    .from(STATUS_TABLE)
    .upsert(payload, { onConflict: 'did' })
    .select('*')
    .single();
  handleError('saveDeathStatus', error);
  return data;
}

export async function getDeathStatus(did) {
  const { data, error } = await supabase().from(STATUS_TABLE).select('*').eq('did', did).maybeSingle();
  if (error && error.code !== 'PGRST116') {
    handleError('getDeathStatus', error);
  }
  return data || null;
}

export async function upsertProfile(did, profile) {
  const payload = { did, ...profile };
  const { data, error } = await supabase()
    .from(PROFILE_TABLE)
    .upsert(payload, { onConflict: 'did' })
    .select('*')
    .single();
  handleError('upsertProfile', error);
  return data;
}

export async function getProfile(did) {
  const { data, error } = await supabase().from(PROFILE_TABLE).select('*').eq('did', did).maybeSingle();
  if (error && error.code !== 'PGRST116') {
    handleError('getProfile', error);
  }
  return data || null;
}
