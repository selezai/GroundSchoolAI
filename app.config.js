import 'dotenv/config';

export default {
  expo: {
    name: 'GroundSchoolAI',
    slug: 'groundschoolai',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      }
    },
    web: {
      favicon: './assets/favicon.png'
    },
    extra: {
      MONGODB_URI: process.env.MONGODB_URI,
      RENDER_API_KEY: process.env.RENDER_API_KEY,
      GOOGLE_APP_PASSWORD: process.env.GOOGLE_APP_PASSWORD,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_PUBLIC_KEY: process.env.SUPABASE_PUBLIC_KEY,
      SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
      CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
      PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY,
      PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
    }
  }
};
