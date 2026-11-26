/**
 * Modal de criação de Demanda — abre na tela /projects (via botão "+ Nova Demanda").
 *
 * CA1: com dados válidos (título, descrição, tipo, prioridade, projectId) chama
 * apiService.createDemand e recebe o objeto completo com `id`.
 * CA2: com qualquer campo obrigatório vazio, exibe erro e NÃO chama createDemand.
 * CA4: renderiza um <select> de projetos carregado via GET /projects para o
 * usuário escolher onde associar a Demanda.
 * NC-01: não fecha o modal em caso de erro HTTP (response.ok false).
 *
 * Estilos inline (style) para funcionar no jsdom. Design tokens do modo claro.
 */
import { type CSSProperties, useEffect, useState } from 'react';
import { apiService, ApiError } from '../auth/apiService';

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
type DemandType = 'feature' | 'bug' | 'refactor';
type DemandPriority = 'low' | 'medium' | 'high';

interface Project {
  id: string;
  name: string;
}

interface CreateDemandFormData {
  title: string;
  description: string;
  type: DemandType;
  priority: DemandPriority;
  projectId: string;
}

interface CreateDemandModalProps {
  onClose: () => void;
}

/**
 * Converte o erro lançado por `apiService.createDemand` em uma mensagem
 * amigável para o usuário, de acordo com o status HTTP. Nunca fecha o modal:
 * NC-01 — o modal permanece aberto em caso de erro HTTP (400, 403, 401, etc.)
 * e de erro de rede.
 */
function mensagemDeErroParaUsuario(err: unknown): string {
  if (err instanceof ApiError) {
    switch (err.status) {
      case 400:
        return 'Campo inválido. Verifique os dados preenchidos.';
      case 403:
        return 'Sem permissão para criar uma Demanda neste Projeto.';
      default:
        // 401 (já tratado por `request()`: remove token e redireciona) e outros
        // status exibem a mensagem recebida do corpo da resposta.
        return err.message || 'Não foi possível criar a Demanda.';
    }
  }
  // Sem resposta do servidor: erro de rede (a requisição falhou antes da resposta).
  return 'Erro de conexão com o servidor. Verifique sua internet e tente novamente.';
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

  return (
    <section style={overlayStyle} onClick={onClose}>
      <button type="button" aria-label="Fechar modal" style={closeStyle} onClick={onClose}>
        ✕
      </button>
      <section style={modalCardStyle} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        {children}
      </section>
    </section>
  );
}

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

const textareaStyle: CSSProperties = {
  fontFamily: tokens.font,
  fontSize: 14,
  color: tokens.texto,
  padding: '8px 10px',
  border: `1px solid ${tokens.border}`,
  borderRadius: 6,
  backgroundColor: tokens.superficieCard,
  width: '100%',
  boxSizing: 'border-box',
  minHeight: 96,
  resize: 'vertical',
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

const submitButtonHoverStyle: CSSProperties = {
  backgroundColor: tokens.primariaHover,
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

export function CreateDemandModal({ onClose }: CreateDemandModalProps) {
  const [form, setForm] = useState<CreateDemandFormData>({
    title: '',
    description: '',
    type: 'feature',
    priority: 'medium',
    projectId: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [createdDemandId, setCreatedDemandId] = useState<string | null>(null);

  const handleChange = (field: keyof CreateDemandFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      setProjectsLoading(true);
      try {
        const response = await apiService.request('/projects');
        if (!response.ok) {
          throw new Error(`Falha ao carregar projetos: ${response.status}`);
        }
        const { data } = (await response.json()) as { data: Project[] };
        if (!cancelled) {
          setProjects(data);
          if (data.length > 0 && !form.projectId) {
            setForm((prev) => ({ ...prev, projectId: data[0].id }));
          }
        }
      } catch {
        if (!cancelled) {
          setProjects([]);
        }
      } finally {
        if (!cancelled) {
          setProjectsLoading(false);
        }
      }
    }

    loadProjects();
    return () => {
      cancelled = true;
    };
  }, [form.projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // CA2: validação de campos obrigatórios
    if (!form.title.trim()) {
      setError('O campo título precisa ser preenchido.');
      return;
    }
    if (!form.description.trim()) {
      setError('O campo descrição precisa ser preenchido.');
      return;
    }
    if (!form.type) {
      setError('O campo tipo precisa ser preenchido.');
      return;
    }
    if (!form.priority) {
      setError('O campo prioridade precisa ser preenchido.');
      return;
    }
    if (!form.projectId) {
      setError('Selecione um Projeto.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      // CA1: createDemand retorna o objeto completo com o `id` gerado
      const demand = await apiService.createDemand(form);
      setSubmitting(false);
      setCreatedDemandId(demand.id);
      onClose();
    } catch (err) {
      // NC-01: não fecha o modal em caso de erro HTTP (400, 403, 401, etc.) nem de rede.
      setSubmitting(false);
      setError(mensagemDeErroParaUsuario(err));
    }
  };

  const typeOptions: DemandType[] = ['feature', 'bug', 'refactor'];
  const priorityOptions: DemandPriority[] = ['low', 'medium', 'high'];

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
          Criar Nova Demanda
        </h2>

        <FormField
          label="Título"
          input={
            <input
              data-testid="create-demand-input-title"
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Título da Demanda"
              style={inputStyle as CSSProperties}
            />
          }
        />

        <FormField
          label="Descrição"
          input={
            <textarea
              data-testid="create-demand-input-description"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descreva o objetivo desta Demanda"
              style={textareaStyle as CSSProperties}
            />
          }
        />

        <FormField
          label="Tipo"
          input={
            <select
              data-testid="create-demand-select-type"
              value={form.type}
              onChange={(e) => handleChange('type', e.target.value as DemandType)}
              style={selectStyle as CSSProperties}
            >
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {t === 'feature' ? 'Nova funcionalidade' : t === 'bug' ? 'Correção de bug' : 'Refatoração'}
                </option>
              ))}
            </select>
          }
        />

        <FormField
          label="Prioridade"
          input={
            <select
              data-testid="create-demand-select-priority"
              value={form.priority}
              onChange={(e) => handleChange('priority', e.target.value as DemandPriority)}
              style={selectStyle as CSSProperties}
            >
              {priorityOptions.map((p) => (
                <option key={p} value={p}>
                  {p === 'low' ? 'Baixa' : p === 'medium' ? 'Média' : 'Alta'}
                </option>
              ))}
            </select>
          }
        />

        <p
          style={{
            fontFamily: tokens.font,
            fontSize: 12,
            color: tokens.textoSuave,
            margin: '0 0 8px 0',
            lineHeight: '1.4',
          }}
        >
          Os campos obrigatórios precisam ser preenchidos antes da criação.
        </p>

        {projectsLoading ? (
          <span style={{ fontFamily: tokens.font, fontSize: 12, color: tokens.textoSuave }}>
            Carregando projetos…
          </span>
        ) : (
          <FormField
            label="Projeto"
            input={
              <select
                data-testid="create-demand-select-project"
                value={form.projectId}
                onChange={(e) => handleChange('projectId', e.target.value)}
                style={selectStyle as CSSProperties}
              >
                <option value="">Escolha um Projeto</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            }
          />
        )}

        {createdDemandId && (
          <span
            data-testid="create-demand-created-id"
            style={{
              fontFamily: tokens.font,
              fontWeight: '600',
              fontSize: 13,
              color: tokens.texto,
              marginTop: tokens.sm,
              padding: `${tokens.sm}px ${tokens.md}px`,
              backgroundColor: tokens.superficieSidebar,
              borderRadius: 6,
              border: `1px solid ${tokens.border}`,
              display: 'inline-block',
            } as CSSProperties}
          >
            Demanda criada com ID: {createdDemandId}
          </span>
        )}

        {error && (
          <span
            data-testid="create-demand-error"
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
            data-testid="create-demand-submit"
            disabled={submitting}
            style={{
              ...submitButtonStyle,
              ...(submitting
                ? { backgroundColor: tokens.primariaRgba004 ?? '#C7D2FE', opacity: 0.6, cursor: 'not-allowed' }
                : {}),
            } as CSSProperties}
            onMouseEnter={(ev) => {
              if (submitting) return;
              (ev.currentTarget as HTMLButtonElement).style.backgroundColor = tokens.primariaHover;
            }}
            onMouseLeave={(ev) => {
              if (submitting) return;
              (ev.currentTarget as HTMLButtonElement).style.backgroundColor = tokens.primaria;
            }}
          >
            {submitting ? 'Criando…' : 'Criar Demanda'}
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
