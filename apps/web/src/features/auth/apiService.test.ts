import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiService, API_BASE_URL } from './apiService';

// jsdom não fornece localStorage por padrão. Mockamos aqui para este arquivo
// ser autossuficiente (setupTests.ts apenas importa @testing-library/jest-dom).
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

const API_URL = 'http://localhost:3000/api';

function authorizationDe(init: RequestInit | undefined): string | null {
  return (init?.headers as Headers | undefined)?.get('authorization') ?? null;
}

describe('apiService — conectar ao backend real (base URL)', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }));
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('prefixa caminhos relativos com API_BASE_URL (http://localhost:3000)', async () => {
    const fetchMock = vi.mocked(globalThis.fetch);
    localStorage.setItem('token', 'meu-token-123');

    await apiService.request('/projects');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:3000/projects');
  });

  it('não duplica o prefixo quando já recebe uma URL absoluta', async () => {
    const fetchMock = vi.mocked(globalThis.fetch);
    localStorage.setItem('token', 'meu-token-123');

    await apiService.request(`${API_URL}/projects`);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/projects`);
  });
});

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

describe('apiService — developerProfile', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: { id: 'dev-1', name: 'Ana', email: 'ana@test.com', avatarUrl: 'https://avatar.png' } }), { status: 200 }),
    );
    localStorage.setItem('token', 'token-dev-1');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('chama GET /developer/me com Authorization: Bearer <token>', async () => {
    const fetchMock = vi.mocked(globalThis.fetch);

    await apiService.developerProfile();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_BASE_URL}/developer/me`);
    const init = fetchMock.mock.calls[0][1];
    expect(authorizationDe(init)).toBe('Bearer token-dev-1');
  });

  it('retorna os dados do desenvolvedor', async () => {
    const profile = await apiService.developerProfile();
    expect(profile).toEqual({
      id: 'dev-1',
      name: 'Ana',
      email: 'ana@test.com',
      avatarUrl: 'https://avatar.png',
    });
  });
});

describe('apiService — CA6: 401 limpa token e redireciona para login', () => {
  const originalLocation = window.location;
  const locationMock = { href: originalLocation.href };

  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 401 }));
    localStorage.setItem('token', 'token-expirado');
    locationMock.href = originalLocation.href;
    Object.defineProperty(window, 'location', {
      configurable: true,
      get: () => locationMock,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    Object.defineProperty(window, 'location', { value: originalLocation, configurable: true });
  });

  it('remove o token do localStorage e redireciona para /login quando a API responde 401', async () => {
    await apiService.request(`${API_URL}/x`);

    expect(localStorage.getItem('token')).toBeNull();
    expect(locationMock.href).toContain('/login');
  });
});
