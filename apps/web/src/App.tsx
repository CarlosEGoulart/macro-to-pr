import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { Login } from './features/auth/Login.tsx';
import { ProjectsSelect } from './features/projects/ProjectsSelect';
import { DemandDetail } from './features/demands/DemandDetail';

/**
 * Shell da aplicação com roteamento (React Router v6).
 *
 * - Sem token: qualquer rota renderiza o Login.
 * - Com token: /projects é o Workspace (seletor de Projetos/Demandas) e
 *   /demands/:id renderiza o detalhe de uma Demanda.
 */
export default function App() {
  const token = localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        {!token ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            {/* Já autenticado: acessar /login volta para o Workspace */}
            <Route path="/login" element={<Navigate to="/projects" replace />} />
            <Route path="/projects" element={<ProjectsSelect />} />
            <Route path="/demands/:id" element={<DemandDetail />} />
            <Route path="/" element={<Navigate to="/projects" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}
