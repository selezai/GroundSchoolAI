declare module '@env' {
  export const SUPABASE_URL: string;
  export const SUPABASE_ANON_KEY: string;
  export const ANTHROPIC_API_KEY: string;
  export const PAYSTACK_SECRET_KEY: string;
  export const PAYSTACK_PUBLIC_KEY: string;
  export const GOOGLE_APP_PASSWORD: string;
  export const CLAUDE_MODEL: string;
}

// Extend the NodeJS namespace to include environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
      ANTHROPIC_API_KEY: string;
      PAYSTACK_SECRET_KEY: string;
      PAYSTACK_PUBLIC_KEY: string;
      GOOGLE_APP_PASSWORD: string;
      CLAUDE_MODEL: string;
    }
  }
}

export {};
