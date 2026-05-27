import { normalizeVideoEmbed } from '../utils/videoEmbed'
import VturbEmbed from './VturbEmbed'
import './VideoEmbed.css'

interface VideoEmbedProps {
  videoUrl?: string | null
  metadata?: Record<string, unknown> | null
  title?: string
}

export default function VideoEmbed({ videoUrl, metadata, title }: VideoEmbedProps) {
  const provider = metadata?.video_provider as string | undefined
  const embedCode = metadata?.video_embed_code as string | undefined
  const embedUrl = metadata?.video_embed_url as string | undefined

  // VTurb script embed from metadata
  if (provider === 'vturb' && embedCode && !embedUrl) {
    return (
      <div className="video-embed">
        <VturbEmbed embedCode={embedCode} title={title} />
      </div>
    )
  }

  // Iframe embed from metadata (YouTube, Loom, Drive, or VTurb iframe)
  if (embedUrl) {
    return (
      <div className="video-embed video-embed--16-9">
        <iframe
          src={embedUrl}
          title={title ?? 'Vídeo'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    )
  }

  // Fallback: normalize video_url at render time (supports old guides without metadata)
  if (videoUrl) {
    const normalized = normalizeVideoEmbed(videoUrl)

    if (normalized.embedUrl) {
      return (
        <div className="video-embed video-embed--16-9">
          <iframe
            src={normalized.embedUrl}
            title={title ?? 'Vídeo'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      )
    }

    if (normalized.provider === 'vturb' && normalized.embedCode) {
      return (
        <div className="video-embed">
          <VturbEmbed embedCode={normalized.embedCode} title={title} />
        </div>
      )
    }
  }

  return null
}
