const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function initializeDatabase() {
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log('Initializing database...');

    // Execute each statement
    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          query: statement + ';'
        });

        if (error) {
          console.error('Error executing statement:', error);
          console.error('Statement:', statement);
        }
      } catch (err) {
        console.error('Error executing statement:', err);
        console.error('Statement:', statement);
      }
    }

    console.log('Database initialization completed.');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initializeDatabase();
