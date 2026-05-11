import GuideContent from './GuideContent'
import './MockRichTextEditor.css'

interface MockRichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

const TOOLBAR_ACTIONS = [
  { label: 'H2', title: 'Título de seção' },
  { label: 'H3', title: 'Subtítulo' },
  { label: 'B', title: 'Negrito (**texto**)' },
  { label: '≡', title: 'Lista com marcadores (- item)' },
  { label: '1.', title: 'Lista numerada (1. item)' },
  { label: '🔗', title: 'Link' },
  { label: '🖼', title: 'Imagem' },
  { label: '▶', title: 'Vídeo' },
  { label: '❝', title: 'Destaque/Observação (> texto)' },
]

export default function MockRichTextEditor({ value, onChange }: MockRichTextEditorProps) {
  function handleInsert(label: string) {
    const snippets: Record<string, string> = {
      H2: '\n## Título de seção\n',
      H3: '\n### Subtítulo\n',
      B: '**texto em negrito**',
      '≡': '\n- Item 1\n- Item 2\n- Item 3\n',
      '1.': '\n1. Primeiro passo\n2. Segundo passo\n3. Terceiro passo\n',
      '🔗': '[texto do link](url)',
      '🖼': '![alt da imagem](url-da-imagem)',
      '▶': '\nhttps://www.youtube.com/embed/ID_DO_VIDEO\n',
      '❝': '\n> **Observação:** texto de destaque aqui.\n',
    }
    const snippet = snippets[label] ?? ''
    onChange(value + snippet)
  }

  return (
    <div className="rte-wrapper">
      <div className="rte-panes">
        <div className="rte-editor-pane">
          <div className="rte-toolbar">
            {TOOLBAR_ACTIONS.map((action) => (
              <button
                key={action.label}
                type="button"
                className="rte-tool-btn"
                title={action.title}
                onClick={() => handleInsert(action.label)}
              >
                {action.label}
              </button>
            ))}
          </div>
          <textarea
            className="rte-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Escreva o conteúdo do guia aqui...

Use:
## para título de seção
### para subtítulo
- para lista com marcadores
1. para lista numerada
> para blocos de destaque/observação
**texto** para negrito"
          />
        </div>

        <div className="rte-preview-pane">
          <div className="rte-preview-label">Pré-visualização</div>
          <div className="rte-preview-content">
            {value.trim() ? (
              <GuideContent content={value} />
            ) : (
              <p className="rte-preview-empty">O conteúdo aparecerá aqui conforme você escreve.</p>
            )}
          </div>
        </div>
      </div>

      <p className="rte-hint">
        Este editor será substituído por um editor rich text completo (TipTap ou similar) em versões futuras.
      </p>
    </div>
  )
}
