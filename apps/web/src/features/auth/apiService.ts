export const API_BASE_URL = 'http://localhost:3000';

export type ApiInit = RequestInit;

// ID do cliente GitHub OAuth (configurado no backend). Usado para iniciar o fluxo de autorização.
export const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID ?? '';

/**
 * Erro de API com o status HTTP da resposta. Permite distinguir falhas de
 * negócio (400, 401, 403, etc.) de erros de rede (sem resposta do servidor,
 * `status` igual a `null`).
 */
export class ApiError extends Error {
  readonly status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const apiService = {
  /**
   * Único ponto de entrada para todas as chamadas à API do front (CA5).
   * Lê o token de `localStorage` a cada chamada e o envia no cabeçalho
   * `Authorization: Bearer <token>`. Quando não há token, nenhum cabeçalho
   * de autenticação é adicionado.
   * Caminhos relativos (ex.: '/projects') são prefixados com API_BASE_URL
   * para apontar ao backend real. URLs absolutas são enviadas como estão.
   */
  async request(input: RequestInfo | URL, init: ApiInit = {}): Promise<Response> {
    const token = localStorage.getItem('token');
    const headers = new Headers(init.headers ?? {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    let resolvedInput: RequestInfo | URL = input;
    if (typeof input === 'string' && input.startsWith('/')) {
      resolvedInput = `${API_BASE_URL}${input}`;
    }
    const response = await fetch(resolvedInput, { ...init, headers });
    if (response.status === 401) {
      // CA6: token expirado/revogado — limpa o token e leva de volta ao login, em um lugar só.
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return response;
  },

  /**
   * Inicia o fluxo de autorização OAuth com o GitHub.
   *
   * Navega o navegador de nível superior para o backend, que redireciona para
   * a página de autorização do GitHub. Usamos navigation direta (`window.location`)
   * em vez de `fetch` porque o GitHub não responde com o cabeçalho
   * `Access-Control-Allow-Origin`, o que bloquearia uma requisição cross-origin.
   */
  async authGitHub(): Promise<void> {
    window.location.href = `${API_BASE_URL}/auth/github`;
  },

  /**
   * Trata o callback do GitHub OAuth: troca o código de autorização por um token
   * JWT e grava o token no localStorage.
   */
  async handleGitHubCallback(code: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/github/callback?code=${code}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Falha ao trocar código por token');
    }
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
  },

  /**
   * Busca o perfil do desenvolvedor autenticado (GET /developer/me).
   * Envia o token de localStorage no cabeçalho Authorization: Bearer.
   */
  async developerProfile(): Promise<{
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  }> {
    const response = await this.request('/developer/me');
    if (!response.ok) {
      throw new Error(`Falha ao buscar perfil do desenvolvedor: ${response.status}`);
    }
    const { data } = await response.json();
    return data;
  },

  /**
   * Cria uma Demanda (POST /demandas).
   * Envia o token de localStorage no cabeçalho Authorization: Bearer via request().
   * CA1: com dados válidos retorna o objeto completo (incluindo o `id` gerado).
   * CA2: com dados obrigatórios ausentes, o backend responde 400 e o front exibe o campo.
   * Lança erro quando response.ok for false (400, 403, 500, etc.).
   */
  async createDemand(data: {
    title: string;
    description: string;
    type: string;
    priority: string;
    projectId: string;
  }): Promise<{
    id: string;
    title: string;
    description: string;
    type: string;
    priority: string;
    projectId: string;
  }> {
    let response: Response;
    try {
      response = await this.request('/demandas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch {
      // Rede: a requisição falhou antes de obter resposta do servidor.
      throw new ApiError(
        'Erro de conexão com o servidor. Verifique sua internet e tente novamente.',
        null
      );
    }
    if (!response.ok) {
      // CA2/CA3: lança com a mensagem do corpo (400, 401, 403, etc. distinguidos pelo status).
      let message: string;
      try {
        const body = await response.json();
        message = typeof body?.message === 'string' ? body.message : `Falha ao criar Demanda: ${response.status}`;
      } catch {
        message = `Falha ao criar Demanda: ${response.status}`;
      }
      throw new ApiError(message, response.status);
    }
    return response.json();
  },

  /**
   * Cria um Projeto (POST /projects).
   * Envia o token de localStorage no cabeçalho Authorization: Bearer via request().
   */
  async createProject(data: { name: string; repositoryId: string }): Promise<Response> {
    return this.request('/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
};
