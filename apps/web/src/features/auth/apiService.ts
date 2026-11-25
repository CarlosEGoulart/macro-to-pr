export const API_BASE_URL = 'http://localhost:3000';

export type ApiInit = RequestInit;

// ID do cliente GitHub OAuth (configurado no backend). Usado para iniciar o fluxo de autorização.
export const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID ?? '';

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
    const headers = new Headers(init.headers);
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
   * Chama o backend para obter a URL de autorização do GitHub e inicia o redirecionamento.
   */
  async authGitHub(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/github`, { method: 'GET' });
    } catch (error) {
      console.error('Erro ao iniciar autorização GitHub:', error);
      throw error;
    }
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
};
