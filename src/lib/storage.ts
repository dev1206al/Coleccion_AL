import { supabase } from './supabase'

const BUCKET = 'collection-images'

export async function uploadImage(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type })

  if (error) throw error

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

export async function deleteImage(url: string): Promise<void> {
  // Extrae el path relativo de la URL pública
  const path = url.split(`/${BUCKET}/`)[1]
  if (!path) return
  await supabase.storage.from(BUCKET).remove([path])
}
