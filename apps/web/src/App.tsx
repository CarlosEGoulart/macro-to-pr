import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { useAuth } from './main.tsx'
import { Menu } from './features/auth/Menu'
import { Login } from './features/auth/Login'
import { apiService } from './features/auth/apiService'

/**
 * Redireciona para /login quando o usuário não está autenticado.
 * Rotas protegidas envolvem seu conteúdo neste componente.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { role } = useAuth()
  if (!role) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

/**
 * Página protegida de exemplo (fora de escopo: rotas completas de admin).
 * Demonstra CA5: toda chamada à API passa por `apiService.request()`, que anexa
 * `Authorization: Bearer <token>` em um lugar só. Demonstra CA6: a resposta 401
 é tratada pelo `apiService` (limpa token e volta ao login).
 */
function AdminPing() {
  const [status, setStatus] = useState<number | null>(null)

  useEffect(() => {
    apiService.request('/api/admin/ping').then((response) => {
      setStatus(response.status)
    })
  }, [])

  return <p>Status do /admin/ping: {status ?? 'carregando...'}</p>
}

function Home() {
  const { role, login, logout } = useAuth()

  return (
    <section id="home">
      <h1>Macro2PR</h1>
      {role ? (
        <>
          <p>Logado como <strong>{role}</strong>.</p>
          <button type="button" onClick={logout}>
            Sair
          </button>
        </>
      ) : (
        <div>
          <p>Você não está logado.</p>
          <button type="button" onClick={() => login('Developer')}>
            Entrar como Desenvolvedor
          </button>
          <button type="button" onClick={() => login('Admin')}>
            Entrar como Admin
          </button>
        </div>
      )}
    </section>
  )
}

export default function App() {
  const { role } = useAuth()

  return (
    <BrowserRouter>
      {/* Layout: menu visível em toda a aplicação, RBAC pelo papel do usuário. */}
      <Menu role={role ?? 'Developer'} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin/ping"
          element={
            <ProtectedRoute>
              <AdminPing />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
