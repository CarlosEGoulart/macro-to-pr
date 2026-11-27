import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { DemandDetail } from './DemandDetail';
import { apiService } from '../auth/apiService';

const localStorageStore: Record<string, string> = {};
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (key: string) => localStorageStore[key] ?? null,
    setItem: (key: string, value: string) => { localStorageStore[key] = value; },
    clear: () => { Object.keys(localStorageStore).forEach((k) => delete localStorageStore[k]); },
    removeItem: (key: string) => { delete localStorageStore[key]; },
    length: 0,
    key: () => null,
  },
  writable: true,
});

const DEMAND_FROM_API = {
  id: 'dem-1',
  title: 'Implementar login',
  description: 'Criar tela de login com OAuth GitHub',
  type: 'feature',
  priority: 'high',
  status: 'Draft',
  project: {
    id: 'proj-1',
    name: 'Projeto Alpha',
    repository: { id: 'repo-1', name: 'alpha-repo' },
  },
  createdAt: '2026-01-01T00:00:00Z',
};

let probeNavigate: any;
function NavProbe() {
  probeNavigate = useNavigate();
  return null;
}

function renderWithRouter(path: string) {
  probeNavigate = undefined;
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/demands/:id" element={<><NavProbe /><DemandDetail /></>} />
        <Route
          path="/projects"
          element={<div data-testid="workspace-page">Workspace</div>}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('DemandDetail — tela de detalhe da demanda', () => {
  it('DIAG: useNavigate está disponível dentro de MemoryRouter+Routes', () => {
    renderWithRouter('/demands/dem-1');
    expect(typeof probeNavigate).toBe('function');
  });

  beforeEach(() => {
    localStorage.setItem('token', 'token-teste');
    vi.spyOn(apiService, 'getDemandById').mockResolvedValue(DEMAND_FROM_API);
    // Isola o Header (HeaderUser chama developerProfile -> fetch) dos testes.
    vi.spyOn(apiService, 'developerProfile').mockResolvedValue({
      id: 'dev-1',
      name: 'Dev Teste',
      email: 'dev@test.com',
      avatarUrl: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('busca a demanda via GET /demands/:id e renderiza o título', async () => {
    const getDemandSpy = vi.mocked(apiService.getDemandById);

    renderWithRouter('/demands/dem-1');

    await waitFor(() => {
      expect(getDemandSpy).toHaveBeenCalledWith('dem-1');
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Implementar login' })).toBeInTheDocument();
    });
  });

  it('renderiza o status da demanda', async () => {
    renderWithRouter('/demands/dem-1');

    await waitFor(() => {
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });
  });

  it('renderiza os metadados de projeto e repositório', async () => {
    renderWithRouter('/demands/dem-1');

    await waitFor(() => {
      expect(screen.getByText('Projeto Alpha')).toBeInTheDocument();
      expect(screen.getByText('alpha-repo')).toBeInTheDocument();
    });
  });

  it('renderiza as tabs Plano, Tarefas e Pull Request', async () => {
    renderWithRouter('/demands/dem-1');

    await waitFor(() => {
      expect(screen.getByText('Plano')).toBeInTheDocument();
      expect(screen.getByText('Pull Request')).toBeInTheDocument();
      // A tab "Tarefas" compartilha o texto com o heading da seção; usa-se
      // getAllByText para confirmar que a tab está renderizada.
      expect(screen.getAllByText('Tarefas').length).toBeGreaterThanOrEqual(2);
    });
  });

  it('renderiza as tarefas da demanda', async () => {
    renderWithRouter('/demands/dem-1');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Tarefas/ })).toBeInTheDocument();
    });
  });

  it('link "Voltar ao Workspace" navega de volta para /projects', async () => {
    renderWithRouter('/demands/dem-1');

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Voltar ao Workspace/ })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('link', { name: /Voltar ao Workspace/ }));

    await waitFor(() => {
      expect(screen.getByTestId('workspace-page')).toBeInTheDocument();
    });
  });
});
