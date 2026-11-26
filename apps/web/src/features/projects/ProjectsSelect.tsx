/**
 * Tela de seletor de Projeto — consome GET /projects e exibe a lista de
 * projetos do desenvolvedor autenticado para seleção (CA4).
 *
 * Segue o protótipo do Figma (7 seções) e os tokens de design (modo claro).
 * Estilos aplicados via `style` (inline) para funcionarem no jsdom.
 *
 * Seções do Figma (https://www.figma.com/design/edq6lzgx0DPXApm2WZLpxT/Macro2PR):
 *  1. header (node-id=44-336)   — cabeçalho da aplicação
 *  2. sidebar (node-id=27-263)   — barra lateral
 *  3. main (node-id=2-8377)      — área principal de conteúdo
 *  4. cabeçalho (node-id=2-8379) — cabeçalho da página (título + ações)
 *  5. layout (node-id=2-8394)    — layout com as colunas lado a lado
 *  6. seção projetos (node-id=2-8395) — lista de Projetos
 *  7. seção demandas (node-id=2-8451) — lista de Demandas do projeto
 */
import { type CSSProperties, useEffect, useState } from 'react';
import { apiService } from '../auth/apiService';

// --- Design tokens (modo claro) ---------------------------------------------
const tokens = {
  // Cores
  primaria: '#6164F1',
  primariaHover: '#4F46E5',
  primariaRgba004: 'rgba(97, 100, 241, 0.04)',
  superficieCard: '#FFFFFF',
  superficieSidebar: '#F9FAFB',
  texto: '#111827',
  textoSuave: '#6B7280',
  perigo: '#DC2626',
  sucesso: '#16A34A',
  desabilitado: '#C7D2FE',
  border: '#6B7280',

  // Espaçamento (px)
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,

  // Tipografia
  font: 'Inter, system-ui, sans-serif',
} as const;

// --- Tipos ------------------------------------------------------------------
export interface Project {
  id: string;
  name: string;
  repositoryName?: string;
  demandCount: number;
}

interface Demand {
  id: string;
  title: string;
  status: string;
  taskCount: number;
}

interface ProjectsSelectProps {
  onProjectSelect?: (project: Project) => void;
}

// --- Componentes internos ---------------------------------------------------
function ProjectIcon() {
  return (
    <svg
      width="16"
      height="12"
      viewBox="0 0 16 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="16" height="12" fill="#E5E7EB" stroke="#6B7280" strokeWidth="1" rx="2" />
      <path
        d="M4 4h2v2H4zM8 4h2v2H8zM12 4h2v2h-2zM4 8h2v2H4zM8 8h2v2H8zM12 8h2v2h-2z"
        fill="#6B7280"
      />
    </svg>
  );
}

function Avatar() {
  return (
    <div style={avatarStyle}>
      D
    </div>
  );
}

const avatarStyle: CSSProperties = {
  width: 32,
  height: 32,
  backgroundColor: tokens.primaria,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#FFFFFF',
  fontFamily: tokens.font,
  fontWeight: '700',
  fontSize: 14,
  lineHeight: 1,
  flexShrink: 0,
};

function HeaderUser() {
  return (
    <div style={headerUserStyle}>
      <div style={headerUserBadgeStyle}>Desenvolvedor</div>
      <div style={avatarStyle}>D</div>
    </div>
  );
}

const headerUserStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: tokens.sm,
};

const headerUserBadgeStyle: CSSProperties = {
  fontFamily: tokens.font,
  fontWeight: '500',
  fontSize: 14,
  color: tokens.texto,
  lineHeight: '1.4',
  padding: '0 8px',
  backgroundColor: tokens.superficieCard,
  border: `1px solid ${tokens.border}`,
  borderRadius: 20,
};

function CreditsBadge() {
  return (
    <div style={creditsBadgeStyle}>
      <span style={creditsIconStyle}>⚡</span>
      <span style={creditsTextStyle}>24 Créditos</span>
    </div>
  );
}

const creditsBadgeStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: tokens.xs,
  fontFamily: tokens.font,
  fontWeight: '500',
  fontSize: 14,
  color: tokens.texto,
  lineHeight: '1.4',
  padding: '0 10px',
  backgroundColor: tokens.superficieCard,
  border: `1px solid ${tokens.border}`,
  borderRadius: 20,
};

const creditsIconStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: 1,
};

const creditsTextStyle: CSSProperties = {
  lineHeight: 1,
};

// --- Componentes internos ---------------------------------------------------
function ProjectIconOnly() {
  return (
    <svg
      width="16"
      height="12"
      viewBox="0 0 16 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="16" height="12" fill="#E5E7EB" stroke="#6B7280" strokeWidth="1" rx="2" />
      <path
        d="M4 4h2v2H4zM8 4h2v2H8zM12 4h2v2h-2zM4 8h2v2H4zM8 8h2v2H8zM12 8h2v2h-2z"
        fill="#6B7280"
      />
    </svg>
  );
}

function ProjectCard({
  project,
  selected,
  onSelect,
}: {
  project: Project;
  selected: boolean;
  onSelect: () => void;
}) {
  const cardStyle: CSSProperties = {
    backgroundColor: selected ? tokens.primariaRgba004 : tokens.superficieCard,
    border: selected ? `2px solid ${tokens.primaria}` : `1px solid ${tokens.border}`,
    borderRadius: 12,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    width: '100%',
    boxSizing: 'border-box',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const badgeStyle: CSSProperties = {
    backgroundColor: tokens.primaria,
    color: '#030712',
    borderRadius: 9999,
    padding: '4px 8px',
    fontFamily: tokens.font,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: '1',
    alignSelf: 'flex-start',
  };

  const nameStyle: CSSProperties = {
    fontFamily: tokens.font,
    fontWeight: '600',
    fontSize: 16,
    color: tokens.texto,
    margin: 0,
    lineHeight: '1.4',
  };

  const statsStyle: CSSProperties = {
    fontFamily: tokens.font,
    fontWeight: '400',
    fontSize: 12,
    color: tokens.textoSuave,
    margin: 0,
    lineHeight: '1.4',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };

  const selectButtonStyle: CSSProperties = {
    backgroundColor: 'transparent',
    color: tokens.primaria,
    border: `1px solid ${tokens.primaria}`,
    borderRadius: 6,
    padding: '6px 12px',
    fontFamily: tokens.font,
    fontWeight: '600',
    fontSize: 12,
    cursor: 'pointer',
    lineHeight: '1',
    marginTop: 'auto',
    alignSelf: 'flex-start',
  };

  return (
    <article
      data-testid={`project-card-${project.id}`}
      style={cardStyle as CSSProperties}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ProjectIconOnly />
        <p style={nameStyle}>{project.name}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ opacity: 0.6 }} aria-hidden="true">
          ●
        </span>
        <p style={statsStyle}>
          {project.repositoryName} · {project.demandCount} demanda{project.demandCount !== 1 ? 's' : ''}
        </p>
      </div>
      <button
        type="button"
        role="button"
        aria-label={`Selecionar ${project.name}`}
        style={selectButtonStyle as CSSProperties}
        onClick={onSelect}
      >
        Selecionar
      </button>
      {selected && (
        <span
          role="status"
          aria-label="Selecionado"
          style={badgeStyle as CSSProperties}
        >
          Selecionado
        </span>
      )}
    </article>
  );
}

function DemandCard({
  demand,
  onOpen,
}: {
  demand: Demand;
  onOpen: () => void;
}) {
  const statusColors: Record<string, string> = {
    Draft: tokens.textoSuave,
    AwaitingPlanApproval: tokens.primaria,
    AwaitingNewPlan: tokens.primaria,
    PlanApproved: tokens.sucesso,
    InExecution: tokens.primaria,
    ReadyForPR: tokens.primaria,
    Concluded: tokens.sucesso,
  };

  const cardStyle: CSSProperties = {
    backgroundColor: tokens.superficieCard,
    border: `1px solid ${tokens.border}`,
    borderRadius: 12,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    width: '100%',
    boxSizing: 'border-box',
  };

  const titleRowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: tokens.md,
  };

  const titleStyle: CSSProperties = {
    fontFamily: tokens.font,
    fontWeight: '600',
    fontSize: 14,
    color: tokens.texto,
    margin: 0,
    lineHeight: '1.4',
  };

  const badgeStyle: CSSProperties = {
    backgroundColor: statusColors[demand.status] || tokens.textoSuave,
    color: '#FFFFFF',
    borderRadius: 9999,
    padding: '2px 8px',
    fontFamily: tokens.font,
    fontWeight: '600',
    fontSize: 10,
    lineHeight: '1',
    alignSelf: 'flex-start',
  };

  const metaStyle: CSSProperties = {
    fontFamily: tokens.font,
    fontWeight: '400',
    fontSize: 12,
    color: tokens.textoSuave,
    margin: 0,
    lineHeight: '1.4',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };

  const openLinkStyle: CSSProperties = {
    backgroundColor: 'transparent',
    color: tokens.primaria,
    border: 'none',
    borderRadius: 6,
    padding: 0,
    fontFamily: tokens.font,
    fontWeight: '500',
    fontSize: 12,
    cursor: 'pointer',
    lineHeight: '1',
    alignSelf: 'flex-start',
    marginTop: 4,
    textDecoration: 'none',
  };

  return (
    <article style={cardStyle as CSSProperties}>
      <div style={titleRowStyle}>
        <p style={titleStyle}>{demand.title}</p>
        <span style={badgeStyle}>{demand.status}</span>
      </div>
      <p style={metaStyle}>
        <span role="img" aria-label="task" aria-hidden="true">
          ✓
        </span>
        {demand.taskCount} tarefa{demand.taskCount !== 1 ? 's' : ''}
      </p>
      <button
        type="button"
        role="button"
        aria-label={`Abrir ${demand.title}`}
        style={openLinkStyle as CSSProperties}
        onClick={onOpen}
      >
        Abrir Demanda →
      </button>
    </article>
  );
}

function WarningMessage() {
  return (
    <div
      style={{
        backgroundColor: tokens.superficieSidebar,
        borderRadius: 8,
        padding: `${tokens.sm}px ${tokens.md}px`,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.xs,
        fontFamily: tokens.font,
        fontWeight: '400',
        fontSize: 12,
        color: tokens.textoSuave,
        lineHeight: '1.4',
      } as CSSProperties}
    >
      <span role="img" aria-label="info">
        ℹ️
      </span>
      <p style={{ margin: 0 }}>
        Cada Repositório só pode estar associado a um único Projeto para sua
        conta de Desenvolvedor.
      </p>
    </div>
  );
}

// --- Componente principal ---------------------------------------------------
export function ProjectsSelect({ onProjectSelect }: ProjectsSelectProps = {}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [demands, setDemands] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.request('/projects');
        if (!response.ok) {
          throw new Error(`Falha ao carregar projetos: ${response.status}`);
        }
        const { data } = (await response.json()) as { data: Project[] };
        if (!cancelled) {
          setProjects(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar projetos');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProjects();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelect = (project: Project) => {
    setSelectedId(project.id);
    setDemands([]);
    onProjectSelect?.(project);
  };

  if (loading) {
    return (
      <section
        data-testid="projects-select-loading"
        style={{
          fontFamily: tokens.font,
          fontSize: 12,
          color: tokens.textoSuave,
        } as CSSProperties}
      >
        Carregando projetos…
      </section>
    );
  }

  if (error) {
    return (
      <section
        data-testid="projects-select-error"
        style={{
          fontFamily: tokens.font,
          fontSize: 12,
          color: tokens.perigo,
        } as CSSProperties}
      >
        {error}
      </section>
    );
  }

  const selectedProject = projects.find((p) => p.id === selectedId);
  const columnGap = tokens.lg;

  // 1. header (node-id=44-336) — cabeçalho da aplicação
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
    borderRadius: 6,
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

  // 4. cabeçalho (node-id=2-8379) — cabeçalho da página
  const pageHeaderStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.sm,
    marginBottom: tokens.lg,
  } as CSSProperties;

  const pageHeaderTitleStyle: CSSProperties = {
    fontFamily: tokens.font,
    fontWeight: '600',
    fontSize: 24,
    color: tokens.texto,
    margin: 0,
    lineHeight: '1.2',
  } as CSSProperties;

  const pageHeaderSubtitleStyle: CSSProperties = {
    fontFamily: tokens.font,
    fontWeight: '400',
    fontSize: 14,
    color: tokens.textoSuave,
    margin: 0,
    lineHeight: '1.5',
  } as CSSProperties;

  const pageHeaderActionsStyle: CSSProperties = {
    display: 'flex',
    gap: tokens.sm,
    marginTop: tokens.xs,
  } as CSSProperties;

  const actionButtonStyle: CSSProperties = {
    backgroundColor: tokens.primaria,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 6,
    padding: '8px 14px',
    fontFamily: tokens.font,
    fontWeight: '600',
    fontSize: 14,
    cursor: 'pointer',
    lineHeight: '1',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  } as CSSProperties;

  const actionButtonHoverStyle: CSSProperties = {
    backgroundColor: tokens.primariaHover,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 6,
    padding: '8px 14px',
    fontFamily: tokens.font,
    fontWeight: '600',
    fontSize: 14,
    cursor: 'pointer',
    lineHeight: '1',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  } as CSSProperties;

  // 5. layout (node-id=2-8394) — colunas lado a lado
  const columnsStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: columnGap,
    width: '100%',
  } as CSSProperties;

  const columnStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.md,
    flex: 1,
    minWidth: 0,
  } as CSSProperties;

  const columnTitleStyle: CSSProperties = {
    fontFamily: tokens.font,
    fontWeight: '600',
    fontSize: 18,
    color: tokens.texto,
    margin: '0 0 8px 0',
    lineHeight: '1.2',
  } as CSSProperties;

  const listStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.md,
    flex: 1,
  } as CSSProperties;

  const emptyStateStyle: CSSProperties = {
    fontFamily: tokens.font,
    fontSize: 14,
    color: tokens.textoSuave,
    padding: tokens.lg,
    borderRadius: 8,
    backgroundColor: tokens.superficieCard,
    border: `1px solid ${tokens.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  } as CSSProperties;

  const selectedRepoBannerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.xs,
    padding: `${tokens.xs}px ${tokens.md}px`,
    backgroundColor: tokens.primariaRgba004,
    border: `1px solid ${tokens.primaria}`,
    borderRadius: 8,
    marginBottom: tokens.sm,
  } as CSSProperties;

  const selectedRepoTextStyle: CSSProperties = {
    fontFamily: tokens.font,
    fontWeight: '500',
    fontSize: 13,
    color: tokens.texto,
    lineHeight: '1.4',
  } as CSSProperties;

  // Sidebar styles (node-id=27-263)
  const sidebarStyle: CSSProperties = {
    width: 260,
    flexShrink: 0,
    backgroundColor: tokens.superficieSidebar,
    borderRight: `1px solid ${tokens.border}`,
    display: 'flex',
    flexDirection: 'column',
    padding: tokens.lg,
    boxSizing: 'border-box',
  } as CSSProperties;

  const sidebarSectionStyle: CSSProperties = {
    marginBottom: tokens.lg,
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
    padding: '8px 12px',
    borderRadius: 6,
    color: tokens.textoSuave,
    fontFamily: tokens.font,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: '1.4',
    cursor: 'pointer',
    textDecoration: 'none',
    border: '1px solid transparent',
  } as CSSProperties;

  const sidebarItemActiveStyle: CSSProperties = {
    ...sidebarItemStyle,
    backgroundColor: tokens.primariaRgba004,
    color: tokens.primaria,
    border: `1px solid ${tokens.primaria}`,
  } as CSSProperties;

  const sidebarItemIconStyle: CSSProperties = {
    width: 16,
    height: 16,
    flexShrink: 0,
  } as CSSProperties;

  return (
    <section
      data-testid="projects-select-root"
      style={{
        fontFamily: tokens.font,
        backgroundColor: tokens.superficieSidebar,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: '100vh',
        boxSizing: 'border-box',
      } as CSSProperties}
    >
      {/* 1. header — node-id=44-336 */}
      <header data-testid="projects-select-header" style={headerStyle}>
        <div style={headerLogoStyle}>M</div>
        <span style={headerWordmarkStyle}>Macro2PR</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: tokens.md }}>
          <CreditsBadge />
          <HeaderUser />
          <Avatar />
        </div>
      </header>

      {/* Layout principal — sidebar + main */}
      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0 }}>
        {/* 2. sidebar — node-id=27-263 */}
        <aside data-testid="projects-select-sidebar" style={sidebarStyle}>
          <div style={sidebarSectionStyle}>
            <p style={sidebarSectionTitleStyle}>PRINCIPAL</p>
            <a href="#" style={sidebarItemActiveStyle}>
              <span style={sidebarItemIconStyle}>🏠</span>
              Início / Acesso
            </a>
            <a href="#" style={sidebarItemStyle}>
              <span style={sidebarItemIconStyle}>📁</span>
              Workspace
            </a>
            <a href="#" style={sidebarItemStyle}>
              <span style={sidebarItemIconStyle}>📋</span>
              Detalhe da Demanda
            </a>
            <a href="#" style={sidebarItemStyle}>
              <span style={sidebarItemIconStyle}>🔍</span>
              Revisão de Resultados
            </a>
          </div>
          <div style={sidebarSectionStyle}>
            <p style={sidebarSectionTitleStyle}>FINANCEIRO</p>
            <a href="#" style={sidebarItemStyle}>
              <span style={sidebarItemIconStyle}>💳</span>
              Créditos & Faturamento
            </a>
          </div>
          <div style={sidebarSectionStyle}>
            <p style={sidebarSectionTitleStyle}>GESTÃO</p>
            <a href="#" style={sidebarItemStyle}>
              <span style={sidebarItemIconStyle}>👥</span>
              Contas de Desenvolvedores
            </a>
          </div>
        </aside>

        {/* 3. main — node-id=2-8377 */}
        <main data-testid="projects-select-main" style={{ flex: 1, width: '100%', minHeight: 0 }}>
          {/* 4. cabeçalho — node-id=2-8379 */}
          <header data-testid="projects-select-cabecalho" style={pageHeaderStyle}>
            <div>
              <h1 role="heading" style={pageHeaderTitleStyle}>
                Projetos e Demandas
              </h1>
              <p style={pageHeaderSubtitleStyle}>
                Gerencie seus Projetos associados a Repositórios e acompanhe suas
                Demandas.
              </p>
            </div>
            <div style={pageHeaderActionsStyle}>
              <button
                type="button"
                role="button"
                style={actionButtonStyle}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = tokens.primariaHover;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = tokens.primaria;
                }}
              >
                + Novo Projeto
              </button>
              <button
                type="button"
                role="button"
                style={actionButtonStyle}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = tokens.primariaHover;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = tokens.primaria;
                }}
              >
                + Nova Demanda
              </button>
            </div>
          </header>

          {selectedProject && (
            <div style={selectedRepoBannerStyle}>
              <span style={{ fontWeight: '600', color: tokens.primaria, fontSize: 12 }}>
                Repositório selecionado:
              </span>
              <span style={selectedRepoTextStyle}>
                {selectedProject.repositoryName}
              </span>
            </div>
          )}

          {/* 5. layout — node-id=2-8394 */}
          <div data-testid="projects-select-layout" style={columnsStyle}>
            {/* 6. seção projetos — node-id=2-8395 */}
            <section
              data-testid="projects-select-projetos"
              style={columnStyle}
            >
              <h2 role="heading" style={columnTitleStyle}>
                Projetos
              </h2>
              <div data-testid="projects-select-list" style={listStyle}>
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    selected={selectedId === project.id}
                    onSelect={() => handleSelect(project)}
                  />
                ))}
              </div>
            </section>

            {/* 7. seção demandas — node-id=2-8451 */}
            <section
              data-testid="projects-select-demandas"
              style={columnStyle}
            >
              <h2 role="heading" style={columnTitleStyle}>
                Demandas
              </h2>
              {selectedProject ? (
                demands.length > 0 ? (
                  <div style={listStyle}>
                    {demands.map((demand) => (
                      <DemandCard
                        key={demand.id}
                        demand={demand}
                        onOpen={() => {
                          // placeholder: abertura de demanda (issue futura)
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={emptyStateStyle}>
                    Nenhuma demanda neste projeto.
                  </div>
                )
              ) : (
                <div style={emptyStateStyle}>
                  Selecione um projeto para ver suas demandas.
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* Warning message at bottom */}
      <div style={{ padding: `${tokens.sm}px ${tokens.xl}px` }}>
        <WarningMessage />
      </div>
    </section>
  );
}
