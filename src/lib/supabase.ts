import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env';
import { Database } from '../types/supabase';

// Create Supabase client
export const supabase = createClient<Database>(
  config.supabase.url,
  config.supabase.publicKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Helper function to handle errors
export const handleSupabaseError = (error: Error | null) => {
  if (error) {
    console.error('Supabase error:', error.message);
    throw error;
  }
};
