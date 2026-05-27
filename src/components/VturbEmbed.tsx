import { useEffect, useRef } from 'react'
import './VturbEmbed.css'

interface VturbEmbedProps {
  embedCode: string
  title?: string
}

interface ParsedScript {
  src?: string
  inline?: string
  dataAttrs: Record<string, string>
}

interface ParsedEmbed {
  html: string
  scripts: ParsedScript[]
}

function parseEmbedCode(code: string): ParsedEmbed {
  const scripts: ParsedScript[] = []
  const scriptRegex = /<script([^>]*)>([\s\S]*?)<\/script>/gi

  const html = code.replace(scriptRegex, (_, attrsStr, content) => {
    const dataAttrs: Record<string, string> = {}
    const attrRegex = /([\w-]+)=["']([^"']*)["']/g
    let m: RegExpExecArray | null
    let src: string | undefined

    while ((m = attrRegex.exec(attrsStr as string)) !== null) {
      if (m[1] === 'src') {
        src = m[2]
      } else {
        dataAttrs[m[1]] = m[2]
      }
    }

    const inline = (content as string).trim() || undefined
    scripts.push({ src, inline, dataAttrs })
    return ''
  })

  return { html: html.trim(), scripts }
}

export default function VturbEmbed({ embedCode, title }: VturbEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !embedCode) return

    const { html, scripts } = parseEmbedCode(embedCode)
    container.innerHTML = html

    const addedScripts: HTMLScriptElement[] = []

    for (const s of scripts) {
      if (s.src && document.querySelector(`script[src="${s.src}"]`)) continue

      const el = document.createElement('script')
      if (s.src) {
        el.src = s.src
        el.async = true
        for (const [k, v] of Object.entries(s.dataAttrs)) {
          el.setAttribute(k, v)
        }
      } else if (s.inline) {
        el.textContent = s.inline
      }
      document.body.appendChild(el)
      addedScripts.push(el)
    }

    return () => {
      if (container) container.innerHTML = ''
      for (const el of addedScripts) el.remove()
    }
  }, [embedCode])

  return (
    <div
      ref={containerRef}
      className="vturb-embed"
      aria-label={title ?? 'Vídeo VTurb'}
    />
  )
}
