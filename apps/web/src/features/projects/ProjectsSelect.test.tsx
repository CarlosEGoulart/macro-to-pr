import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProjectsSelect } from './ProjectsSelect';
import { apiService } from '../auth/apiService';

// Mock de localStorage para ambiente jsdom (não disponível por padrão nesta versão)
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

const PROJECTS = [
  { id: 'proj-1', name: 'Projeto Alpha', repositoryName: 'alpha-repo', demandCount: 3 },
  { id: 'proj-2', name: 'Projeto Beta', repositoryName: 'beta-repo', demandCount: 1 },
];

function renderWithRouter(
  path = '/projects',
  demands?: ProjectsSelectPropsDemand[],
  navigate?: (to: string) => void,
) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/demands/:id" element={<div data-testid="demand-detail-page" />} />
        <Route path="/projects" element={<div data-testid="workspace-page" />} />
      </Routes>
      <ProjectsSelect demands={demands} navigate={navigate} />
    </MemoryRouter>
  );
}

describe('ProjectsSelect — tela de seletor de Projeto (CA4)', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      new Response(JSON.stringify({ data: PROJECTS }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );
    localStorage.setItem('token', 'token-teste');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('chama apiService.request com "/projects" ao montar', async () => {
    const requestSpy = vi.spyOn(apiService, 'request').mockResolvedValue(
      new Response(JSON.stringify({ data: PROJECTS }), { status: 200 }),
    );

    renderWithRouter();

    await waitFor(() => {
      expect(requestSpy).toHaveBeenCalledWith('/projects');
    });
  });

  it('exibe lista de projetos retornados pelo mock do GET /projects', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByTestId('project-card-proj-1')).toBeInTheDocument();
      expect(screen.getByTestId('project-card-proj-2')).toBeInTheDocument();
    });

    expect(screen.getByText('Projeto Alpha')).toBeInTheDocument();
    expect(screen.getByText('Projeto Beta')).toBeInTheDocument();
  });

  it('renderiza o nome, a quantidade de demandas e o botão "Selecionar" em cada card', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByTestId('project-card-proj-1')).toBeInTheDocument();
    });

    const firstCard = screen.getByTestId('project-card-proj-1');
    expect(firstCard).toBeInTheDocument();
    expect(screen.getByText('Projeto Alpha')).toBeInTheDocument();
    expect(screen.getByText(/3 demandas/)).toBeInTheDocument();
    expect(firstCard.querySelector('button')).toBeInTheDocument();
    expect(firstCard.querySelector('button')?.textContent).toBe('Selecionar');
  });

  it('marca o card selecionado com fundo rgba(97,100,241,0.04), borda 2px #6164F1 e badge "Selecionado"', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByTestId('project-card-proj-1')).toBeInTheDocument();
    });

    const selectButton = screen.getAllByRole('button', { name: /Selecionar/ })[0];
    fireEvent.click(selectButton);

    const selectedCard = screen.getByTestId('project-card-proj-1');
    expect(selectedCard).toHaveStyle('background-color: rgba(97, 100, 241, 0.04)');
    expect(selectedCard).toHaveStyle('border: 2px solid rgb(97, 100, 241)');
    expect(screen.getByText('Selecionado')).toBeInTheDocument();
  });
});

describe('ProjectsSelect — tratamento de erros (401, rede)', () => {
  const originalLocation = window.location;
  let locationHref = originalLocation.href;

  beforeEach(() => {
    localStorage.setItem('token', 'token-teste');
    locationHref = originalLocation.href;
    Object.defineProperty(window, 'location', {
      configurable: true,
      get: () => ({
        get href(): string {
          return locationHref;
        },
        set href(v: string) {
          locationHref = v;
        },
      }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    Object.defineProperty(window, 'location', { value: originalLocation, configurable: true });
  });

  it('401: limpa o token do localStorage e redireciona para /login quando GET /projects responde 401', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 401 }));

    renderWithRouter();

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull();
    });
    expect(locationHref).toContain('/login');
  });

  it('erro de rede: exibe mensagem de conexão quando GET /projects falha', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByTestId('projects-select-error')).toBeInTheDocument();
    });
    expect(screen.getByText(/conexão/i)).toBeInTheDocument();
    expect(screen.queryByTestId('projects-select-loading')).not.toBeInTheDocument();
  });
});

describe('HeaderUser — perfil do desenvolvedor no header', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'token-teste');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renderiza nome e avatar do desenvolvedor carregados da API (não hardcoded)', async () => {
    vi.spyOn(apiService, 'developerProfile').mockResolvedValue({
      id: 'dev-1',
      name: 'Ana Silva',
      email: 'ana@example.com',
      avatarUrl: 'https://github.com/ana.png',
    });

    // Mock /projects para não bloquear o render de ProjectsSelect
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      new Response(JSON.stringify({ data: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Ana Silva')).toBeInTheDocument();
    });

    // Avatar deve ser uma imagem com a URL da API
    const avatarImg = screen.getByAltText('Ana Silva');
    expect(avatarImg).toBeInTheDocument();
    expect(avatarImg).toHaveAttribute('src', 'https://github.com/ana.png');

    // Não deve mostrar o hardcode "Desenvolvedor" nem a letra "D"
    expect(screen.queryByText('Desenvolvedor')).not.toBeInTheDocument();
    expect(screen.getByText('Ana Silva')).toBeInTheDocument();
  });

  it('exibe fallback "Desenvolvedor" quando a API falha', async () => {
    vi.spyOn(apiService, 'developerProfile').mockRejectedValue(new Error('Erro de rede'));

    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      new Response(JSON.stringify({ data: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Desenvolvedor')).toBeInTheDocument();
    });

    // Deve mostrar a letra inicial como fallback de avatar
    expect(screen.getByText('D')).toBeInTheDocument();
  });
});

describe('ProjectsSelect — navegação e modais', () => {
  const DEMANDS = [
    { id: 'dem-1', title: 'Demanda Alpha', status: 'Draft', taskCount: 2 },
  ];

  beforeEach(() => {
    localStorage.setItem('token', 'token-teste');
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      new Response(JSON.stringify({ data: PROJECTS }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('clique em "+ Novo Projeto" abre o modal CreateProjectModal', async () => {
    renderWithRouter('/projects');

    await waitFor(() => {
      expect(screen.getByTestId('project-card-proj-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /\+ Novo Projeto/ }));

    await waitFor(() => {
      expect(screen.getByTestId('create-project-input-name')).toBeInTheDocument();
    });
  });

  // Bug B: clicar no input do modal não deve fechá-lo (o onClick do card deve
  // ficar fora de `style` para parar a propagação até o overlay).
  it('modal de criar projeto NÃO fecha ao clicar no campo de nome', async () => {
    renderWithRouter('/projects');

    await waitFor(() => {
      expect(screen.getByTestId('project-card-proj-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /\+ Novo Projeto/ }));

    await waitFor(() => {
      expect(screen.getByTestId('create-project-input-name')).toBeInTheDocument();
    });

    // Clicar no input não deve acionar o onClose do overlay (modal continua aberto).
    fireEvent.click(screen.getByTestId('create-project-input-name'));

    expect(screen.getByTestId('create-project-input-name')).toBeInTheDocument();
  });

  it('clique em "+ Nova Demanda" abre o modal CreateDemandModal', async () => {
    renderWithRouter('/projects');

    await waitFor(() => {
      expect(screen.getByTestId('project-card-proj-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /\+ Nova Demanda/ }));

    await waitFor(() => {
      expect(screen.getByTestId('create-demand-input-title')).toBeInTheDocument();
    });
  });

  it('clique em "Abrir Demanda →" navega para /demands/:id', async () => {
    const navigateSpy = vi.fn();

    render(
      <MemoryRouter initialEntries={['/projects']}>
        <Routes>
          <Route path="/demands/:id" element={<div data-testid="demand-detail-page" />} />
          <Route path="/projects" element={<div data-testid="workspace-page" />} />
        </Routes>
        <ProjectsSelect demands={DEMANDS} navigate={navigateSpy} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('project-card-proj-1')).toBeInTheDocument();
    });

    const selectButton = screen.getAllByRole('button', { name: /Selecionar/ })[0];
    fireEvent.click(selectButton);

    await waitFor(() => {
      expect(screen.getByText('Demanda Alpha')).toBeInTheDocument();
    });

    const allButtons = screen.getAllByRole('button');
    const openButton = allButtons.find((b) => String(b.textContent).includes('Abrir Demanda'));
    expect(openButton).toBeDefined();

    fireEvent.click(openButton!);

    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith('/demands/dem-1');
    });
  });

  // Bug C: os repositórios devem ser carregados via GET /projects/repositories
  // e passados ao modal de criar projeto (não hardcoded em []).
  it('carrega repositórios via GET /projects/repositories e os passa ao modal de criar projeto', async () => {
    const repos = [
      { id: 'repo-1', name: 'alpha-repo', fullName: 'owner/alpha-repo' },
      { id: 'repo-2', name: 'beta-repo', fullName: 'owner/beta-repo' },
    ];
    const requestSpy = vi.spyOn(apiService, 'request').mockImplementation(async (input: string) => {
      if (input === '/projects/repositories') {
        return new Response(JSON.stringify({ data: repos }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (input === '/projects') {
        return new Response(JSON.stringify({ data: PROJECTS }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ data: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    renderWithRouter('/projects');

    await waitFor(() => {
      expect(screen.getByTestId('project-card-proj-1')).toBeInTheDocument();
    });

    // O endpoint de repositórios deve ser consumido
    expect(requestSpy).toHaveBeenCalledWith('/projects/repositories');

    fireEvent.click(screen.getByRole('button', { name: /\+ Novo Projeto/ }));

    await waitFor(() => {
      expect(screen.getByTestId('create-project-input-name')).toBeInTheDocument();
    });

    const repoSelect = screen.getByTestId('create-project-select-repository');
    const options = repoSelect.querySelectorAll('option');
    expect(options.length).toBeGreaterThan(1);
    expect(screen.getByText('owner/alpha-repo')).toBeInTheDocument();
    expect(screen.getByText('owner/beta-repo')).toBeInTheDocument();
  });

  it('Sidebar destaca o item "Workspace" ativo na rota /projects', async () => {
    renderWithRouter('/projects');

    await waitFor(() => {
      expect(screen.getByText('Workspace')).toBeInTheDocument();
    });

    const workspaceItem = screen.getByText('Workspace').closest('a');
    expect(workspaceItem).toHaveStyle('background-color: rgba(97, 100, 241, 0.1)');
    expect(workspaceItem).toHaveStyle('color: rgb(97, 100, 241)');
  });

  it('Sidebar destaca o item "Detalhe da Demanda" ativo na rota /demands/:id', async () => {
    renderWithRouter('/demands/dem-1', DEMANDS);

    await waitFor(() => {
      expect(screen.getByText('Detalhe da Demanda')).toBeInTheDocument();
    });

    const demandaItem = screen.getByText('Detalhe da Demanda').closest('a');
    expect(demandaItem).toHaveStyle('background-color: rgba(97, 100, 241, 0.1)');
    expect(demandaItem).toHaveStyle('color: rgb(97, 100, 241)');
  });

  // Bug A: o item raiz "/" não deve ficar ativo em outras rotas (evita destaque
  // duplo, ex.: "Início / Acesso" e "Workspace" ao mesmo tempo).
  it('Sidebar destaca apenas o "Workspace" na rota /projects (Início não fica ativo)', async () => {
    renderWithRouter('/projects');

    await waitFor(() => {
      expect(screen.getByText('Workspace')).toBeInTheDocument();
    });

    const workspaceItem = screen.getByText('Workspace').closest('a');
    expect(workspaceItem).toHaveStyle('background-color: rgba(97, 100, 241, 0.1)');
    expect(workspaceItem).toHaveStyle('color: rgb(97, 100, 241)');

    const inicioItem = screen.getByText('Início / Acesso').closest('a');
    expect(inicioItem).not.toHaveStyle('background-color: rgba(97, 100, 241, 0.1)');
  });

  it('Sidebar destaca apenas o "Detalhe da Demanda" na rota /demands/:id', async () => {
    renderWithRouter('/demands/dem-1', DEMANDS);

    await waitFor(() => {
      expect(screen.getByText('Detalhe da Demanda')).toBeInTheDocument();
    });

    const demandaItem = screen.getByText('Detalhe da Demanda').closest('a');
    expect(demandaItem).toHaveStyle('background-color: rgba(97, 100, 241, 0.1)');

    const workspaceItem = screen.getByText('Workspace').closest('a');
    expect(workspaceItem).not.toHaveStyle('background-color: rgba(97, 100, 241, 0.1)');

    const inicioItem = screen.getByText('Início / Acesso').closest('a');
    expect(inicioItem).not.toHaveStyle('background-color: rgba(97, 100, 241, 0.1)');
  });
});

// Tipo auxiliar para a prop demands usada nos testes de navegação
interface ProjectsSelectPropsDemand {
  id: string;
  title: string;
  status: string;
  taskCount: number;
}

