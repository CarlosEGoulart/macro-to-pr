/**
 * Sidebar reutilizável — barra lateral de navegação (Figma node-id=27-263).
 *
 * Usado em /projects e /demandas. Renderiza seções PRINCIPAL, FINANCEIRO e
 * GESTÃO com itens de navegação e ícones inline (SVG).
 *
 * data-testid="projects-select-sidebar" (mantido do ProjectsSelect original).
 *
 * Estilos inline (style) para funcionar no jsdom. Design tokens do modo claro.
 */
import { type CSSProperties } from 'react';

// --- Design tokens (modo claro) ---------------------------------------------
const tokens = {
  // Cores
  primaria: '#6164F1',
  primariaRgba004: 'rgba(97, 100, 241, 0.04)',
  texto: '#111827',
  textoSuave: '#6B7280',
  border: '#6B7280',
  superficieSidebar: '#F9FAFB',

  // Espaçamento (px)
  sm: 8,
  md: 12,
  lg: 16,

  // Tipografia
  font: 'Inter, system-ui, sans-serif',
} as const;

// --- Tipos ------------------------------------------------------------------
interface SidebarItem {
  label: string;
  icon: JSX.Element;
  active?: boolean;
  href?: string;
  onClick?: () => void;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

// Ícones lineares do sidebar (substituem emojis — Figma usa stroke 1.5, #6B7280)
function IconInicio() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6.5 3H3v10h3.5M8 5.5l3 2.5-3 2.5M11 8H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconWorkspace() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 4.5h4l1.2 1.5H14v6.5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function IconDemanda() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="2.5" width="10" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.5 6h5M5.5 8.5h5M5.5 11h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconRevisao() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2.5" y="2.5" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCreditos() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.75" y="3.5" width="12.5" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1.75 6.5h12.5M4.5 10h2.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function IconContas() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="6" cy="5" r="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2.5 13c0-2 1.6-3.5 3.5-3.5s3.5 1.5 3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M10.5 3.5a2 2 0 0 1 0 4M11 9.7c1.7 .4 2.8 1.6 2.8 3.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

// --- Componente principal ---------------------------------------------------
interface SidebarProps {
  sections: SidebarSection[];
}

export function Sidebar({ sections }: SidebarProps) {
  const sidebarStyle: CSSProperties = {
    width: 240,
    flexShrink: 0,
    backgroundColor: tokens.superficieSidebar,
    borderRight: `1px solid ${tokens.border}`,
    display: 'flex',
    flexDirection: 'column',
    padding: `${tokens.lg}px ${tokens.lg}px ${tokens.lg}px ${tokens.lg}px`,
    boxSizing: 'border-box',
  } as CSSProperties;

  // padding: pl-16 pr-17 py-16 (pr levemente maior como no Figma)
  const sidebarPaddingStyle: CSSProperties = {
    paddingLeft: tokens.lg,
    paddingRight: 17,
    paddingTop: tokens.lg,
    paddingBottom: tokens.lg,
  } as CSSProperties;

  const sidebarSectionStyle: CSSProperties = {
    marginBottom: tokens.xl,
  } as CSSProperties;

  const sidebarSectionTitleStyle: CSSProperties = {
    fontFamily: tokens.font,
    fontWeight: '600',
    fontSize: 11,
    color: tokens.textoSuave,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 8px 0',
  } as CSSProperties;

  const sidebarItemStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.sm,
    padding: '12px',
    borderRadius: 8,
    color: tokens.textoSuave,
    fontFamily: tokens.font,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: '1.4',
    cursor: 'pointer',
    textDecoration: 'none',
    border: '1px solid transparent',
    backgroundColor: 'transparent',
  } as CSSProperties;

  const sidebarItemActiveStyle: CSSProperties = {
    ...sidebarItemStyle,
    backgroundColor: 'rgba(97, 100, 241, 0.1)',
    color: tokens.primaria,
    borderLeft: `3px solid ${tokens.primaria}`,
    borderRadius: 8,
    paddingLeft: 15,
    paddingRight: 12,
    paddingTop: 12,
    paddingBottom: 12,
    border: 'none',
  } as CSSProperties;

  const sidebarItemIconStyle: CSSProperties = {
    width: 20,
    height: 20,
    flexShrink: 0,
  } as CSSProperties;

  return (
    <aside
      data-testid="projects-select-sidebar"
      style={{
        ...sidebarStyle,
        ...sidebarPaddingStyle,
      }}
    >
      {sections.map((section) => (
        <div key={section.title} style={sidebarSectionStyle}>
          <p style={sidebarSectionTitleStyle}>{section.title}</p>
          {section.items.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={item.onClick}
              style={item.active ? sidebarItemActiveStyle : sidebarItemStyle}
            >
              <span style={sidebarItemIconStyle}>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </div>
      ))}
    </aside>
  );
}

// Seções padrão (mesmas do ProjectsSelect original)
export const defaultSidebarSections: SidebarSection[] = [
  {
    title: 'PRINCIPAL',
    items: [
      { label: 'Início / Acesso', icon: <IconInicio />, href: '#' },
      { label: 'Workspace', icon: <IconWorkspace />, active: true, href: '#' },
      { label: 'Detalhe da Demanda', icon: <IconDemanda />, href: '#' },
      { label: 'Revisão de Resultados', icon: <IconRevisao />, href: '#' },
    ],
  },
  {
    title: 'FINANCEIRO',
    items: [{ label: 'Créditos & Faturamento', icon: <IconCreditos />, href: '#' }],
  },
  {
    title: 'GESTÃO',
    items: [{ label: 'Contas de Desenvolvedores', icon: <IconContas />, href: '#' }],
  },
];
