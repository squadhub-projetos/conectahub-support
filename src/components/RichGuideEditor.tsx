import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Placeholder from '@tiptap/extension-placeholder'
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
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder: 'Escreva o conteúdo do guia aqui…' }),
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML(), editor.getJSON())
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
      editor?.chain().focus().setImage({ src: urlData.publicUrl }).run()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setUploadError(`Não foi possível enviar a imagem. ${msg.includes('policy') || msg.includes('permission') ? 'Verifique as permissões do bucket support-assets.' : msg}`)
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
    const prev = editor?.getAttributes('link').href ?? ''
    setLinkUrl(prev)
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
    if (url) editor?.chain().focus().setImage({ src: url }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div className="rge-wrap">
      <div className="rge-toolbar">
        <button type="button" title="Parágrafo" className={`rge-btn ${editor.isActive('paragraph') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().setParagraph().run()}>P</button>
        <button type="button" title="Título H2" className={`rge-btn ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button type="button" title="Título H3" className={`rge-btn ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
        <span className="rge-sep" />
        <button type="button" title="Negrito" className={`rge-btn rge-btn--icon ${editor.isActive('bold') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleBold().run()}><strong>B</strong></button>
        <button type="button" title="Itálico" className={`rge-btn rge-btn--icon ${editor.isActive('italic') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></button>
        <span className="rge-sep" />
        <button type="button" title="Lista com marcadores" className={`rge-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleBulletList().run()}>• Lista</button>
        <button type="button" title="Lista numerada" className={`rge-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. Lista</button>
        <span className="rge-sep" />
        <button type="button" title="Destaque/Citação" className={`rge-btn ${editor.isActive('blockquote') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleBlockquote().run()}>❝</button>
        <button type="button" title="Código" className={`rge-btn ${editor.isActive('codeBlock') ? 'is-active' : ''}`} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>{'</>'}</button>
        <button type="button" title="Separador" className="rge-btn" onClick={() => editor.chain().focus().setHorizontalRule().run()}>—</button>
        <span className="rge-sep" />
        <button type="button" title="Link" className={`rge-btn ${editor.isActive('link') ? 'is-active' : ''}`} onClick={openLinkDialog}>🔗</button>
        <button type="button" title="Imagem por URL" className="rge-btn" onClick={insertImageUrl}>🖼 URL</button>
        <button type="button" title="Upload de imagem" className="rge-btn" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? '⏳' : '⬆ Upload'}
        </button>
        <span className="rge-sep" />
        <button type="button" title="Desfazer" className="rge-btn" onClick={() => editor.chain().focus().undo().run()}>↩</button>
        <button type="button" title="Refazer" className="rge-btn" onClick={() => editor.chain().focus().redo().run()}>↪</button>
      </div>

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

      {uploadError && (
        <div className="rge-upload-error">⚠ {uploadError}</div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED.join(',')}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <EditorContent editor={editor} className="rge-editor" />
    </div>
  )
}
