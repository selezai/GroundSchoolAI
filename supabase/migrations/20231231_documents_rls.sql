-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;
DROP POLICY IF EXISTS "Service role bypass" ON documents;

-- Create policies
-- Allow users to view their own documents
CREATE POLICY "Users can view their own documents"
ON documents FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert documents for themselves
CREATE POLICY "Users can insert their own documents"
ON documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own documents
CREATE POLICY "Users can update their own documents"
ON documents FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own documents
CREATE POLICY "Users can delete their own documents"
ON documents FOR DELETE
USING (auth.uid() = user_id);

-- Allow service role to bypass RLS
CREATE POLICY "Service role bypass"
ON documents
USING (auth.role() = 'service_role');
