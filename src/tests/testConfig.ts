import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { mockStorage } from './mocks/supabase-storage';

// Load environment variables
const result = dotenv.config();

if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}

// Validate required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ANTHROPIC_API_KEY',
  'CLAUDE_MODEL',
  'PAYSTACK_SECRET_KEY',
  'PAYSTACK_PUBLIC_KEY',
  'GOOGLE_APP_PASSWORD',
];

console.log('\nLoaded environment variables:');
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
  console.log(`${envVar}: ${process.env[envVar] ? '✓' : '✗'}`);
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing required environment variables for Supabase');
}

// Create Supabase client with service role key for testing
export const testSupabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    headers: {
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
    },
  },
}) as any;

// Replace storage with mock
testSupabase.storage = mockStorage;

export { createClient };
