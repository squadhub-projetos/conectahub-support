import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Placeholder from '@tiptap/extension-placeholder'
import { ResizableImage } from './ResizableImage'
import { useCallback, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import './RichGuideEditor.css'

interface RichGuideEditorProps {
  content: string
  guideId: string
  onChange: (html: string, json: unknown) => void
}

const MAX_IMG_BYTES = 5 * 1024 * 1024
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

// ── Toolbar icon helpers (inline SVG as components) ────────────────────────
function Icon({ d, viewBox = '0 0 24 24' }: { d: string; viewBox?: string }) {
  return (
    <svg width="15" height="15" viewBox={viewBox} fill="currentColor" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

const Icons = {
  Bold: () => <Icon d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3V6.5zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />,
  Italic: () => <Icon d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" />,
  Underline: () => <Icon d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" />,
  AlignLeft: () => <Icon d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z" />,
  AlignCenter: () => <Icon d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z" />,
  AlignRight: () => <Icon d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z" />,
  BulletList: () => <Icon d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />,
  OrderedList: () => <Icon d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />,
  Link: () => <Icon d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />,
  Image: () => <Icon d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />,
  Upload: () => <Icon d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />,
  Undo: () => <Icon d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />,
  Redo: () => <Icon d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" />,
  Blockquote: () => <Icon d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />,
  Code: () => <Icon d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />,
  HR: () => <Icon d="M19 11H5v2h14v-2z" />,
}

export default function RichGuideEditor({ content, guideId, onChange }: RichGuideEditorProps) {
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ horizontalRule: false }),
      HorizontalRule,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      ResizableImage,
      Placeholder.configure({ placeholder: 'Escreva o conteúdo do guia aqui…' }),
    ],
    content,
    onUpdate({ editor: e }) {
      onChange(e.getHTML(), e.getJSON())
    },
  })

  const uploadImage = useCallback(async (file: File) => {
    setUploadError(null)
    if (!ACCEPTED.includes(file.type)) {
      setUploadError('Formato não suportado. Use PNG, JPG, WebP ou GIF.')
      return
    }
    if (file.size > MAX_IMG_BYTES) {
      setUploadError('Imagem muito grande. Limite: 5 MB.')
      return
    }
    setUploading(true)
    try {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `guides/${guideId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('support-assets').upload(path, file)
      if (error) throw error
      const { data: urlData } = supabase.storage.from('support-assets').getPublicUrl(path)
      editor?.chain().focus().insertContent({ type: 'image', attrs: { src: urlData.publicUrl } }).run()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      const isPolicy = msg.toLowerCase().includes('policy') || msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('violat')
      setUploadError(isPolicy
        ? 'Não foi possível enviar a imagem. Verifique as permissões do bucket support-assets.'
        : `Erro no upload: ${msg}`)
    } finally {
      setUploading(false)
    }
  }, [editor, guideId])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadImage(file)
    e.target.value = ''
  }, [uploadImage])

  const openLinkDialog = useCallback(() => {
    setLinkUrl(editor?.getAttributes('link').href ?? '')
    setLinkDialogOpen(true)
  }, [editor])

  const applyLink = useCallback(() => {
    if (!editor) return
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run()
    } else {
      editor.chain().focus().setLink({ href: linkUrl.trim() }).run()
    }
    setLinkDialogOpen(false)
    setLinkUrl('')
  }, [editor, linkUrl])

  const insertImageUrl = useCallback(() => {
    const url = prompt('URL da imagem:')
    if (url?.trim()) editor?.chain().focus().insertContent({ type: 'image', attrs: { src: url.trim() } }).run()
  }, [editor])

  if (!editor) return null

  const currentStyle = editor.isActive('heading', { level: 1 }) ? 'h1'
    : editor.isActive('heading', { level: 2 }) ? 'h2'
    : editor.isActive('heading', { level: 3 }) ? 'h3'
    : editor.isActive('blockquote') ? 'blockquote'
    : 'paragraph'

  function applyStyle(val: string) {
    if (!editor) return
    switch (val) {
      case 'h1': editor.chain().focus().toggleHeading({ level: 1 }).run(); break
      case 'h2': editor.chain().focus().toggleHeading({ level: 2 }).run(); break
      case 'h3': editor.chain().focus().toggleHeading({ level: 3 }).run(); break
      case 'blockquote': editor.chain().focus().toggleBlockquote().run(); break
      default: editor.chain().focus().setParagraph().run()
    }
  }

  return (
    <div className="rge-wrap">

      {/* ── Toolbar ── */}
      <div className="rge-toolbar">

        {/* Style dropdown */}
        <select
          className="rge-style-select"
          value={currentStyle}
          onChange={(e) => applyStyle(e.target.value)}
          title="Estilo do texto"
        >
          <option value="paragraph">Parágrafo</option>
          <option value="h1">Título 1</option>
          <option value="h2">Título 2</option>
          <option value="h3">Título 3</option>
          <option value="blockquote">Citação</option>
        </select>

        <span className="rge-sep" />

        {/* B / I / U */}
        <button type="button" title="Negrito (Ctrl+B)" className={`rge-btn ${editor.isActive('bold') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleBold().run()}><Icons.Bold /></button>
        <button type="button" title="Itálico (Ctrl+I)" className={`rge-btn ${editor.isActive('italic') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleItalic().run()}><Icons.Italic /></button>
        <button type="button" title="Sublinhado (Ctrl+U)" className={`rge-btn ${editor.isActive('underline') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleUnderline().run()}><Icons.Underline /></button>

        <span className="rge-sep" />

        {/* Text color */}
        <label className="rge-color-btn" title="Cor do texto">
          <span className="rge-color-A" style={{ borderBottomColor: editor.getAttributes('textStyle').color ?? 'var(--accent)' }}>A</span>
          <input type="color" className="rge-color-input" defaultValue="#2563EB"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()} />
        </label>

        {/* Highlight */}
        <label className="rge-color-btn" title="Realçar texto">
          <span className="rge-hl-icon" style={{ backgroundColor: editor.isActive('highlight') ? '#FEF08A' : 'transparent' }}>✦</span>
          <input type="color" className="rge-color-input" defaultValue="#FEF08A"
            onChange={(e) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()} />
        </label>

        <span className="rge-sep" />

        {/* Alignment */}
        <button type="button" title="Alinhar à esquerda" className={`rge-btn ${editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`} onClick={() => editor.chain().focus().setTextAlign('left').run()}><Icons.AlignLeft /></button>
        <button type="button" title="Centralizar" className={`rge-btn ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`} onClick={() => editor.chain().focus().setTextAlign('center').run()}><Icons.AlignCenter /></button>
        <button type="button" title="Alinhar à direita" className={`rge-btn ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`} onClick={() => editor.chain().focus().setTextAlign('right').run()}><Icons.AlignRight /></button>

        <span className="rge-sep" />

        {/* Lists */}
        <button type="button" title="Lista com marcadores" className={`rge-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleBulletList().run()}><Icons.BulletList /></button>
        <button type="button" title="Lista numerada" className={`rge-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleOrderedList().run()}><Icons.OrderedList /></button>

        <span className="rge-sep" />

        {/* Extra blocks */}
        <button type="button" title="Bloco de código" className={`rge-btn ${editor.isActive('codeBlock') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Icons.Code /></button>
        <button type="button" title="Separador" className="rge-btn" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Icons.HR /></button>

        <span className="rge-sep" />

        {/* Link */}
        <button type="button" title="Link" className={`rge-btn ${editor.isActive('link') ? 'is-active' : ''}`} onClick={openLinkDialog}><Icons.Link /></button>

        {/* Image by URL */}
        <button type="button" title="Inserir imagem por URL" className="rge-btn" onClick={insertImageUrl}><Icons.Image /></button>

        {/* Upload */}
        <button type="button" title="Enviar imagem do computador" className="rge-btn" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <span className="rge-spin">⏳</span> : <Icons.Upload />}
        </button>

        <span className="rge-sep" />

        {/* Undo / Redo */}
        <button type="button" title="Desfazer (Ctrl+Z)" className="rge-btn" onClick={() => editor.chain().focus().undo().run()}><Icons.Undo /></button>
        <button type="button" title="Refazer (Ctrl+Y)" className="rge-btn" onClick={() => editor.chain().focus().redo().run()}><Icons.Redo /></button>
      </div>

      {/* ── Link dialog ── */}
      {linkDialogOpen && (
        <div className="rge-link-dialog">
          <input
            className="rge-link-input"
            type="url"
            placeholder="https://..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') applyLink(); if (e.key === 'Escape') setLinkDialogOpen(false) }}
            autoFocus
          />
          <button type="button" className="rge-link-ok" onClick={applyLink}>Aplicar</button>
          <button type="button" className="rge-link-cancel" onClick={() => setLinkDialogOpen(false)}>Cancelar</button>
        </div>
      )}

      {/* ── Upload error ── */}
      {uploadError && (
        <div className="rge-upload-error">
          ⚠ {uploadError}
          <button type="button" onClick={() => setUploadError(null)} className="rge-upload-error-close">✕</button>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED.join(',')}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* ── Editor canvas ── */}
      <EditorContent editor={editor} className="rge-editor" />
    </div>
  )
}
