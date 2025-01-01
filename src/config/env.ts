// Try to import from @env first (for React Native)
let envVars: {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  ANTHROPIC_API_KEY: string;
  CLAUDE_MODEL?: string;
  PAYSTACK_SECRET_KEY: string;
  PAYSTACK_PUBLIC_KEY: string;
  GOOGLE_APP_PASSWORD: string;
};

try {
  envVars = require('@env');
} catch {
  // Fallback to process.env (for tests)
  envVars = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY!,
    CLAUDE_MODEL: process.env.CLAUDE_MODEL,
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY!,
    PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY!,
    GOOGLE_APP_PASSWORD: process.env.GOOGLE_APP_PASSWORD!,
  };
}

// Helper function to validate environment variables
const validateEnvVar = (name: string, value?: string): string => {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

// Validate all required environment variables
const requiredEnvVars = {
  SUPABASE_URL: validateEnvVar('SUPABASE_URL', envVars.SUPABASE_URL),
  SUPABASE_ANON_KEY: validateEnvVar('SUPABASE_ANON_KEY', envVars.SUPABASE_ANON_KEY),
  ANTHROPIC_API_KEY: validateEnvVar('ANTHROPIC_API_KEY', envVars.ANTHROPIC_API_KEY),
  PAYSTACK_SECRET_KEY: validateEnvVar('PAYSTACK_SECRET_KEY', envVars.PAYSTACK_SECRET_KEY),
  PAYSTACK_PUBLIC_KEY: validateEnvVar('PAYSTACK_PUBLIC_KEY', envVars.PAYSTACK_PUBLIC_KEY),
  GOOGLE_APP_PASSWORD: validateEnvVar('GOOGLE_APP_PASSWORD', envVars.GOOGLE_APP_PASSWORD),
};

export const config = {
  supabase: {
    url: requiredEnvVars.SUPABASE_URL,
    anonKey: requiredEnvVars.SUPABASE_ANON_KEY,
  },
  anthropic: {
    apiKey: requiredEnvVars.ANTHROPIC_API_KEY,
    claude: envVars.CLAUDE_MODEL || 'claude-2',
  },
  paystack: {
    secretKey: requiredEnvVars.PAYSTACK_SECRET_KEY,
    publicKey: requiredEnvVars.PAYSTACK_PUBLIC_KEY,
  },
  email: {
    appPassword: requiredEnvVars.GOOGLE_APP_PASSWORD,
    email: 'support@groundschoolai.com',
  },
} as const;

export const env = {
  supabase: {
    url: requiredEnvVars.SUPABASE_URL,
    anonKey: requiredEnvVars.SUPABASE_ANON_KEY,
    publicKey: requiredEnvVars.SUPABASE_ANON_KEY, // Added for backward compatibility
  },
  anthropic: {
    apiKey: requiredEnvVars.ANTHROPIC_API_KEY,
    claude: envVars.CLAUDE_MODEL || 'claude-2',
  },
  paystack: {
    secretKey: requiredEnvVars.PAYSTACK_SECRET_KEY,
    publicKey: requiredEnvVars.PAYSTACK_PUBLIC_KEY,
  },
  email: {
    appPassword: requiredEnvVars.GOOGLE_APP_PASSWORD,
    email: 'support@groundschoolai.com',
  },
} as const;

// Type for the config object
export interface Config {
  supabase: {
    url: string;
    anonKey: string;
  };
  anthropic: {
    apiKey: string;
    claude: string;
  };
  paystack: {
    secretKey: string;
    publicKey: string;
  };
  email: {
    appPassword: string;
    email: string;
  };
}
