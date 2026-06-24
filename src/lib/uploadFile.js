import { supabase } from '@/lib/supabaseClient';

// Uploads a file to the "evidence" storage bucket and returns its public URL.
export async function uploadFile(file) {
  const ext = file.name.split('.').pop();
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from('evidence').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from('evidence').getPublicUrl(path);
  return data.publicUrl;
}
