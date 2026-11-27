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
import { useNavigate } from 'react-router-dom';
import { apiService } from '../auth/apiService';
import { Header } from '../layout/Header';
import { Sidebar, defaultSidebarSections } from '../layout/Sidebar';
import { CreateDemandModal } from '../demands/CreateDemandModal';
import { CreateProjectModal, type Repository } from './CreateProjectModal';

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
  demands?: Demand[];
  navigate?: (to: string) => void;
}

// --- Componentes internos ---------------------------------------------------
function BoltIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M8 1L3 8h3.2L5.5 13 11 6H7.8L8 1z"
        fill="#F59E0B"
        stroke="#D97706"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// --- Componentes internos ---------------------------------------------------
function FolderIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 4H4c-0.53 0-1 0.47-1 1v1H2v8c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V5c0-0.55-0.45-1-1-1h-6V4z"
        fill="#6B7280"
      />
      <path
        d="M4 4h6v1H4V4z"
        fill="#E5E7EB"
        stroke="#6B7280"
        strokeWidth="1"
      />
    </svg>
  );
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
      <path d="M1.75 6.5h12.5M4.5 10h2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconContas() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="6" cy="5" r="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2.5 13c0-2 1.6-3.5 3.5-3.5s3.5 1.5 3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M10.5 3.5a2 2 0 0 1 0 4M11 9.7c1.7.4 2.8 1.6 2.8 3.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconList() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M5 3.5h7M5 7h7M5 10.5h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M1.8 3.5h.01M1.8 7h.01M1.8 10.5h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconCheckCircle() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.3" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.5 7l1.7 1.7L9.5 5.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
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
    padding: selected ? '26px' : '25px',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.lg,
    width: '100%',
    boxSizing: 'border-box',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: selected ? '0px 1px 2px 0px rgba(0,0,0,0.05)' : undefined,
  } as CSSProperties;

  const badgeStyle: CSSProperties = {
    backgroundColor: tokens.primariaRgba004,
    color: tokens.primaria,
    borderRadius: 9999,
    padding: '4px 8px',
    fontFamily: tokens.font,
    fontWeight: '500',
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

  const selectLinkStyle: CSSProperties = {
    backgroundColor: 'transparent',
    color: tokens.primaria,
    border: 'none',
    borderRadius: 0,
    padding: 0,
    fontFamily: tokens.font,
    fontWeight: '500',
    fontSize: 12,
    cursor: 'pointer',
    lineHeight: '1',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
  };

  return (
    <article
      data-testid={`project-card-${project.id}`}
      style={cardStyle as CSSProperties}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <FolderIcon />
          <p style={nameStyle}>{project.name}</p>
        </div>
        {selected ? (
          <span role="status" aria-label="Selecionado" style={badgeStyle as CSSProperties}>
            Selecionado
          </span>
        ) : (
          <button
            type="button"
            role="button"
            aria-label={`Selecionar ${project.name}`}
            style={selectLinkStyle as CSSProperties}
            onClick={onSelect}
          >
            Selecionar
          </button>
        )}
      </div>
      <div style={{ height: 1, backgroundColor: '#E5E7EB', width: '100%' }} />
      <p style={statsStyle}>
        <IconList />
        {project.demandCount} demanda{project.demandCount !== 1 ? 's' : ''}
      </p>
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
  const statusColors: Record<string, { bg: string; fg: string }> = {
    Draft: { bg: '#F3F4F6', fg: tokens.textoSuave },
    AwaitingPlanApproval: { bg: 'rgba(97, 100, 241, 0.12)', fg: tokens.primaria },
    AwaitingNewPlan: { bg: 'rgba(97, 100, 241, 0.12)', fg: tokens.primaria },
    PlanApproved: { bg: 'rgba(22, 163, 74, 0.12)', fg: tokens.sucesso },
    InExecution: { bg: 'rgba(97, 100, 241, 0.12)', fg: tokens.primaria },
    ReadyForPR: { bg: 'rgba(97, 100, 241, 0.12)', fg: tokens.primaria },
    Concluded: { bg: 'rgba(22, 163, 74, 0.12)', fg: tokens.sucesso },
  };

  const cardStyle: CSSProperties = {
    backgroundColor: tokens.superficieCard,
    border: `1px solid ${tokens.border}`,
    borderRadius: 10,
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
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

  const statusColor = statusColors[demand.status] || { bg: '#F3F4F6', fg: tokens.textoSuave };

  const badgeStyle: CSSProperties = {
    backgroundColor: statusColor.bg,
    color: statusColor.fg,
    borderRadius: 9999,
    padding: '4px 8px',
    fontFamily: tokens.font,
    fontWeight: '500',
    fontSize: 11,
    lineHeight: '1',
    alignSelf: 'flex-start',
    whiteSpace: 'nowrap',
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
    borderRadius: 0,
    padding: 0,
    fontFamily: tokens.font,
    fontWeight: '500',
    fontSize: 12,
    cursor: 'pointer',
    lineHeight: '1',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
  };

  return (
    <article style={cardStyle as CSSProperties}>
      <div style={titleRowStyle}>
        <p style={titleStyle}>{demand.title}</p>
        <span style={badgeStyle}>{demand.status}</span>
      </div>
      <div style={{ height: 1, backgroundColor: '#E5E7EB', width: '100%' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: tokens.md }}>
        <p style={metaStyle}>
          <IconCheckCircle />
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
      </div>
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
      <span style={{ color: tokens.primaria, display: 'inline-flex' }} aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M7 6.3v3.4M7 4.3h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </span>
      <p style={{ margin: 0 }}>
        Cada Repositório só pode estar associado a um único Projeto para sua
        conta de Desenvolvedor.
      </p>
    </div>
  );
}

// --- Componente principal ---------------------------------------------------
export function ProjectsSelect({ onProjectSelect, demands: initialDemands, navigate: navigateProp }: ProjectsSelectProps = {}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [demands, setDemands] = useState<Demand[]>(initialDemands ?? []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDemandModal, setOpenDemandModal] = useState(false);
  const [openProjectModal, setOpenProjectModal] = useState(false);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [syncResult, setSyncResult] = useState<{ synced: number } | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const navigate = navigateProp ?? useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      setLoading(true);
      setError(null);
      try {
        // Projetos do desenvolvedor (CA4)
        const projectsResponse = await apiService.request('/projects');
        if (!projectsResponse.ok) {
          throw new Error(`Falha ao carregar projetos: ${projectsResponse.status}`);
        }
        const { data: projectsData } = (await projectsResponse.json()) as { data: Project[] };
        if (!cancelled) {
          setProjects(projectsData);
        }

        // Repositórios disponíveis para associar a um novo Projeto (Bug C)
        const repositoriesResponse = await apiService.request('/projects/repositories');
        if (!repositoriesResponse.ok) {
          throw new Error(`Falha ao carregar repositórios: ${repositoriesResponse.status}`);
        }
        const { data: repositoriesData } = (await repositoriesResponse.json()) as { data: Repository[] };
        if (!cancelled) {
          setRepositories(repositoriesData);
        }
      } catch (err) {
        if (!cancelled) {
          // Erro de rede: a requisição falhou antes de obter resposta do servidor
          // (ex: TypeError: Failed to fetch). Não é um status HTTP.
          // O 401 já é tratado globalmente por `apiService.request()` (remove token
          // e redireciona para /login), portanto não é duplicado aqui.
          const isNetworkError = err instanceof TypeError && /failed to fetch/i.test(err.message);
          setError(isNetworkError
            ? 'Erro de conexão com o servidor. Verifique sua internet e tente novamente.'
            : err instanceof Error ? err.message : 'Erro ao carregar projetos');
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
    onProjectSelect?.(project);
  };

  const handleProjectCreated = (project: { id: string; name: string; repositoryId: string }) => {
    setProjects((prev) => [
      {
        id: project.id,
        name: project.name,
        demandCount: 0,
      } as Project,
      ...prev,
    ]);
    setSelectedId(project.id);
    setDemands([]);
  };

  const handleSyncRepositories = async () => {
    setSyncing(true);
    setSyncError(null);
    setSyncResult(null);
    try {
      const result = await apiService.syncRepositories();
      setSyncResult(result);
      // Atualiza a lista local de repositórios com o resultado do sync
      setRepositories(result.repositories);
    } catch (err) {
      setSyncError(
        err instanceof Error ? err.message : 'Erro ao sincronizar repositórios',
      );
    } finally {
      setSyncing(false);
    }
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
  const columnGap = tokens.xl;

  // 4. cabeçalho (node-id=2-8379) — cabeçalho da página
  const pageHeaderStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: tokens.lg,
    padding: `${tokens.xl}px ${tokens.xl}px ${tokens.lg}px`,
    borderBottom: '1px solid #E5E7EB',
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
    flexShrink: 0,
    marginTop: 2,
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

  const actionButtonOutlineStyle: CSSProperties = {
    backgroundColor: '#FFFFFF',
    color: tokens.texto,
    border: `1px solid ${tokens.border}`,
    borderRadius: 6,
    padding: '8px 14px',
    fontFamily: tokens.font,
    fontWeight: '500',
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
    margin: 0,
    lineHeight: '22px',
  } as CSSProperties;

  const projectsBadgeStyle: CSSProperties = {
    fontFamily: tokens.font,
    fontWeight: '500',
    fontSize: 12,
    color: tokens.textoSuave,
    backgroundColor: '#FFFFFF',
    border: `1px solid ${tokens.border}`,
    borderRadius: 9999,
    padding: '4px 10px',
    lineHeight: '1',
    whiteSpace: 'nowrap',
  } as CSSProperties;

  const listStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.md,
    flex: 1,
  } as CSSProperties;

  const emptyStateStyle: CSSProperties = {
    fontFamily: tokens.font,
    fontSize: 13,
    color: tokens.textoSuave,
    padding: tokens.xl,
    borderRadius: 8,
    backgroundColor: tokens.superficieCard,
    border: `1px solid ${tokens.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  } as CSSProperties;

  const selectedRepoBannerInlineStyle: CSSProperties = {
    fontFamily: tokens.font,
    fontWeight: '400',
    fontSize: 12,
    color: tokens.textoSuave,
    lineHeight: '1.4',
    marginTop: -4,
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
      {/* 1. header — node-id=44-336 (componente reutilizável Header) */}
      <Header />

      {/* Layout principal — sidebar + main */}
      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0 }}>
        {/* 2. sidebar — node-id=27-263 (componente reutilizável Sidebar) */}
        <Sidebar sections={defaultSidebarSections} />

        {/* 3. main — node-id=2-8377 */}
        <main data-testid="projects-select-main" style={{ flex: 1, width: '100%', minHeight: 0, padding: `0 ${tokens.xl}px ${tokens.xl}px` }}>
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
                style={actionButtonOutlineStyle}
                onClick={() => setOpenProjectModal(true)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = tokens.primariaRgba004;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFFFFF';
                }}
              >
                + Novo Projeto
              </button>
              <button
                type="button"
                role="button"
                style={actionButtonStyle}
                onClick={() => setOpenDemandModal(true)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = tokens.primariaHover;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = tokens.primaria;
                }}
              >
                + Nova Demanda
              </button>
              <button
                type="button"
                role="button"
                aria-label="Re-sincronizar repositórios do GitHub"
                style={actionButtonOutlineStyle}
                onClick={handleSyncRepositories}
                disabled={syncing}
              >
                {syncing ? 'Sincronizando…' : '↻ Re-sincronizar repositórios'}
              </button>
            </div>
          </header>

          {/* Exibição do resultado da re-sincronização de repositórios */}
          {syncError && (
            <div
              data-testid="repos-sync-error"
              style={{
                backgroundColor: '#FEE2E2',
                border: `1px solid ${tokens.perigo}`,
                color: tokens.perigo,
                borderRadius: 6,
                padding: `${tokens.sm}px ${tokens.md}px`,
                marginBottom: tokens.md,
                fontFamily: tokens.font,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.xs,
              } as CSSProperties}
            >
              <span aria-hidden="true">⚠</span>
              <span>Erro ao sincronizar repositórios: {syncError}</span>
            </div>
          )}
          {syncResult && !syncError && (
            <div
              data-testid="repos-sync-success"
              style={{
                backgroundColor: '#DCFCE7',
                border: `1px solid ${tokens.sucesso}`,
                color: '#14532d',
                borderRadius: 6,
                padding: `${tokens.sm}px ${tokens.md}px`,
                marginBottom: tokens.md,
                fontFamily: tokens.font,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.xs,
              } as CSSProperties}
            >
              <span aria-hidden="true">✓</span>
              <span>
                {syncResult.synced} repositório{syncResult.synced !== 1 ? 's' : ''} sincronizado{syncResult.synced !== 1 ? 's' : ''}
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: tokens.md, minHeight: 22 }}>
                <h2 role="heading" style={columnTitleStyle}>
                  Projetos
                </h2>
                <div style={projectsBadgeStyle}>
                  {projects.length} Projetos
                </div>
              </div>
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
              {projects.length > 0 && <WarningMessage />}
            </section>

            {/* 7. seção demandas — node-id=2-8451 */}
            <section
              data-testid="projects-select-demandas"
              style={columnStyle}
            >
              <div style={{ display: 'flex', alignItems: 'center', minHeight: 22 }}>
                <h2 role="heading" style={{ ...columnTitleStyle, margin: 0 }}>
                  Demandas
                </h2>
              </div>
              {selectedProject && (
                <div style={selectedRepoBannerInlineStyle}>
                  Repositório selecionado:{' '}
                  <span style={{ fontWeight: '600', color: tokens.texto }}>
                    {selectedProject.repositoryName}
                  </span>
                </div>
              )}
              {selectedProject ? (
                demands.length > 0 ? (
                  <div style={listStyle}>
                    {demands.map((demand) => (
                      <DemandCard
                        key={demand.id}
                        demand={demand}
                        onOpen={() => navigate(`/demands/${demand.id}`)}
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

      {openDemandModal && (
        <CreateDemandModal
          onClose={() => setOpenDemandModal(false)}
        />
      )}
      {openProjectModal && (
        <CreateProjectModal
          repositories={repositories}
          onClose={() => setOpenProjectModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </section>
  );
}
