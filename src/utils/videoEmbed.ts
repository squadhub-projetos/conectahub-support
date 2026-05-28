export type VideoProvider = 'youtube' | 'loom' | 'vturb' | 'google_drive' | 'unknown'

export interface NormalizedVideoEmbed {
  provider: VideoProvider
  type: 'iframe' | 'script' | 'unknown'
  originalInput: string
  embedUrl?: string
  embedCode?: string
  error?: string
}

export function detectVideoProvider(input: string): VideoProvider {
  const s = input.trim()

  if (
    s.includes('vturb-smartplayer') ||
    s.includes('converteai.net') ||
    s.includes('vturb.com.br') ||
    s.includes('player.vturb')
  ) {
    return 'vturb'
  }
  if (s.includes('youtube.com') || s.includes('youtu.be') || s.includes('youtube-nocookie.com')) {
    return 'youtube'
  }
  if (s.includes('loom.com')) return 'loom'
  if (s.includes('drive.google.com')) return 'google_drive'

  // Try to detect from embed code src
  if (s.includes('<iframe') || s.includes('<div') || s.includes('<script')) {
    const srcMatch = s.match(/src=["']([^"']+)["']/)
    if (srcMatch) return detectVideoProvider(srcMatch[1])
  }

  return 'unknown'
}

export function getYouTubeEmbedUrl(input: string): string | null {
  const s = input.trim()

  if (s.includes('<iframe')) {
    const srcMatch = s.match(/src=["']([^"']*(?:youtube|youtu)[^"']*)["']/)
    if (srcMatch) return getYouTubeEmbedUrl(srcMatch[1])
  }

  const embedMatch = s.match(/(?:youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/)([A-Za-z0-9_-]{11})/)
  if (embedMatch) return `https://www.youtube-nocookie.com/embed/${embedMatch[1]}`

  const shortMatch = s.match(/youtu\.be\/([A-Za-z0-9_-]{11})/)
  if (shortMatch) return `https://www.youtube-nocookie.com/embed/${shortMatch[1]}`

  const shortsMatch = s.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/)
  if (shortsMatch) return `https://www.youtube-nocookie.com/embed/${shortsMatch[1]}`

  try {
    const u = new URL(s.startsWith('http') ? s : `https://${s}`)
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      if (v && v.length === 11) return `https://www.youtube-nocookie.com/embed/${v}`
    }
  } catch {
    const watchMatch = s.match(/youtube\.com\/watch[^&]*[?&]v=([A-Za-z0-9_-]{11})/)
    if (watchMatch) return `https://www.youtube-nocookie.com/embed/${watchMatch[1]}`
  }

  return null
}

export function getLoomEmbedUrl(input: string): string | null {
  const s = input.trim()

  if (s.includes('<iframe')) {
    const srcMatch = s.match(/src=["']([^"']*loom\.com[^"']*)["']/)
    if (srcMatch) return getLoomEmbedUrl(srcMatch[1])
  }

  const m = s.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/)
  if (!m) return null

  const base = `https://www.loom.com/embed/${m[1]}`
  try {
    const urlStr = s.startsWith('http') ? s : `https://${s}`
    const u = new URL(urlStr)
    const keepParams = ['hide_owner', 'hide_share', 'hide_title', 'hideEmbedTopBar', 't']
    const params = new URLSearchParams()
    u.searchParams.forEach((v, k) => {
      if (keepParams.includes(k)) params.set(k, v)
    })
    const qs = params.toString()
    return qs ? `${base}?${qs}` : base
  } catch {
    return base
  }
}

export function getGoogleDriveEmbedUrl(input: string): string | null {
  const s = input.trim()

  if (s.includes('<iframe')) {
    const srcMatch = s.match(/src=["']([^"']*drive\.google\.com[^"']*)["']/)
    if (srcMatch) return getGoogleDriveEmbedUrl(srcMatch[1])
  }

  const m = s.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (!m) return null
  return `https://drive.google.com/file/d/${m[1]}/preview`
}

export function parseVturbEmbed(
  input: string,
): { type: 'iframe' | 'script'; embedUrl?: string; embedCode: string } | null {
  const s = input.trim()
  if (!s) return null

  // Plain URL
  if (s.startsWith('http') && !s.includes('<')) {
    return { type: 'iframe', embedUrl: s, embedCode: s }
  }

  // Pure iframe (no scripts)
  if (/^<iframe/i.test(s) && !s.includes('<script')) {
    const srcMatch = s.match(/src=["']([^"']+)["']/)
    return { type: 'iframe', embedUrl: srcMatch?.[1], embedCode: s }
  }

  // Script-based embed (includes new <vturb-smartplayer> format)
  if (s.includes('<script') || s.includes('<div') || s.includes('<vturb-smartplayer')) {
    return { type: 'script', embedCode: s }
  }

  return null
}

export function normalizeVideoEmbed(input: string, provider?: VideoProvider): NormalizedVideoEmbed {
  const s = input.trim()
  if (!s) return { provider: 'unknown', type: 'unknown', originalInput: input }

  const resolved: VideoProvider =
    provider && provider !== 'unknown' ? provider : detectVideoProvider(s)

  switch (resolved) {
    case 'youtube': {
      const embedUrl = getYouTubeEmbedUrl(s)
      if (!embedUrl) {
        return {
          provider: 'youtube',
          type: 'unknown',
          originalInput: input,
          error: 'Não foi possível extrair o ID do YouTube. Verifique o link.',
        }
      }
      return { provider: 'youtube', type: 'iframe', originalInput: input, embedUrl }
    }

    case 'loom': {
      const embedUrl = getLoomEmbedUrl(s)
      if (!embedUrl) {
        return {
          provider: 'loom',
          type: 'unknown',
          originalInput: input,
          error: 'Link do Loom inválido. Use loom.com/share/ID ou loom.com/embed/ID.',
        }
      }
      return { provider: 'loom', type: 'iframe', originalInput: input, embedUrl }
    }

    case 'google_drive': {
      const embedUrl = getGoogleDriveEmbedUrl(s)
      if (!embedUrl) {
        return {
          provider: 'google_drive',
          type: 'unknown',
          originalInput: input,
          error: 'Link do Google Drive inválido. Use drive.google.com/file/d/ID/view.',
        }
      }
      return { provider: 'google_drive', type: 'iframe', originalInput: input, embedUrl }
    }

    case 'vturb': {
      const parsed = parseVturbEmbed(s)
      if (!parsed) {
        return {
          provider: 'vturb',
          type: 'unknown',
          originalInput: input,
          error: 'Não foi possível interpretar o embed da VTurb. Cole o código completo.',
        }
      }
      return {
        provider: 'vturb',
        type: parsed.type,
        originalInput: input,
        embedUrl: parsed.embedUrl,
        embedCode: parsed.embedCode,
      }
    }

    default:
      return {
        provider: 'unknown',
        type: 'unknown',
        originalInput: input,
        error: 'Plataforma não reconhecida. Selecione a plataforma manualmente.',
      }
  }
}
