/**
 * Modal de criação de Projeto — abre na tela /projects (via botão "+ Novo Projeto").
 *
 * Recebe a lista de repositórios disponíveis (via prop) e permite associar um
 * novo Projeto a um Repositório. Chama apiService.createProject ao submeter.
 *
 * Estilos inline (style) para funcionar no jsdom. Design tokens do modo claro.
 */
import { type CSSProperties, useState } from 'react';
import { apiService } from '../auth/apiService';

// --- Design tokens (modo claro) ---------------------------------------------
const tokens = {
  // Cores
  primaria: '#6164F1',
  primariaHover: '#4F46E5',
  superficieCard: '#FFFFFF',
  superficieSidebar: '#F9FAFB',
  texto: '#111827',
  textoSuave: '#6B7280',
  perigo: '#DC2626',
  border: '#6B7280',
  overlay: 'rgba(0, 0, 0, 0.5)',

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
export interface Repository {
  id: string;
  name: string;
  fullName?: string;
}

interface CreateProjectModalProps {
  repositories: Repository[];
  onClose: () => void;
  onProjectCreated?: (project: { id: string; name: string; repositoryId: string }) => void;
}

// --- Componentes internos ---------------------------------------------------
function ModalOverlay({ onClose, children }: { onClose: () => void; children: JSX.Element }) {
  const overlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: tokens.overlay,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  } as CSSProperties;

  const closeStyle: CSSProperties = {
    position: 'absolute',
    top: tokens.xl,
    right: tokens.xl,
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: 24,
    color: tokens.textoSuave,
    cursor: 'pointer',
    lineHeight: 1,
  } as CSSProperties;

  const modalCardStyle: CSSProperties = {
    backgroundColor: tokens.superficieCard,
    borderRadius: 12,
    padding: tokens['2xl'],
    width: 480,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.lg,
  } as CSSProperties;

  return (
    <section style={overlayStyle} onClick={onClose}>
      <button type="button" aria-label="Fechar modal" style={closeStyle} onClick={onClose}>
        ✕
      </button>
      <section
        style={modalCardStyle as CSSProperties}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {children}
      </section>
    </section>
  );
}

function FormField({
  label,
  input,
  error,
}: {
  label: string;
  input: JSX.Element;
  error?: string;
}) {
  const labelStyle: CSSProperties = {
    fontFamily: tokens.font,
    fontWeight: '500',
    fontSize: 14,
    color: tokens.texto,
    margin: '0 0 6px 0',
  } as CSSProperties;

  const errorStyle: CSSProperties = {
    fontFamily: tokens.font,
    fontWeight: '400',
    fontSize: 12,
    color: tokens.perigo,
    margin: '4px 0 0 0',
  } as CSSProperties;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <label style={labelStyle}>{label}</label>
      {input}
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
}

const selectStyle: CSSProperties = {
  fontFamily: tokens.font,
  fontSize: 14,
  color: tokens.texto,
  padding: '8px 10px',
  border: `1px solid ${tokens.border}`,
  borderRadius: 6,
  backgroundColor: tokens.superficieCard,
  width: '100%',
  boxSizing: 'border-box',
} as CSSProperties;

const inputStyle: CSSProperties = {
  fontFamily: tokens.font,
  fontSize: 14,
  color: tokens.texto,
  padding: '8px 10px',
  border: `1px solid ${tokens.border}`,
  borderRadius: 6,
  backgroundColor: tokens.superficieCard,
  width: '100%',
  boxSizing: 'border-box',
} as CSSProperties;

const submitButtonStyle: CSSProperties = {
  backgroundColor: tokens.primaria,
  color: '#FFFFFF',
  border: 'none',
  borderRadius: 6,
  padding: '10px 16px',
  fontFamily: tokens.font,
  fontWeight: '600',
  fontSize: 14,
  cursor: 'pointer',
  alignSelf: 'flex-start',
} as CSSProperties;

const cancelButtonStyle: CSSProperties = {
  backgroundColor: 'transparent',
  color: tokens.textoSuave,
  border: `1px solid ${tokens.border}`,
  borderRadius: 6,
  padding: '8px 14px',
  fontFamily: tokens.font,
  fontWeight: '500',
  fontSize: 14,
  cursor: 'pointer',
  marginLeft: tokens.sm,
} as CSSProperties;

export function CreateProjectModal({ repositories, onClose, onProjectCreated }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [repositoryId, setRepositoryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('O campo nome precisa ser preenchido.');
      return;
    }
    if (!repositoryId) {
      setError('Selecione um Repositório.');
      return;
    }

    setError(null);
    setSubmitting(true);

    apiService
      .createProject({ name, repositoryId })
      .then(async (response) => {
        setSubmitting(false);
        if (!response.ok) {
          setError('Não foi possível criar o Projeto. Tente novamente.');
          return;
        }
        const { data } = await response.json();
        onProjectCreated?.(data);
        onClose();
      })
      .catch(() => {
        setSubmitting(false);
        setError('Não foi possível criar o Projeto. Tente novamente.');
      });
  };

  return (
    <ModalOverlay onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: tokens.lg }}>
        <h2
          role="heading"
          style={{
            fontFamily: tokens.font,
            fontWeight: '700',
            fontSize: 24,
            color: tokens.texto,
            margin: 0,
            lineHeight: '1.2',
          } as CSSProperties}
        >
          Novo Projeto
        </h2>

        <FormField
          label="Nome do Projeto"
          input={
            <input
              data-testid="create-project-input-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do Projeto"
              style={inputStyle as CSSProperties}
            />
          }
        />

        <FormField
          label="Repositório"
          input={
            <select
              data-testid="create-project-select-repository"
              value={repositoryId ?? ''}
              onChange={(e) => setRepositoryId(e.target.value || null)}
              style={selectStyle as CSSProperties}
            >
              <option value="">Escolha um Repositório</option>
              {repositories.map((repo) => (
                <option key={repo.id} value={repo.id}>
                  {repo.fullName ?? repo.name}
                </option>
              ))}
            </select>
          }
        />

        {error && (
          <span
            data-testid="create-project-error"
            style={{
              fontFamily: tokens.font,
              fontWeight: '400',
              fontSize: 12,
              color: tokens.perigo,
              marginTop: tokens.sm,
            } as CSSProperties}
          >
            {error}
          </span>
        )}

        <div style={{ display: 'flex', gap: tokens.sm, marginTop: tokens.sm }}>
          <button
            type="submit"
            role="button"
            data-testid="create-project-submit"
            disabled={submitting}
            style={submitButtonStyle as CSSProperties}
          >
            {submitting ? 'Criando…' : 'Criar Projeto'}
          </button>
          <button
            type="button"
            role="button"
            onClick={onClose}
            disabled={submitting}
            style={cancelButtonStyle as CSSProperties}
          >
            Cancelar
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}
