export type Role = 'Developer' | 'Admin';

interface MenuProps {
  role: Role;
}

const COMMON_ITEMS = [
  { label: 'Início', href: '/' },
] as const;

const ADMIN_ITEMS = [
  { label: 'Painel Admin', href: '/admin' },
  { label: 'Gerenciar Usuários', href: '/admin/usuarios' },
] as const;

/**
 * Menu principal com controle de acesso por papel (RBAC).
 * Itens de Admin só são renderizados quando o papel é 'Admin';
 * Desenvolvedor não vê os botões de Admin.
 */
export function Menu({ role }: MenuProps) {
  return (
    <nav aria-label="Menu principal">
      <ul>
        {COMMON_ITEMS.map((item) => (
          <li key={item.href}>
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
        {role === 'Admin' && (
          <>
            {ADMIN_ITEMS.map((item) => (
              <li key={item.href}>
                <button type="button">{item.label}</button>
              </li>
            ))}
          </>
        )}
      </ul>
    </nav>
  );
}
