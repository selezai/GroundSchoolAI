-- Create function to disable RLS
CREATE OR REPLACE FUNCTION disable_rls()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
END;
$$;

-- Create function to enable RLS
CREATE OR REPLACE FUNCTION enable_rls()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
END;
$$;
