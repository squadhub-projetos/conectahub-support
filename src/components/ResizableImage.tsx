import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { useRef, useState } from 'react'
import './ResizableImage.css'

// ── NodeView component ────────────────────────────────────────────────────────

function ResizableImageView({
  node,
  updateAttributes,
  selected,
}: NodeViewProps) {
  const { src, alt, title, width } = node.attrs as {
    src: string
    alt?: string
    title?: string
    width: string
  }
  const containerRef = useRef<HTMLDivElement>(null)
  const [resizing, setResizing] = useState(false)

  function startResize(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startW = containerRef.current?.offsetWidth ?? 400
    const parentW = containerRef.current?.parentElement?.offsetWidth ?? 800

    setResizing(true)

    function onMove(ev: MouseEvent) {
      const newW = Math.max(80, startW + (ev.clientX - startX))
      const pct = Math.round(Math.min(100, (newW / parentW) * 100))
      updateAttributes({ width: `${pct}%` })
    }

    function onUp() {
      setResizing(false)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  return (
    <NodeViewWrapper>
      <div
        ref={containerRef}
        data-drag-handle
        className={`rgi-wrap ${selected ? 'is-selected' : ''} ${resizing ? 'is-resizing' : ''}`}
        style={{ width }}
      >
        <img
          src={src}
          alt={alt ?? ''}
          title={title ?? ''}
          draggable={false}
          className="rgi-img"
        />

        {selected && (
          <>
            <div className="rgi-toolbar">
              <button type="button" title="Pequena (25%)" onClick={() => updateAttributes({ width: '25%' })}>S</button>
              <button type="button" title="Média (50%)" onClick={() => updateAttributes({ width: '50%' })}>M</button>
              <button type="button" title="Grande (75%)" onClick={() => updateAttributes({ width: '75%' })}>G</button>
              <button type="button" title="Largura total (100%)" onClick={() => updateAttributes({ width: '100%' })}>■</button>
              <span className="rgi-size-label">{width}</span>
            </div>

            <div
              className="rgi-handle rgi-handle--br"
              onMouseDown={startResize}
              title="Arrastar para redimensionar"
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  )
}

// ── TipTap Extension ──────────────────────────────────────────────────────────

export const ResizableImage = Node.create({
  name: 'image',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: '100%',
        parseHTML: (el) => {
          const style = el.getAttribute('style') ?? ''
          const m = style.match(/width:\s*([^;]+)/)
          return m ? m[1].trim() : (el.getAttribute('width') ?? '100%')
        },
        renderHTML: (attrs) => ({
          style: `width:${attrs.width as string};display:block;margin:12px auto;max-width:100%;border-radius:8px`,
        }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'img[src]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView)
  },
})
