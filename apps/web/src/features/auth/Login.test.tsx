import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Login } from './Login';
import { apiService } from './apiService';

describe('Login — tela de acesso com design tokens', () => {
  it('renderiza header com logo "M" e wordmark "Macro2PR"', () => {
    render(<Login />);

    expect(screen.getByTestId('login-header')).toBeInTheDocument();
    const logo = screen.getByTestId('login-logo');
    expect(logo).toBeInTheDocument();
    expect(logo.textContent).toBe('M');
    expect(screen.getByText('Macro2PR')).toBeInTheDocument();
  });

  it('renderiza container principal "Acesso ao Macro2PR"', () => {
    render(<Login />);

    expect(screen.getByTestId('login-main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Acesso ao Macro2PR' })).toBeInTheDocument();
    expect(screen.getByText(/Autorize sua Conta GitHub para acessar os Repositórios disponíveis/)).toBeInTheDocument();
  });

  it('renderiza seção de autorização GitHub com card e botão', () => {
    render(<Login />);

    expect(screen.getByTestId('login-card')).toBeInTheDocument();
    expect(screen.getByText('Transforme demandas em trabalho estruturado e revisável')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Autorizar com GitHub/ })).toBeInTheDocument();
  });

  it('renderiza próximos passos com 3 etapas numeradas', () => {
    render(<Login />);

    expect(screen.getByTestId('login-next-steps')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Depois da autorização' })).toBeInTheDocument();
    expect(screen.getByText('Escolha um Repositório')).toBeInTheDocument();
    expect(screen.getByText('Crie um Projeto')).toBeInTheDocument();
    expect(screen.getByText('Organize Demandas')).toBeInTheDocument();
  });

  it('aplica tokens de cor de superfície ao card', () => {
    render(<Login />);

    const card = screen.getByTestId('login-card');
    expect(card).toHaveStyle('background-color: rgb(255, 255, 255)');
  });

  it('aplica token de cor primária ao botão de autorizar', () => {
    render(<Login />);

    const button = screen.getByRole('button', { name: /Autorizar com GitHub/ });
    expect(button).toHaveStyle('background-color: rgb(97, 100, 241)');
  });

  it('aplica token de tipografia Inter ao heading', () => {
    render(<Login />);

    const heading = screen.getByRole('heading', { name: /macro2pr/i });
    expect(heading.style.fontFamily).toContain('Inter');
  });

  it('troca cor do botão de autorizar nos estados hover', () => {
    render(<Login />);

    const button = screen.getByTestId('login-authorize-button');

    fireEvent.mouseEnter(button);
    expect(button).toHaveStyle('background-color: rgb(79, 70, 229)');

    fireEvent.mouseLeave(button);
    expect(button).toHaveStyle('background-color: rgb(97, 100, 241)');
  });

  describe('clicar no botão "Autorizar com GitHub"', () => {
    const originalLocation = window.location;
    let redirectUrl = '';

    beforeEach(() => {
      redirectUrl = '';
      Object.defineProperty(window, 'location', {
        configurable: true,
        get: () => ({
          get href() {
            return redirectUrl;
          },
          set href(value: string) {
            redirectUrl = value;
          },
        }),
      });
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }));
      vi.spyOn(apiService, 'authGitHub').mockResolvedValue(undefined);
    });

    afterEach(() => {
      vi.restoreAllMocks();
      Object.defineProperty(window, 'location', { value: originalLocation, configurable: true });
    });

    it('dispara o fluxo de autorização OAuth (chama apiService.authGitHub)', () => {
      render(<Login />);

      const button = screen.getByTestId('login-authorize-button');
      fireEvent.click(button);

      // O fluxo OAuth deve ser disparado (inicia requisição de autorização)
      expect(apiService.authGitHub).toHaveBeenCalled();
    });

    it('exibe estado de carregamento no botão durante a ação', () => {
      render(<Login />);

      const button = screen.getByTestId('login-authorize-button');
      expect(button).toBeInTheDocument();

      fireEvent.click(button);

      // Durante o loading, o botão exibe estado de carregamento (desativado e/ou com indicação visual)
      expect(button).toBeDisabled();
    });
  });
});
