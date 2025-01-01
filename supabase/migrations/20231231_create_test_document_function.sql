-- Create function to bypass RLS for test document creation
CREATE OR REPLACE FUNCTION create_test_document(
  p_title TEXT,
  p_category TEXT,
  p_user_id UUID,
  p_file_path TEXT,
  p_file_type TEXT,
  p_file_size INTEGER
) RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO documents (
    title,
    category,
    user_id,
    status,
    file_path,
    file_type,
    file_size,
    created_at,
    updated_at
  ) VALUES (
    p_title,
    p_category,
    p_user_id,
    'pending',
    p_file_path,
    p_file_type,
    p_file_size,
    NOW(),
    NOW()
  );
END;
$$;
