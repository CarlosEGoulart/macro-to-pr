import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Menu } from './Menu';

describe('Menu — RBAC: botões de Admin ocultos para Desenvolvedor', () => {
  it('não renderiza botões de Admin quando o papel é Developer', () => {
    render(<Menu role="Developer" />);

    expect(screen.queryByRole('button', { name: /painel admin/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/gerenciar usuários/i)).not.toBeInTheDocument();
  });

  it('renderiza botões de Admin quando o papel é Admin', () => {
    render(<Menu role="Admin" />);

    expect(screen.getByRole('button', { name: /painel admin/i })).toBeInTheDocument();
    expect(screen.getByText(/gerenciar usuários/i)).toBeInTheDocument();
  });

  it('renderiza itens comuns independentemente do papel', () => {
    render(<Menu role="Developer" />);

    expect(screen.getByRole('link', { name: /início/i })).toBeInTheDocument();
  });
});
