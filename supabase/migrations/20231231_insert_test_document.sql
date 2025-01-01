-- Create function to insert test document
CREATE OR REPLACE FUNCTION insert_test_document(
  p_user_id UUID,
  p_title TEXT,
  p_category TEXT,
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
    user_id,
    title,
    category,
    status,
    file_path,
    file_type,
    file_size,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_title,
    p_category,
    'pending',
    p_file_path,
    p_file_type,
    p_file_size,
    NOW(),
    NOW()
  );
END;
$$;
