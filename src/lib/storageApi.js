const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const BUCKET = 'project-assets'

// Upload tramite XHR per avere il progresso reale (fetch API non supporta upload progress)
export function uploadWithProgress(path, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`

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

    xhr.addEventListener('error',  () => reject(new Error('Errore di rete durante l\'upload')))
    xhr.addEventListener('abort',  () => reject(new Error('Upload annullato')))

    xhr.open('POST', url)
    xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_KEY}`)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
    xhr.setRequestHeader('x-upsert', 'true')
    xhr.send(file)
  })
}

// URL pubblico deterministico — non richiede una seconda chiamata HTTP
export function getPublicUrl(path) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`
}

// Path univoco per evitare collisioni nel bucket
export function generateStoragePath(prefix, file) {
  const ext = file.name.split('.').pop().toLowerCase()
  return `${prefix}/${crypto.randomUUID()}.${ext}`
}
