/**
 * Cattura un frame dal video al tempo indicato (default: 1 s).
 * Restituisce una Promise<Blob> in formato WebP (max 1280×720).
 */
export function captureVideoFrame(file, timeSeconds = 1.0) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const url   = URL.createObjectURL(file)
    let settled = false

    const timer = setTimeout(() => {
      if (!settled) { settled = true; cleanup(); reject(new Error('Timeout cattura frame')) }
    }, 15000)

    function cleanup() {
      clearTimeout(timer)
      URL.revokeObjectURL(url)
      video.src = ''
      video.load()
    }

    function drawFrame() {
      if (settled) return
      const canvas = document.createElement('canvas')
      const maxW = 1280, maxH = 720
      let w = video.videoWidth  || 1280
      let h = video.videoHeight || 720
      if (w > maxW) { h = Math.round(h * maxW / w); w = maxW }
      if (h > maxH) { w = Math.round(w * maxH / h); h = maxH }
      canvas.width  = w
      canvas.height = h
      canvas.getContext('2d').drawImage(video, 0, 0, w, h)

      canvas.toBlob(
        (blob) => {
          if (settled) return
          settled = true
          cleanup()
          if (blob) resolve(blob)
          else reject(new Error('Impossibile catturare il frame'))
        },
        'image/webp',
        0.85,
      )
    }

    video.addEventListener('seeked', drawFrame, { once: true })

    video.addEventListener('loadedmetadata', () => {
      const dur = isFinite(video.duration) && video.duration > 0 ? video.duration : null
      video.currentTime = dur
        ? Math.min(timeSeconds, dur > timeSeconds ? timeSeconds : dur * 0.5)
        : 0
    }, { once: true })

    video.addEventListener('error', () => {
      if (!settled) { settled = true; cleanup(); reject(new Error('Errore caricamento video')) }
    }, { once: true })

    video.muted      = true
    video.playsInline = true
    video.preload    = 'metadata'
    video.src        = url
    video.load()
  })
}
