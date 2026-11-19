import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Login } from './Login';

describe('Login — tela de redirecionamento após 401', () => {
  it('renderiza a tela de login com chamada para entrar via GitHub', () => {
    render(<Login />);

    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/sessão expirada/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /entrar com github/i })).toBeInTheDocument();
  });
});
