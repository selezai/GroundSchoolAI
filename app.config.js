import 'dotenv/config';

export default {
  expo: {
    name: 'GroundSchoolAI',
    slug: 'groundschoolai',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.groundschoolai.app'
    },
    android: {
      package: 'com.groundschoolai.app'
    },
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      googleAppPassword: process.env.GOOGLE_APP_PASSWORD,
      paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
      paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY,
      claudeModel: process.env.CLAUDE_MODEL,
      supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      eas: {
        projectId: 'your-project-id'
      }
    }
  }
};
