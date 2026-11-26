import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('ProjectsSelect — tela de seletor de Projeto (CA4)', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
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

    render(<ProjectsSelect />);

    await waitFor(() => {
      expect(requestSpy).toHaveBeenCalledWith('/projects');
    });
  });

  it('exibe lista de projetos retornados pelo mock do GET /projects', async () => {
    render(<ProjectsSelect />);

    await waitFor(() => {
      expect(screen.getByTestId('project-card-proj-1')).toBeInTheDocument();
      expect(screen.getByTestId('project-card-proj-2')).toBeInTheDocument();
    });

    expect(screen.getByText('Projeto Alpha')).toBeInTheDocument();
    expect(screen.getByText('Projeto Beta')).toBeInTheDocument();
  });

  it('renderiza o nome, a quantidade de demandas e o botão "Selecionar" em cada card', async () => {
    render(<ProjectsSelect />);

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
    render(<ProjectsSelect />);

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
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    render(<ProjectsSelect />);

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

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    render(<ProjectsSelect />);

    await waitFor(() => {
      expect(screen.getByText('Desenvolvedor')).toBeInTheDocument();
    });

    // Deve mostrar a letra inicial como fallback de avatar
    expect(screen.getByText('D')).toBeInTheDocument();
  });
});
