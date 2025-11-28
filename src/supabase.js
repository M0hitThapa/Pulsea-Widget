import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;

/**
 * Upload a file to Supabase storage
 * @param bucket - The storage bucket name
 * @param path - The file path in the bucket
 * @param file - The file to upload
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(bucket, path, file) {
  // ← Add parameters here
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return publicUrl;
}
