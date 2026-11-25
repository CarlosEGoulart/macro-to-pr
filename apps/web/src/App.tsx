import { Login } from './features/auth/Login.tsx';
import { ProjectsSelect } from './features/projects/ProjectsSelect';

/**
 * Landing page do Macro2PR.
 *
 * Se o usuário não está autenticado (não há token em localStorage),
 * renderiza a tela de login. Se já está autenticado, renderiza o
 * seletor de Projetos (Workspace), que é o ponto de partida do fluxo
 * do usuário logado.
 *
 * Sem BrowserRouter, sem Menu, sem rotas, sem módulo extra.
 */
export default function App() {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Login />;
  }

  return <ProjectsSelect />;
}
