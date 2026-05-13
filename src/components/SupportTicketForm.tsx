import { useState } from 'react'
import { submitSupportTicket } from '../lib/queries'
import './SupportTicketForm.css'

const CATEGORIES = [
  'Erro na plataforma',
  'Dúvida operacional',
  'Configuração',
  'Integração',
  'Automação',
  'Pagamentos',
  'Outro',
]

const PRIORITIES = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
]

export default function SupportTicketForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValid = name.trim() && email.trim() && subject.trim() && category && priority && description.trim()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setLoading(true)
    setError(null)
    try {
      await submitSupportTicket({
        name: name.trim(),
        email: email.trim(),
        company: company.trim() || undefined,
        subject: subject.trim(),
        category,
        priority,
        description: description.trim(),
      })
      setSuccess(true)
      setName(''); setEmail(''); setCompany(''); setSubject('')
      setCategory(''); setPriority(''); setDescription('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar. Tente novamente.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="stf-section">
      <div className="stf-inner">
        <button
          type="button"
          className="stf-toggle"
          onClick={() => setIsOpen(o => !o)}
          aria-expanded={isOpen}
        >
          <div className="stf-header">
            <span className="stf-icon">🎧</span>
            <div>
              <h2 className="stf-title">Precisa de ajuda da nossa equipe?</h2>
              <p className="stf-subtitle">
                Abra um ticket quando houver um problema, erro ou situação que precise de acompanhamento do suporte.
              </p>
            </div>
          </div>
          <svg
            className={`stf-chevron${isOpen ? ' open' : ''}`}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <div className={`stf-body${isOpen ? ' open' : ''}`}>
          <div className="stf-body-inner">
            {success ? (
              <div className="stf-success">
                <span className="stf-success-icon">✅</span>
                <p className="stf-success-title">Ticket aberto com sucesso!</p>
                <p className="stf-success-hint">Nossa equipe vai analisar e entrar em contato em breve pelo e-mail informado.</p>
                <button type="button" className="stf-reset-btn" onClick={() => setSuccess(false)}>
                  Abrir outro ticket
                </button>
              </div>
            ) : (
              <form className="stf-form" onSubmit={handleSubmit} noValidate>
                <div className="stf-row">
                  <div className="stf-group">
                    <label className="stf-label" htmlFor="stf-name">Nome <span className="stf-req">*</span></label>
                    <input id="stf-name" type="text" className="stf-input" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" required />
                  </div>
                  <div className="stf-group">
                    <label className="stf-label" htmlFor="stf-email">E-mail <span className="stf-req">*</span></label>
                    <input id="stf-email" type="email" className="stf-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
                  </div>
                </div>

                <div className="stf-row">
                  <div className="stf-group">
                    <label className="stf-label" htmlFor="stf-company">Empresa</label>
                    <input id="stf-company" type="text" className="stf-input" value={company} onChange={e => setCompany(e.target.value)} placeholder="Nome da empresa" />
                  </div>
                  <div className="stf-group">
                    <label className="stf-label" htmlFor="stf-subject">Assunto <span className="stf-req">*</span></label>
                    <input id="stf-subject" type="text" className="stf-input" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Resumo do problema" required />
                  </div>
                </div>

                <div className="stf-row">
                  <div className="stf-group">
                    <label className="stf-label" htmlFor="stf-category">Categoria do problema <span className="stf-req">*</span></label>
                    <select id="stf-category" className="stf-select" value={category} onChange={e => setCategory(e.target.value)} required>
                      <option value="">Selecione…</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="stf-group">
                    <label className="stf-label" htmlFor="stf-priority">Prioridade <span className="stf-req">*</span></label>
                    <select id="stf-priority" className="stf-select" value={priority} onChange={e => setPriority(e.target.value)} required>
                      <option value="">Selecione…</option>
                      {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="stf-group">
                  <label className="stf-label" htmlFor="stf-description">Descrição do problema <span className="stf-req">*</span></label>
                  <textarea
                    id="stf-description"
                    className="stf-textarea"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Descreva o que está acontecendo, quando começou, quais passos você já tentou e qualquer informação relevante…"
                    rows={4}
                    required
                  />
                </div>

                {error && <p className="stf-error">⚠ {error}</p>}

                <div className="stf-footer">
                  <button type="submit" className="stf-submit" disabled={loading || !isValid}>
                    {loading ? 'Enviando…' : 'Abrir ticket de suporte'}
                  </button>
                  <span className="stf-footer-note">Respondemos em até 1 dia útil.</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
