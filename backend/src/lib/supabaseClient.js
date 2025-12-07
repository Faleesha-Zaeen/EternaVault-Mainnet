import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseKey = supabaseServiceRoleKey || supabaseAnonKey;

let cachedClient = null;

if (!supabaseUrl || !supabaseKey) {
	console.warn('Supabase environment variables are not fully configured.');
} else {
	cachedClient = createClient(supabaseUrl, supabaseKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});
}

export function getSupabaseClient() {
	if (!cachedClient) {
		throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
	}
	return cachedClient;
}

export const FILES_TABLE = process.env.SUPABASE_TABLE_FILES || 'vault_files';
export const DIDS_TABLE = process.env.SUPABASE_TABLE_DIDS || 'vault_dids';
export const STATUS_TABLE = process.env.SUPABASE_TABLE_STATUSES || 'vault_statuses';
export const PROFILE_TABLE = process.env.SUPABASE_TABLE_PROFILES || 'vault_profiles';
export const STORAGE_BUCKET = process.env.SUPABASE_BUCKET || 'encrypted-files';
