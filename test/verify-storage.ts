import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Supabase client for testing with service role key
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!, // Use service role key for testing
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function testStorageUpload() {
  try {
    const testFilePath = path.join(__dirname, 'test-upload.txt');
    const fileContent = fs.readFileSync(testFilePath);
    const testUserId = '12345678-1234-1234-1234-123456789012'; // Our test user ID
    
    console.log('Attempting to upload file...');
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(`${testUserId}/test-upload.txt`, fileContent, {
        contentType: 'text/plain',
      });

    if (error) {
      console.error('Upload failed:', error.message);
      return;
    }

    console.log('Upload successful:', data);

    // Try to download the file
    console.log('Attempting to download file...');
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(`${testUserId}/test-upload.txt`);

    if (downloadError) {
      console.error('Download failed:', downloadError.message);
      return;
    }

    console.log('Download successful');

    // Clean up - delete the test file
    console.log('Cleaning up...');
    const { error: deleteError } = await supabase.storage
      .from('documents')
      .remove([`${testUserId}/test-upload.txt`]);

    if (deleteError) {
      console.error('Cleanup failed:', deleteError.message);
      return;
    }

    console.log('Cleanup successful');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    process.exit();
  }
}

testStorageUpload();
