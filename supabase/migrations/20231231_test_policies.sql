-- Enable RLS on documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;
DROP POLICY IF EXISTS "Service role has full access" ON documents;

-- Create policies for normal operation
CREATE POLICY "Users can view their own documents"
ON documents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
ON documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
ON documents FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
ON documents FOR DELETE
USING (auth.uid() = user_id);

-- Create policy for service role access (used in tests)
CREATE POLICY "Service role has full access"
ON documents
USING (
  CASE 
    WHEN auth.jwt() IS NULL THEN FALSE
    WHEN auth.jwt()->>'role' = 'service_role' THEN TRUE
    ELSE auth.uid() = user_id
  END
);
