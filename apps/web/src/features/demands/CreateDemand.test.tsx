import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { CreateDemandModal } from './CreateDemandModal';
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

const PROJECTS = [
  { id: 'proj-1', name: 'Projeto Alpha' },
  { id: 'proj-2', name: 'Projeto Beta' },
];

const DEMAND_DATA = {
  title: 'Implementar login',
  description: 'Criar tela de login com OAuth GitHub',
  type: 'feature',
  priority: 'high',
  projectId: 'proj-1',
};

const CREATED_DEMAND = {
  id: 'dem-1',
  ...DEMAND_DATA,
};

function mockFetchProjects() {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ data: PROJECTS }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  );
}

describe('CreateDemandModal — CA1 e CA2', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'token-teste');
    vi.spyOn(apiService, 'createDemand').mockResolvedValue(CREATED_DEMAND);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('não chama createDemand e exibe erro quando campo obrigatório está vazio', async () => {
    const createDemandSpy = vi.mocked(apiService.createDemand);

    render(<CreateDemandModal onClose={vi.fn()} />);

    const titleInput = screen.getByTestId('create-demand-input-title');
    const descInput = screen.getByTestId('create-demand-input-description');
    const typeSelect = screen.getByTestId('create-demand-select-type');
    const prioritySelect = screen.getByTestId('create-demand-select-priority');
    const submitButton = screen.getByRole('button', { name: /Criar Demanda/ });

    fireEvent.change(titleInput, { target: { value: '' } });
    fireEvent.change(descInput, { target: { value: DEMAND_DATA.description } });
    fireEvent.change(typeSelect, { target: { value: DEMAND_DATA.type } });
    fireEvent.change(prioritySelect, { target: { value: DEMAND_DATA.priority } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('create-demand-error')).toBeInTheDocument();
    });

    expect(createDemandSpy).not.toHaveBeenCalled();
  });

  it('chama createDemand com os dados e o token, recebendo o objeto completo com id', async () => {
    const createDemandSpy = vi.mocked(apiService.createDemand);

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: PROJECTS }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    render(<CreateDemandModal onClose={vi.fn()} />);

    const titleInput = screen.getByTestId('create-demand-input-title');
    const descInput = screen.getByTestId('create-demand-input-description');
    const typeSelect = screen.getByTestId('create-demand-select-type');
    const prioritySelect = screen.getByTestId('create-demand-select-priority');
    const submitButton = screen.getByRole('button', { name: /Criar Demanda/ });

    fireEvent.change(titleInput, { target: { value: DEMAND_DATA.title } });
    fireEvent.change(descInput, { target: { value: DEMAND_DATA.description } });
    fireEvent.change(typeSelect, { target: { value: DEMAND_DATA.type } });
    fireEvent.change(prioritySelect, { target: { value: DEMAND_DATA.priority } });

    await waitFor(() => {
      expect(screen.getByTestId('create-demand-select-project')).toBeInTheDocument();
    });
    const projectSelect = screen.getByTestId('create-demand-select-project');
    fireEvent.change(projectSelect, { target: { value: 'proj-1' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createDemandSpy).toHaveBeenCalledTimes(1);
    });

    const callArg = createDemandSpy.mock.calls[0][0];
    expect(callArg).toEqual({
      title: DEMAND_DATA.title,
      description: DEMAND_DATA.description,
      type: DEMAND_DATA.type,
      priority: DEMAND_DATA.priority,
      projectId: 'proj-1',
    });

    await waitFor(() => {
      expect(screen.getByTestId('create-demand-created-id')).toBeInTheDocument();
      expect(screen.getByText('Demanda criada com ID: dem-1')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('create-demand-error')).not.toBeInTheDocument();
  });

  it('envia cabeçalho Authorization: Bearer <token> ao chamar createDemand', async () => {
    vi.restoreAllMocks();
    localStorage.setItem('token', 'token-teste');

    let demandAuthHeader: string | null = null;
    vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/projects')) {
        return Promise.resolve(
          new Response(JSON.stringify({ data: PROJECTS }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }
      if (url.includes('/demands')) {
        const h = init?.headers;
        demandAuthHeader = h instanceof Headers ? h.get('Authorization') : String(h?.['Authorization'] ?? null);
      }
      return Promise.resolve(
        new Response(JSON.stringify(CREATED_DEMAND), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    render(<CreateDemandModal onClose={vi.fn()} />);

    const titleInput = screen.getByTestId('create-demand-input-title');
    const descInput = screen.getByTestId('create-demand-input-description');
    const typeSelect = screen.getByTestId('create-demand-select-type');
    const prioritySelect = screen.getByTestId('create-demand-select-priority');
    const submitButton = screen.getByRole('button', { name: /Criar Demanda/ });

    fireEvent.change(titleInput, { target: { value: DEMAND_DATA.title } });
    fireEvent.change(descInput, { target: { value: DEMAND_DATA.description } });
    fireEvent.change(typeSelect, { target: { value: DEMAND_DATA.type } });
    fireEvent.change(prioritySelect, { target: { value: DEMAND_DATA.priority } });

    await waitFor(() => {
      expect(screen.getByTestId('create-demand-select-project')).toBeInTheDocument();
    });
    const projectSelect = screen.getByTestId('create-demand-select-project');
    fireEvent.change(projectSelect, { target: { value: 'proj-1' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(demandAuthHeader).not.toBeNull();
    });

    expect(demandAuthHeader).toBe('Bearer token-teste');
  });
});

describe('CreateDemandModal — CA4', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'token-teste');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renderiza um <select> de projetos carregado via GET /projects', async () => {
    vi.spyOn(apiService, 'createDemand').mockResolvedValue(CREATED_DEMAND);

    let projectsAuthHeader: string | null = null;
    vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/projects')) {
        const h = init?.headers;
        projectsAuthHeader = h instanceof Headers ? h.get('Authorization') : String(h?.['Authorization'] ?? null);
      }
      return Promise.resolve(
        new Response(JSON.stringify({ data: PROJECTS }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    render(<CreateDemandModal onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('create-demand-select-project')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Projeto Alpha')).toBeInTheDocument();
      expect(screen.getByText('Projeto Beta')).toBeInTheDocument();
    });

    expect(projectsAuthHeader).toBe('Bearer token-teste');
  });

  it('não exibe select de projeto enquanto carrega', async () => {
    vi.spyOn(apiService, 'createDemand').mockResolvedValue(CREATED_DEMAND);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    render(<CreateDemandModal onClose={vi.fn()} />);

    expect(screen.queryByTestId('create-demand-select-project')).not.toBeInTheDocument();
    expect(screen.getByText(/Carregando projetos/)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId('create-demand-select-project')).toBeInTheDocument();
    });
  });

  it('NC-01: não fecha o modal quando createDemand retorna erro HTTP (ex: 400)', async () => {
    const onClose = vi.fn();

    // Limpa mocks anteriores e configura fetch para retornar projetos em /projects e 400 em /demands
    vi.restoreAllMocks();
    vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/projects')) {
        return Promise.resolve(
          new Response(JSON.stringify({ data: PROJECTS }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify({ message: 'Campo inválido' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    render(<CreateDemandModal onClose={onClose} />);

    const titleInput = screen.getByTestId('create-demand-input-title');
    const descInput = screen.getByTestId('create-demand-input-description');
    const typeSelect = screen.getByTestId('create-demand-select-type');
    const prioritySelect = screen.getByTestId('create-demand-select-priority');
    const submitButton = screen.getByRole('button', { name: /Criar Demanda/ });

    fireEvent.change(titleInput, { target: { value: DEMAND_DATA.title } });
    fireEvent.change(descInput, { target: { value: DEMAND_DATA.description } });
    fireEvent.change(typeSelect, { target: { value: DEMAND_DATA.type } });
    fireEvent.change(prioritySelect, { target: { value: DEMAND_DATA.priority } });

    await waitFor(() => {
      expect(screen.getByTestId('create-demand-select-project')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Projeto Alpha')).toBeInTheDocument();
    });
    const projectSelect = screen.getByTestId('create-demand-select-project');
    fireEvent.change(projectSelect, { target: { value: 'proj-1' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('create-demand-error')).toBeInTheDocument();
    });

    // NC-01: o modal NÃO fecha com sucesso — não há ID de demanda exibido
    expect(screen.queryByTestId('create-demand-created-id')).not.toBeInTheDocument();
    // O erro é exibido
    expect(screen.getByText(/Campo inválido|Falha ao criar Demanda: 400/)).toBeInTheDocument();
  });
});

describe('CreateDemandModal — CA2/CA3: tratamento de erros (400, 403, 401, rede)', () => {
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

  function preencherFormulario() {
    const titleInput = screen.getByTestId('create-demand-input-title');
    const descInput = screen.getByTestId('create-demand-input-description');
    const typeSelect = screen.getByTestId('create-demand-select-type');
    const prioritySelect = screen.getByTestId('create-demand-select-priority');
    const submitButton = screen.getByRole('button', { name: /Criar Demanda/ });

    fireEvent.change(titleInput, { target: { value: DEMAND_DATA.title } });
    fireEvent.change(descInput, { target: { value: DEMAND_DATA.description } });
    fireEvent.change(typeSelect, { target: { value: DEMAND_DATA.type } });
    fireEvent.change(prioritySelect, { target: { value: DEMAND_DATA.priority } });

    return submitButton;
  }

  async function selecionarProjeto() {
    await waitFor(() => {
      expect(screen.getByTestId('create-demand-select-project')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Projeto Alpha')).toBeInTheDocument();
    });
    const projectSelect = screen.getByTestId('create-demand-select-project');
    fireEvent.change(projectSelect, { target: { value: 'proj-1' } });
  }

  it('400: exibe mensagem de campo inválido e não fecha o modal', async () => {
    const onClose = vi.fn();
    vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/projects')) {
        return Promise.resolve(
          new Response(JSON.stringify({ data: PROJECTS }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify({ message: 'Campo inválido' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    render(<CreateDemandModal onClose={onClose} />);

    preencherFormulario();
    await selecionarProjeto();
    fireEvent.click(screen.getByRole('button', { name: /Criar Demanda/ }));

    await waitFor(() => {
      expect(screen.getByTestId('create-demand-error')).toBeInTheDocument();
    });

    expect(screen.getByText(/Campo inválido/)).toBeInTheDocument();
    // NC-01: o modal não fecha em erro HTTP
    expect(screen.queryByTestId('create-demand-created-id')).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBe('token-teste');
  });

  it('403: exibe mensagem de sem permissão e não fecha o modal', async () => {
    const onClose = vi.fn();
    vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/projects')) {
        return Promise.resolve(
          new Response(JSON.stringify({ data: PROJECTS }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify({ message: 'Sem permissão para este projeto' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    render(<CreateDemandModal onClose={onClose} />);

    preencherFormulario();
    await selecionarProjeto();
    fireEvent.click(screen.getByRole('button', { name: /Criar Demanda/ }));

    await waitFor(() => {
      expect(screen.getByTestId('create-demand-error')).toBeInTheDocument();
    });

    expect(screen.getByText(/Sem permissão/)).toBeInTheDocument();
    // NC-01: o modal não fecha em erro HTTP
    expect(screen.queryByTestId('create-demand-created-id')).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBe('token-teste');
  });

  it('401: remove o token, redireciona para /login e não fecha o modal', async () => {
    const onClose = vi.fn();
    vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/projects')) {
        return Promise.resolve(
          new Response(JSON.stringify({ data: PROJECTS }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify({ message: 'Sessão expirada' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    render(<CreateDemandModal onClose={onClose} />);

    preencherFormulario();
    await selecionarProjeto();
    fireEvent.click(screen.getByRole('button', { name: /Criar Demanda/ }));

    await waitFor(() => {
      expect(screen.getByTestId('create-demand-error')).toBeInTheDocument();
    });

    // A mensagem vem do corpo da resposta (não do status).
    expect(screen.getByText(/Sessão expirada/)).toBeInTheDocument();

    expect(localStorage.getItem('token')).toBeNull();
    expect(locationHref).toContain('/login');
    // NC-01: o modal não fecha em erro HTTP
    expect(screen.queryByTestId('create-demand-created-id')).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('erro de rede: exibe mensagem de conexão e não fecha o modal', async () => {
    const onClose = vi.fn();
    vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/projects')) {
        return Promise.resolve(
          new Response(JSON.stringify({ data: PROJECTS }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }
      // Falha de rede: a requisição não obtém resposta do servidor.
      return Promise.reject(new TypeError('Failed to fetch'));
    });

    render(<CreateDemandModal onClose={onClose} />);

    preencherFormulario();
    await selecionarProjeto();
    fireEvent.click(screen.getByRole('button', { name: /Criar Demanda/ }));

    await waitFor(() => {
      expect(screen.getByTestId('create-demand-error')).toBeInTheDocument();
    });

    expect(screen.getByText(/conexão/i)).toBeInTheDocument();
    // NC-01: o modal não fecha em erro de rede
    expect(screen.queryByTestId('create-demand-created-id')).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBe('token-teste');
  });
});
