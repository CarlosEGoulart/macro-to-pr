/**
 * Tela de seletor de Projeto — consome GET /projects e exibe a lista de
 * projetos do desenvolvedor autenticado para seleção (CA4).
 *
 * Segue o design do Figma (node-id 2:8315) e os tokens de design (modo claro).
 * Estilos aplicados via `style` (inline) para funcionarem no jsdom.
 */
import { type CSSProperties, useEffect, useState } from 'react';
import { apiService } from '../auth/apiService';

// --- Design tokens (modo claro) ---------------------------------------------
const tokens = {
  // Cores
  primaria: '#6164F1',
  primariaRgba004: 'rgba(97, 100, 241, 0.04)',
  superficieCard: '#FFFFFF',
  superficieSidebar: '#F9FAFB',
  texto: '#111827',
  textoSuave: '#6B7280',
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
    padding: 26,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    width: '100%',
    boxSizing: 'border-box',
    cursor: 'pointer',
  };

  const badgeStyle: CSSProperties = {
    backgroundColor: tokens.primaria,
    color: tokens.texto,
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
    fontWeight: '400',
    fontSize: 14,
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
    color: tokens.textoSuave,
    border: 'none',
    borderRadius: 4,
    padding: '4px 8px',
    fontFamily: tokens.font,
    fontWeight: '400',
    fontSize: 12,
    color: tokens.textoSuave,
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
        <ProjectIcon />
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
        const data = (await response.json()) as Project[];
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
          color: '#DC2626',
        } as CSSProperties}
      >
        {error}
      </section>
    );
  }

  return (
    <section
      data-testid="projects-select-root"
      style={{
        fontFamily: tokens.font,
        backgroundColor: tokens.superficieSidebar,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.lg,
        width: '100%',
        padding: tokens.xl,
        boxSizing: 'border-box',
      } as CSSProperties}
    >
      <div
        data-testid="projects-select-header"
        style={{ display: 'flex', alignItems: 'center', gap: tokens.sm }}
      >
        <h3
          role="heading"
          style={{
            fontFamily: tokens.font,
            fontWeight: '600',
            fontSize: 18,
            color: tokens.texto,
            margin: 0,
            lineHeight: '1.2',
          } as CSSProperties}
        >
          Projetos
        </h3>
        <span
          style={{
            fontFamily: tokens.font,
            fontWeight: '400',
            fontSize: 12,
            color: tokens.textoSuave,
            lineHeight: '1',
          } as CSSProperties}
        >
          {projects.length} Projetos
        </span>
      </div>

      <div
        data-testid="projects-select-list"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.md,
        } as CSSProperties}
      >
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            selected={selectedId === project.id}
            onSelect={() => handleSelect(project)}
          />
        ))}
      </div>

      <WarningMessage />
    </section>
  );
}
