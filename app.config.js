import 'dotenv/config';

export default {
  expo: {
    name: 'GroundSchoolAI',
    slug: 'groundschoolai',
    owner: 'selezai',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    assetBundlePatterns: [
      '**/*'
    ],
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
        projectId: "706ad34d-f8a8-4a9b-8f65-a7c33c349294"
      }
    },
    sdkVersion: "49.0.0",
    platforms: ["ios", "android"],
    runtimeVersion: {
      policy: "appVersion"
    }
  }
};
