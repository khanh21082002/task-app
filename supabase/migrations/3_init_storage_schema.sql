async function runSetup() {
  try {
    // First, remove existing bucket if it exists
    await deleteExistingBucket();
    
    // Create new bucket with configurations
    await createStorageBucket();
    
    // Set up security policies
    await createSecurityPolicies();
    
    // Create trigger function
    await createTriggerFunction();
    
    // Grant necessary permissions
    await grantPermissions();
    
    console.log('Setup completed successfully');
  } catch (error) {
    console.error('Setup failed:', error);
    throw error;
  }
}

async function deleteExistingBucket() {
  const query = `
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'task-attachments'
      ) THEN
        DELETE FROM storage.objects WHERE bucket_id = 'task-attachments';
        DELETE FROM storage.buckets WHERE id = 'task-attachments';
      END IF;
    END $$;
  `;
  await db.query(query);
}

async function createStorageBucket() {
  const query = `
    INSERT INTO storage.buckets (
      id, 
      name,
      public,
      file_size_limit,
      allowed_mime_types
    )
    VALUES (
      'task-attachments',
      'task-attachments',
      true,
      1000000,
      array[
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
      ]
    );
  `;
  await db.query(query);
}

async function createSecurityPolicies() {
  await createPublicViewPolicy();
  await createUserUploadPolicy();
  await createUserDeletePolicy();
}

async function createPublicViewPolicy() {
  const query = `
    CREATE POLICY "Public can view attachments"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'task-attachments');
  `;
  await db.query(query);
}

async function createUserUploadPolicy() {
  const query = `
    CREATE POLICY "Users can upload their own attachments"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'task-attachments'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  `;
  await db.query(query);
}

async function createUserDeletePolicy() {
  const query = `
    CREATE POLICY "Users can delete their own attachments"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'task-attachments'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  `;
  await db.query(query);
}

async function createTriggerFunction() {
  const query = `
    CREATE OR REPLACE FUNCTION delete_task_storage_object()
    RETURNS TRIGGER
    SECURITY DEFINER
    SET search_path = public
    AS $$
    BEGIN
      IF OLD.image_url IS NOT NULL THEN
        DELETE FROM storage.objects
        WHERE bucket_id = 'task-attachments'
        AND name = OLD.image_url;
      END IF;
      
      RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER cleanup_storage_on_task_delete
    BEFORE DELETE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION delete_task_storage_object();
  `;
  await db.query(query);
}

async function grantPermissions() {
  const query = `
    GRANT DELETE ON storage.objects TO authenticated;
  `;
  await db.query(query);
}