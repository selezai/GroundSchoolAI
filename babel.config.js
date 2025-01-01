module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
        blacklist: null,
        whitelist: [
          'SUPABASE_URL',
          'SUPABASE_ANON_KEY',
          'ANTHROPIC_API_KEY',
          'PAYSTACK_SECRET_KEY',
          'CLAUDE_MODEL'
        ],
        safe: false,
        allowUndefined: true,
      }],
    ],
  };
};
