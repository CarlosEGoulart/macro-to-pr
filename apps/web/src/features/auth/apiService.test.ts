import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiService } from './apiService';

const API_URL = 'http://localhost:3000/api';

function authorizationDe(init: RequestInit | undefined): string | null {
  return (init?.headers as Headers | undefined)?.get('authorization') ?? null;
}

describe('apiService — CA5: token Bearer em toda chamada', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }));
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('envia Authorization: Bearer <token> lido do localStorage em toda chamada à API', async () => {
    const fetchMock = vi.mocked(globalThis.fetch);
    localStorage.setItem('token', 'meu-token-123');

    await apiService.request(`${API_URL}/demands`);
    await apiService.request(`${API_URL}/tasks/1`, { method: 'PATCH' });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(authorizationDe(fetchMock.mock.calls[0][1])).toBe('Bearer meu-token-123');
    expect(authorizationDe(fetchMock.mock.calls[1][1])).toBe('Bearer meu-token-123');
  });

  it('usa o token vigente no localStorage no momento de cada chamada', async () => {
    const fetchMock = vi.mocked(globalThis.fetch);
    localStorage.setItem('token', 'token-a');

    await apiService.request(`${API_URL}/x`);
    localStorage.setItem('token', 'token-b');
    await apiService.request(`${API_URL}/y`);

    expect(authorizationDe(fetchMock.mock.calls[0][1])).toBe('Bearer token-a');
    expect(authorizationDe(fetchMock.mock.calls[1][1])).toBe('Bearer token-b');
  });

  it('não envia Authorization quando não há token no localStorage', async () => {
    const fetchMock = vi.mocked(globalThis.fetch);
    localStorage.removeItem('token');

    await apiService.request(`${API_URL}/demands`);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(authorizationDe(fetchMock.mock.calls[0][1])).toBeNull();
  });
});
