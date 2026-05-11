import { Link } from 'react-router-dom'
import { mockGuides } from '../data/mockGuides'
import './EditorHome.css'

export default function EditorHome() {
  return (
    <div className="editor-home">
      <div className="editor-page-header">
        <div>
          <h1 className="editor-page-title">Editor de guias</h1>
          <p className="editor-page-subtitle">
            {mockGuides.length} guias cadastrados · {mockGuides.filter((g) => g.status === 'published').length} publicados · {mockGuides.filter((g) => g.status === 'draft').length} rascunhos
          </p>
        </div>
        <Link to="/editor/novo" className="new-guide-btn">+ Novo guia</Link>
      </div>

      <div className="editor-table-wrap">
        <table className="editor-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Categoria</th>
              <th>Status</th>
              <th>Atualizado</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {mockGuides.map((guide) => (
              <tr key={guide.id}>
                <td className="td-title">
                  <span className="table-title">{guide.title}</span>
                  <span className="table-slug">{guide.slug}</span>
                </td>
                <td>
                  <span className="table-category">{guide.category}</span>
                </td>
                <td>
                  <span className={`status-badge status-badge--${guide.status}`}>
                    {guide.status === 'published' ? 'Publicado' : 'Rascunho'}
                  </span>
                </td>
                <td className="td-date">
                  {new Date(guide.updatedAt).toLocaleDateString('pt-BR')}
                </td>
                <td>
                  <div className="table-actions">
                    <Link to={`/editor/${guide.id}`} className="action-btn action-btn--edit">
                      Editar
                    </Link>
                    <Link
                      to={`/suporte/${guide.slug}`}
                      className="action-btn action-btn--view"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Visualizar
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
