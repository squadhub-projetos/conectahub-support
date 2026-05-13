import { useState } from 'react'
import { submitSupportRequest } from '../lib/queries'
import './SupportRequestForm.css'

export default function SupportRequestForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !topic.trim()) return
    setLoading(true)
    setError(null)
    try {
      await submitSupportRequest({ name: name.trim(), email: email.trim(), topic: topic.trim(), description: description.trim() })
      setSuccess(true)
      setName(''); setEmail(''); setTopic(''); setDescription('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar. Tente novamente.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="srf-section">
      <div className="srf-inner">
        <button
          type="button"
          className="srf-toggle"
          onClick={() => setIsOpen(o => !o)}
          aria-expanded={isOpen}
        >
          <div className="srf-header">
            <span className="srf-icon">💬</span>
            <div>
              <h2 className="srf-title">Não encontrou o que precisava?</h2>
              <p className="srf-subtitle">Peça um novo guia ou tutorial para nossa equipe. Respondemos em até 2 dias úteis.</p>
            </div>
          </div>
          <svg
            className={`srf-chevron${isOpen ? ' open' : ''}`}
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

        <div className={`srf-body${isOpen ? ' open' : ''}`}>
          <div className="srf-body-inner">
            {success ? (
              <div className="srf-success">
                <span className="srf-success-icon">✅</span>
                <p className="srf-success-title">Solicitação enviada com sucesso!</p>
                <p className="srf-success-hint">Nossa equipe vai analisar o pedido e criar o conteúdo em breve.</p>
                <button type="button" className="srf-reset-btn" onClick={() => setSuccess(false)}>
                  Fazer outro pedido
                </button>
              </div>
            ) : (
              <form className="srf-form" onSubmit={handleSubmit} noValidate>
                <div className="srf-row">
                  <div className="srf-group">
                    <label className="srf-label" htmlFor="srf-name">Seu nome <span className="srf-req">*</span></label>
                    <input id="srf-name" type="text" className="srf-input" value={name} onChange={e => setName(e.target.value)} placeholder="João Silva" required />
                  </div>
                  <div className="srf-group">
                    <label className="srf-label" htmlFor="srf-email">E-mail <span className="srf-req">*</span></label>
                    <input id="srf-email" type="email" className="srf-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="joao@empresa.com" required />
                  </div>
                </div>

                <div className="srf-group">
                  <label className="srf-label" htmlFor="srf-topic">Tema / assunto desejado <span className="srf-req">*</span></label>
                  <input id="srf-topic" type="text" className="srf-input" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Ex: Como configurar automações de e-mail" required />
                </div>

                <div className="srf-group">
                  <label className="srf-label" htmlFor="srf-desc">Descrição da necessidade</label>
                  <textarea id="srf-desc" className="srf-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Explique brevemente o que você gostaria de aprender ou qual dificuldade está enfrentando…" rows={3} />
                </div>

                {error && <p className="srf-error">⚠ {error}</p>}

                <button type="submit" className="srf-submit" disabled={loading || !name.trim() || !email.trim() || !topic.trim()}>
                  {loading ? 'Enviando…' : 'Enviar solicitação'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
