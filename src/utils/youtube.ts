export function extractYouTubeId(url: string): string | null {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

export function toYouTubeEmbedUrl(url: string): string | null {
  const id = extractYouTubeId(url)
  if (!id) return null
  return `https://www.youtube-nocookie.com/embed/${id}`
}

export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null
}
