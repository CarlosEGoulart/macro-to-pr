import { StrictMode, useCallback, useState, createContext, useContext, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import type { Role } from './features/auth/Menu'

interface AuthContextType {
  role: Role | null
  login: (role: Role) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth só pode ser usado dentro de um AuthProvider')
  }
  return ctx
}

/**
 * Provedor de autenticação (CA5/CA6).
 * - `role`: papel do usuário logado ('Developer' | 'Admin'), nulo quando não autenticado.
 * - `login(role)`: define o papel após o fluxo OAuth (fora de escopo desta tarefa).
 * - `logout()`: limpa o papel; o token é limpo pela camada de serviço em 401.
 *
 * O `apiService` (camada única de serviço) anexa `Authorization: Bearer <token>`
 * a toda chamada e, ao receber 401, remove o token e redireciona para `/login`
 * em um só lugar.
 */
function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null)

  const login = useCallback((r: Role) => {
    setRole(r)
  }, [])

  const logout = useCallback(() => {
    setRole(null)
    localStorage.removeItem('token')
  }, [])

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)

export { useAuth }
