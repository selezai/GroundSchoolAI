// Access environment variables
import Constants from 'expo-constants';

// Get environment variables from Expo Constants
const extra = Constants.expoConfig?.extra || {};

// Helper function to get environment variables with type checking
const getEnvVar = (key: string): string => {
  const value = extra[key] || process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const config = {
  supabase: {
    url: getEnvVar('SUPABASE_URL'),
    anonKey: getEnvVar('SUPABASE_ANON_KEY'),
  },
  openai: {
    apiKey: getEnvVar('OPENAI_API_KEY'),
  },
  anthropic: {
    apiKey: getEnvVar('ANTHROPIC_API_KEY'),
  },
};

// Type for the config object
export interface Config {
  supabase: {
    url: string;
    anonKey: string;
  };
  openai: {
    apiKey: string;
  };
  anthropic: {
    apiKey: string;
  };
}
