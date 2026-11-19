export type ApiInit = RequestInit;

export const apiService = {
  /**
   * Único ponto de entrada para todas as chamadas à API do front (CA5).
   * Lê o token de `localStorage` a cada chamada e o envia no cabeçalho
   * `Authorization: Bearer <token>`. Quando não há token, nenhum cabeçalho
   * de autenticação é adicionado.
   */
  async request(input: RequestInfo | URL, init: ApiInit = {}): Promise<Response> {
    const token = localStorage.getItem('token');
    const headers = new Headers(init.headers);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(input, { ...init, headers });
  },
};
