declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
      PAYSTACK_SECRET_KEY: string;
      ANTHROPIC_API_KEY: string;
    }
  }
}
