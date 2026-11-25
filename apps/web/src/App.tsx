import { useEffect } from 'react';
import { Login } from './features/auth/Login.tsx';

/**
 * Landing page do Macro2PR.
 *
 * Redireciona uma única vez para /login quando não está naquela URL;
 * caso contrário, renderiza <Login />.
 * Sem BrowserRouter, sem Menu, sem rotas, sem módulo extra.
 */
export default function App() {
  useEffect(() => {
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }, []);

  if (window.location.pathname === '/login') {
    return <Login />;
  }

  return null;
}
