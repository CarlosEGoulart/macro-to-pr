/**
 * Header reutilizável — cabeçalho da aplicação (Figma node-id=44-336).
 *
 * Usado em /projects e /demandas. Renderiza logo "M", wordmark "Macro2PR",
 * badge de créditos e perfil do desenvolvedor (HeaderUser).
 *
 * data-testid="projects-select-header" (mantido do ProjectsSelect original).
 *
 * Estilos inline (style) para funcionar no jsdom. Design tokens do modo claro.
 */
import { type CSSProperties, useEffect, useState } from 'react';
import { apiService } from '../auth/apiService';

// --- Design tokens (modo claro) ---------------------------------------------
const tokens = {
  // Cores
  primaria: '#6164F1',
  superficieCard: '#FFFFFF',
  texto: '#111827',
  textoSuave: '#6B7280',
  border: '#6B7280',
  superficieSidebar: '#F9FAFB',

  // Espaçamento (px)
  sm: 8,
  md: 12,
  xl: 24,

  // Tipografia
  font: 'Inter, system-ui, sans-serif',
} as const;

// --- Tipos ------------------------------------------------------------------
interface HeaderProps {
  /** Ações (ex.: botões "+ Novo Projeto", "+ Nova Demanda") renderizadas ao lado direito. */
  actions?: JSX.Element | JSX.Element[];
}

// --- Subcomponentes ---------------------------------------------------------
function HeaderUser() {
  const [developer, setDeveloper] = useState<{
    name: string;
    avatarUrl: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadDeveloper() {
      try {
        const profile = await apiService.developerProfile();
        if (!cancelled) {
          setDeveloper(profile);
        }
      } catch {
        if (!cancelled) {
          setDeveloper(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDeveloper();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div style={headerUserStyle}>
        <div style={headerUserBadgeStyle}>Desenvolvedor</div>
        <div style={avatarStyle}>D</div>
      </div>
    );
  }

  const displayName = developer?.name ?? 'Desenvolvedor';
  const initial = displayName.charAt(0).toUpperCase();
  const avatarUrl = developer?.avatarUrl ?? null;

  return (
    <div style={headerUserStyle}>
      <div style={headerUserBadgeStyle}>{displayName}</div>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName}
          style={{
            ...avatarStyle,
            backgroundColor: 'transparent',
            border: `2px solid ${tokens.primaria}`,
            color: 'transparent',
            fontSize: 0,
          } as CSSProperties}
        />
      ) : (
        <div style={avatarStyle}>{initial}</div>
      )}
    </div>
  );
}

const headerUserStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: tokens.sm,
};

const headerUserBadgeStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  height: 28,
  fontFamily: tokens.font,
  fontSize: 14,
  color: tokens.textoSuave,
  lineHeight: 1,
  padding: '5px 13px',
  backgroundColor: tokens.superficieCard,
  border: '1px solid var(--texto-suave,#6b7280)',
  borderRadius: 6,
};

const avatarStyle: CSSProperties = {
  width: 32,
  height: 32,
  backgroundColor: tokens.superficieCard,
  border: `2px solid ${tokens.primaria}`,
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: tokens.primaria,
  fontFamily: tokens.font,
  fontWeight: '700',
  fontSize: 14,
  lineHeight: 1,
  flexShrink: 0,
};

function CreditsBadge() {
  return (
    <div style={creditsBadgeStyle}>
      <span style={creditsIconStyle}>⚡</span>
      <span style={creditsTextStyle}>22 Créditos</span>
    </div>
  );
}

const creditsBadgeStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: tokens.sm,
  height: 28,
  fontFamily: tokens.font,
  fontWeight: '500',
  fontSize: 14,
  color: tokens.texto,
  lineHeight: 1,
  padding: '9px 13px',
  backgroundColor: tokens.superficieCard,
  border: '1px solid var(--texto-suave,#6b7280)',
  borderRadius: 9999,
};

const creditsIconStyle: CSSProperties = {
  lineHeight: 1,
};

const creditsTextStyle: CSSProperties = {
  lineHeight: 1,
};

// --- Componente principal ---------------------------------------------------
export function Header({ actions }: HeaderProps = {}) {
  const headerStyle: CSSProperties = {
    backgroundColor: tokens.superficieSidebar,
    borderBottom: `1px solid ${tokens.border}`,
    height: 64,
    padding: `20px ${tokens.xl}px`,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.md,
    boxSizing: 'border-box',
  } as CSSProperties;

  const headerLogoStyle: CSSProperties = {
    width: 30,
    height: 30,
    backgroundColor: tokens.primaria,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontFamily: tokens.font,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 1,
    flexShrink: 0,
  } as CSSProperties;

  const headerWordmarkStyle: CSSProperties = {
    fontFamily: tokens.font,
    fontWeight: '600',
    fontSize: 18,
    color: tokens.texto,
    letterSpacing: '-0.45px',
    lineHeight: '27px',
  } as CSSProperties;

  const actionsContainerStyle: CSSProperties = {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: tokens.md,
  } as CSSProperties;

  return (
    <header data-testid="projects-select-header" style={headerStyle}>
      <div style={headerLogoStyle}>M</div>
      <span style={headerWordmarkStyle}>Macro2PR</span>
      <div style={actionsContainerStyle}>
        <CreditsBadge />
        <HeaderUser />
        {actions && (
          <div style={{ display: 'flex', gap: tokens.sm }}>
            {Array.isArray(actions) ? actions : [actions]}
          </div>
        )}
      </div>
    </header>
  );
}
