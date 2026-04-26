import { supabase } from './supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const BUCKET_ASSETS = 'project-assets'
export const BUCKET_THUMBS = 'thumbnails'

// Upload tramite XHR per avere il progresso reale (fetch API non supporta upload progress).
// Usa il token di sessione dell'utente loggato; fallback all'anon key.
export async function uploadWithProgress(bucket, path, file, onProgress) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token ?? SUPABASE_KEY

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const url = `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        try {
          const body = JSON.parse(xhr.responseText)
          reject(new Error(body.message || `Upload fallito (${xhr.status})`))
        } catch {
          reject(new Error(`Upload fallito (${xhr.status})`))
        }
      }
    })

    xhr.addEventListener('error', () => reject(new Error("Errore di rete durante l'upload")))
    xhr.addEventListener('abort', () => reject(new Error('Upload annullato')))

    xhr.open('POST', url)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
    xhr.setRequestHeader('x-upsert', 'true')
    xhr.send(file)
  })
}

// URL pubblico deterministico — non richiede una seconda chiamata HTTP
export function getPublicUrl(bucket, path) {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
}

// Path univoco con estensione — overrideExt per i WebP auto-generati
export function generateStoragePath(file, overrideExt) {
  const ext = overrideExt || file.name.split('.').pop().toLowerCase()
  return `${crypto.randomUUID()}.${ext}`
}
