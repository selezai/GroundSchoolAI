import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = config.supabase.url;
const supabaseAnonKey = config.supabase.publicKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
