// Load environment variables and test config first
import { testSupabase, createClient } from './testConfig';

// Then import other modules
import { DocumentService } from '../services/document';

const TEST_USER_EMAIL = 'test@groundschoolai.com';

// Create test-specific document service
const testDocumentService = new DocumentService(testSupabase);

// Helper function to clean up test data
const cleanupTestData = async (userId?: string) => {
  console.log('Cleaning up test data...');
  
  try {
    // Find and delete existing test user if any
    const { data: users } = await testSupabase.auth.admin.listUsers();
    const existingUser = users?.users?.find((user: { email: string }) => user.email === TEST_USER_EMAIL);
    
    if (existingUser) {
      console.log('Found existing test user, cleaning up...');
      
      // Delete test documents
      const { error: deleteError } = await testSupabase
        .from('documents')
        .delete()
        .eq('user_id', existingUser.id);
        
      if (deleteError) {
        console.error('Error deleting test documents:', deleteError);
      }

      // Delete test user profile
      const { error: profileError } = await testSupabase
        .from('profiles')
        .delete()
        .eq('id', existingUser.id);
        
      if (profileError) {
        console.error('Error deleting test profile:', profileError);
      }

      // Delete test user
      const { error: userError } = await testSupabase.auth.admin.deleteUser(existingUser.id);
      if (userError) {
        console.error('Error deleting test user:', userError);
      }
    }
    
    // If we have a specific userId, clean up that user too
    if (userId) {
      console.log('Cleaning up specific test user...');
      
      // Delete test documents
      const { error: deleteError } = await testSupabase
        .from('documents')
        .delete()
        .eq('user_id', userId);
        
      if (deleteError) {
        console.error('Error deleting test documents:', deleteError);
      }

      // Delete test user profile
      const { error: profileError } = await testSupabase
        .from('profiles')
        .delete()
        .eq('id', userId);
        
      if (profileError) {
        console.error('Error deleting test profile:', profileError);
      }

      // Delete test user
      const { error: userError } = await testSupabase.auth.admin.deleteUser(userId);
      if (userError) {
        console.error('Error deleting test user:', userError);
      }
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};

const setupTestEnvironment = async (userId: string) => {
  console.log('Setting up test environment...');

  // Create test document to verify database access
  const testData = new TextEncoder().encode('test content');
  const { error: functionError } = await testSupabase
    .from('documents')
    .insert({
      title: 'test',
      category: 'test',
      user_id: userId,
      status: 'pending',
      file_path: 'test/test-document.txt',
      file_type: 'text/plain',
      file_size: testData.byteLength,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (functionError) {
    console.error('Error creating test document:', functionError);
    throw functionError;
  }

  console.log('Test environment setup completed');
};

// Main test
(async () => {
  let userId: string | undefined;
  
  try {
    // Clean up any existing test data first
    await cleanupTestData();
    
    console.log('\nSetting up test user...');
    
    // Create test user
    const { data: { user }, error: userError } = await testSupabase.auth.admin.createUser({
      email: TEST_USER_EMAIL,
      password: 'test-password-123',
      email_confirm: true,
    });

    if (userError || !user) {
      throw userError || new Error('Failed to create test user');
    }

    userId = user.id;
    console.log('Test user created successfully');

    // Create user profile
    const { error: profileError } = await testSupabase
      .from('profiles')
      .insert({
        id: userId,
        email: user.email,
        full_name: 'Test User',
        subscription_status: 'trial',
        trial_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

    if (profileError) {
      throw profileError;
    }

    console.log('Test user profile created successfully');

    // Sign in as test user
    const { error: signInError } = await testSupabase.auth.signInWithPassword({
      email: TEST_USER_EMAIL,
      password: 'test-password-123',
    });

    if (signInError) {
      throw signInError;
    }

    console.log('Signed in as test user');

    // Set up test environment
    await setupTestEnvironment(userId!);

    console.log('\n=== Starting Document Analysis Test ===\n');

    // Create a test document
    console.log('Creating test document...');
    const testContent = 'This is a test document about aircraft hydraulics.';
    const testData = new TextEncoder().encode(testContent);
    
    // Upload document using DocumentService
    const document = await testDocumentService.uploadDocument(
      {
        uri: 'test/hydraulics.txt',
        name: 'hydraulics.txt',
        type: 'text/plain',
        data: testData,
        size: testData.byteLength,
      },
      {
        title: 'Aircraft Hydraulics Test',
        category: 'Systems',
      }
    );

    console.log('Created test document');

    // Wait for analysis to complete
    console.log('\nWaiting for analysis to complete...');
    let maxAttempts = 10;
    let attempts = 0;
    let analyzed = false;

    while (attempts < maxAttempts && !analyzed) {
      attempts++;
      console.log(`Checking analysis status (attempt ${attempts}/${maxAttempts})...`);
      
      const { data: updatedDoc } = await testSupabase
        .from('documents')
        .select('*')
        .eq('id', document.id)
        .single();
        
      if (updatedDoc?.status === 'analyzed') {
        analyzed = true;
        console.log('Document analysis completed successfully');
      } else if (updatedDoc?.status === 'failed') {
        throw new Error('Document analysis failed');
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      }
    }

    if (!analyzed) {
      throw new Error('Document analysis timed out');
    }

    console.log('\n=== Document Analysis Test Completed Successfully ===\n');
  } catch (error) {
    console.error('\nTest failed:', error);
    throw error;
  } finally {
    // Clean up test data
    if (userId) {
      await cleanupTestData(userId);
    }
    console.log('\nTest cleanup completed');
  }
})();
