declare module '@env' {
  export const MONGODB_URI: string;
  export const RENDER_API_KEY: string;
  export const GOOGLE_APP_PASSWORD: string;
  export const SUPABASE_URL: string;
  export const SUPABASE_PUBLIC_KEY: string;
  export const SUPABASE_SECRET_KEY: string;
  export const CLAUDE_API_KEY: string;
  export const PAYSTACK_PUBLIC_KEY: string;
  export const PAYSTACK_SECRET_KEY: string;
}

// Extend the NodeJS namespace to include environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI: string;
      RENDER_API_KEY: string;
      GOOGLE_APP_PASSWORD: string;
      SUPABASE_URL: string;
      SUPABASE_PUBLIC_KEY: string;
      SUPABASE_SECRET_KEY: string;
      CLAUDE_API_KEY: string;
      PAYSTACK_PUBLIC_KEY: string;
      PAYSTACK_SECRET_KEY: string;
    }
  }
}
