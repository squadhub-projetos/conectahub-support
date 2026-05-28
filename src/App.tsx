import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import EditorLayout from './components/EditorLayout'
import SupportHome from './pages/SupportHome'
import GuidePage from './pages/GuidePage'
import ClientGuidePage from './pages/ClientGuidePage'
import EditorHome from './pages/EditorHome'
import GuideEditor from './pages/GuideEditor'
import AdminGuides from './pages/AdminGuides'
import AdminGuideEdit from './pages/AdminGuideEdit'
import AdminGuidePreviewPage from './pages/AdminGuidePreviewPage'
import './App.css'

function PublicLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/suporte" replace />} />

        <Route element={<PublicLayout />}>
          <Route path="/suporte" element={<SupportHome />} />
          <Route path="/suporte/:slug" element={<GuidePage />} />
          <Route path="/suporte/guia/:id" element={<ClientGuidePage />} />
          <Route path="/admin/guides" element={<AdminGuides />} />
          <Route path="/admin/guides/:id/preview" element={<AdminGuidePreviewPage />} />
        </Route>

        {/* Edit page has its own standalone layout */}
        <Route path="/admin/guides/:id/edit" element={<AdminGuideEdit />} />

        {/* Legacy editor routes */}
        <Route
          path="/editor"
          element={<EditorLayout><EditorHome /></EditorLayout>}
        />
        <Route
          path="/editor/novo"
          element={<EditorLayout><GuideEditor /></EditorLayout>}
        />
        <Route
          path="/editor/:id"
          element={<EditorLayout><GuideEditor /></EditorLayout>}
        />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
