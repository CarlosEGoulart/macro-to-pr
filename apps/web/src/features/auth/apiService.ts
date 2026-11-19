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
    const response = await fetch(input, { ...init, headers });
    if (response.status === 401) {
      // CA6: token expirado/revogado — limpa o token e leva de volta ao login, em um lugar só.
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return response;
  },
};
