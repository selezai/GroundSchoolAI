import * as dotenv from 'dotenv';
dotenv.config();

// Function to check if a string is a valid URL
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Test Supabase configuration
console.log('\nTesting Supabase configuration:');
console.log('URL is set:', !!process.env.SUPABASE_URL);
console.log('URL is valid:', isValidUrl(process.env.SUPABASE_URL || ''));
console.log('Anon key is set:', !!process.env.SUPABASE_ANON_KEY);
console.log('Anon key length:', process.env.SUPABASE_ANON_KEY?.length || 0);

// Test Anthropic configuration
console.log('\nTesting Anthropic configuration:');
console.log('API key is set:', !!process.env.ANTHROPIC_API_KEY);
console.log('API key length:', process.env.ANTHROPIC_API_KEY?.length || 0);
console.log('Claude model:', process.env.CLAUDE_MODEL || 'claude-2');

// Test Paystack configuration
console.log('\nTesting Paystack configuration:');
console.log('Secret key is set:', !!process.env.PAYSTACK_SECRET_KEY);
console.log('Secret key length:', process.env.PAYSTACK_SECRET_KEY?.length || 0);
console.log('Public key is set:', !!process.env.PAYSTACK_PUBLIC_KEY);
console.log('Public key length:', process.env.PAYSTACK_PUBLIC_KEY?.length || 0);
