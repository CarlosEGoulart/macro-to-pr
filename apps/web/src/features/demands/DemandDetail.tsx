/**
 * Tela de detalhe de Demanda — /demandas.
 *
 * Reproduz fielmente o protótipo do Figma (node-id=2-8107):
 * - Link "Voltar ao Workspace" abaixo do header (não dentro dele)
 * - Título da demanda com badge de status variável por status
 * - Linha de metadados: Projeto e Repositório em chips lado a lado
 * - Tabs Plano / Tarefas / Pull Request com ícones e badge de contagem
 * - Seção de Tarefas com cards, tentativas, decisões e ações
 * - Painel lateral "Política de Créditos"
 *
 * Reutiliza os componentes Header e Sidebar. Estilos inline (style) para jsdom.
 * Design tokens do modo claro.
 */
import { type CSSProperties } from 'react';
import { Header } from '../layout/Header';
import { Sidebar, defaultSidebarSections } from '../layout/Sidebar';

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
  sucesso: '#16A34A',
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
interface TaskAttemptResult {
  label: string;
  status: 'approved' | 'rejected' | 'pending';
}

interface DemandTask {
  number: number;
  title: string;
  status: 'Aprovada' | 'Rejeitada' | 'Pendente';
  attemptsCount: number;
  attempts: TaskAttemptResult[];
  message?: string;
  creditsConsumed?: number;
  canViewResult?: boolean;
  canRetry?: boolean;
  dependsOn?: string;
  canStartExecution?: boolean;
}

interface DemandDetailProps {
  demand: {
    id: string;
    title: string;
    description: string;
    type: 'feature' | 'bug' | 'refactor';
    priority: 'low' | 'medium' | 'high';
    status: string;
    projectName: string;
    repositoryName: string;
    taskCount: number;
    createdAt: string;
    tasks: DemandTask[];
  };
}

// --- Labels -----------------------------------------------------------------
const typeLabels: Record<string, string> = {
  feature: 'Nova funcionalidade',
  bug: 'Correção de bug',
  refactor: 'Refatoração',
};

const priorityLabels: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

// --- Estilos compartilhados --------------------------------------------------
const pageStyle: CSSProperties = {
  fontFamily: tokens.font,
  backgroundColor: tokens.superficieSidebar,
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  minHeight: '100vh',
  boxSizing: 'border-box',
} as CSSProperties;

const containerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
} as CSSProperties;

const columnsStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  gap: tokens.xl,
} as CSSProperties;

const leftColumnStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.md,
  flex: 1,
  minWidth: 0,
} as CSSProperties;

const rightColumnStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.md,
  width: 320,
  flexShrink: 0,
} as CSSProperties;

// --- Link "Voltar ao Workspace" (abaixo do header, não dentro) --------------
const backLinkStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: tokens.sm,
  color: tokens.textoSuave,
  textDecoration: 'none',
  cursor: 'pointer',
  fontFamily: tokens.font,
  fontSize: 12,
  marginBottom: tokens.xs,
} as CSSProperties;

const backArrowStyle: CSSProperties = {
  width: 8.4,
  height: 8.4,
  flexShrink: 0,
} as CSSProperties;

// --- Título da demanda + badge de status -------------------------------------
const demandTitleStyle: CSSProperties = {
  fontFamily: tokens.font,
  fontWeight: '600',
  fontSize: 24,
  color: tokens.texto,
  margin: 0,
  lineHeight: '1.2',
} as CSSProperties;

const statusBadgeStyle: (bg: string, fg: string) => CSSProperties = (bg, fg) => ({
  fontFamily: tokens.font,
  fontWeight: '500',
  fontSize: 11,
  color: fg,
  backgroundColor: bg,
  borderRadius: 9999,
  padding: '5px 10px',
  lineHeight: '1',
  whiteSpace: 'nowrap',
  alignSelf: 'flex-start',
  height: 28,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
} as CSSProperties);

const pulseDotStyle: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  backgroundColor: tokens.primaria,
  animation: 'pulse 2s infinite',
} as CSSProperties;

// --- Linha de metadados (projeto / repositório) ------------------------------
const metaRowStyle: CSSProperties = {
  display: 'flex',
  gap: tokens.sm,
  marginBottom: tokens.lg,
} as CSSProperties;

const metaChipStyle: CSSProperties = {
  backgroundColor: tokens.superficieCard,
  border: `1px solid ${tokens.border}`,
  borderRadius: 6,
  padding: '5px 13px',
  display: 'flex',
  alignItems: 'center',
  gap: tokens.sm,
  minWidth: 0,
} as CSSProperties;

const metaIconStyle: CSSProperties = {
  width: 8.4,
  height: 8.4,
  flexShrink: 0,
} as CSSProperties;

const metaLabelStyle: CSSProperties = {
  fontFamily: tokens.font,
  fontSize: 12,
  color: tokens.textoSuave,
  margin: 0,
} as CSSProperties;

const metaValueStyle: CSSProperties = {
  fontFamily: tokens.font,
  fontSize: 12,
  color: tokens.texto,
  fontWeight: '400',
  margin: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as CSSProperties;

// --- Tabs --------------------------------------------------------------------
const tabsContainerStyle: CSSProperties = {
  display: 'flex',
  gap: tokens.xl,
  borderBottom: `1px solid ${tokens.border}`,
  paddingBottom: tokens.xs,
  marginBottom: tokens.xl,
} as CSSProperties;

const tabStyle: CSSProperties = {
  fontFamily: tokens.font,
  fontSize: 14,
  color: tokens.textoSuave,
  margin: 0,
  paddingBottom: tokens.sm,
  borderBottom: `2px solid transparent`,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
} as CSSProperties;

const tabActiveStyle: CSSProperties = {
  ...tabStyle,
  color: tokens.texto,
  fontWeight: '600',
  borderBottom: `2px solid ${tokens.primaria}`,
  paddingBottom: tokens.xs - 2, // pb-14px vs pb-12px
} as CSSProperties;

const tabBadgeStyle: CSSProperties = {
  backgroundColor: 'rgba(97, 100, 241, 0.1)',
  borderRadius: 9999,
  padding: '0 8px',
  color: tokens.primaria,
  fontSize: 12,
  fontWeight: '400',
  marginLeft: 6,
  whiteSpace: 'nowrap',
} as CSSProperties;

// --- Seção de Tarefas --------------------------------------------------------
const sectionTitleStyle: CSSProperties = {
  fontFamily: tokens.font,
  fontWeight: '600',
  fontSize: 18,
  color: tokens.texto,
  margin: '0 0 4px 0',
  lineHeight: '22px',
} as CSSProperties;

const sectionDescriptionStyle: CSSProperties = {
  fontFamily: tokens.font,
  fontSize: 14,
  color: tokens.textoSuave,
  margin: 0,
  lineHeight: '1.5',
} as CSSProperties;

const taskCardStyle: CSSProperties = {
  backgroundColor: tokens.superficieCard,
  border: `1px solid ${tokens.border}`,
  borderRadius: 12,
  padding: '25px',
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.lg,
  width: '100%',
  boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)',
} as CSSProperties;

const taskHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: tokens.md,
} as CSSProperties;

const taskNumberTitleStyle: CSSProperties = {
  fontFamily: tokens.font,
  fontWeight: '400',
  fontSize: 14,
  color: tokens.texto,
  margin: 0,
  lineHeight: '1.4',
} as CSSProperties;

const taskAttemptsStyle: CSSProperties = {
  fontFamily: tokens.font,
  fontSize: 12,
  color: tokens.textoSuave,
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
} as CSSProperties;

const taskDividerStyle: CSSProperties = {
  height: 1,
  backgroundColor: '#E5E7EB',
  width: '100%',
  margin: '13px 0',
} as CSSProperties;

const taskFieldRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: tokens.sm,
  marginBottom: 13,
} as CSSProperties;

const taskFieldLabelStyle: CSSProperties = {
  fontFamily: tokens.font,
  fontSize: 12,
  color: tokens.textoSuave,
  margin: 0,
} as CSSProperties;

const taskFieldValueStyle: CSSProperties = {
  fontFamily: tokens.font,
  fontSize: 12,
  color: tokens.texto,
  margin: 0,
} as CSSProperties;

const messageBoxStyle: (bg: string, border: string, fg: string) => CSSProperties = (
  bg,
  border,
  fg
) => ({
  backgroundColor: bg,
  border: `1px solid ${border}`,
  borderRadius: 8,
  padding: '13px',
  display: 'flex',
  alignItems: 'center',
  gap: tokens.md,
  width: '100%',
} as CSSProperties);

const actionButtonStyle: (bg: string, fg: string, padding?: string) => CSSProperties = (
  bg,
  fg,
  padding = '8px 13px'
) => ({
  backgroundColor: bg,
  color: fg,
  border: 'none',
  borderRadius: 6,
  padding,
  fontFamily: tokens.font,
  fontSize: 12,
  fontWeight: '400',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  lineHeight: '1',
} as CSSProperties);

const borderButtonStyle: CSSProperties = {
  border: `1px solid ${tokens.primaria}`,
  color: tokens.primaria,
  backgroundColor: '#FFFFFF',
  borderRadius: 6,
  padding: '12px 13px',
  fontFamily: tokens.font,
  fontSize: 12,
  fontWeight: '400',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  lineHeight: '1',
} as CSSProperties;

const actionsRowStyle: CSSProperties = {
  display: 'flex',
  gap: tokens.sm,
  marginTop: 13,
} as CSSProperties;

// --- Painel lateral: Política de Créditos ------------------------------------
const panelCardStyle: CSSProperties = {
  backgroundColor: tokens.superficieCard,
  border: `1px solid ${tokens.border}`,
  borderRadius: 10,
  padding: '20px 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  width: '100%',
} as CSSProperties;

const panelTitleStyle: CSSProperties = {
  fontFamily: tokens.font,
  fontWeight: '600',
  fontSize: 14,
  color: tokens.texto,
  margin: 0,
  lineHeight: '1.4',
} as CSSProperties;

const panelItemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
} as CSSProperties;

const panelIconStyle: CSSProperties = {
  width: 16,
  height: 16,
  flexShrink: 0,
  marginTop: 2,
} as CSSProperties;

const panelTextStyle: CSSProperties = {
  fontFamily: tokens.font,
  fontSize: 13,
  color: tokens.texto,
  margin: 0,
  lineHeight: '1.4',
} as CSSProperties;

// --- Componente principal ----------------------------------------------------
export function DemandDetail({ demand }: DemandDetailProps) {
  const statusColors: Record<string, { bg: string; fg: string }> = {
    Draft: { bg: '#F3F4F6', fg: tokens.textoSuave },
    AwaitingPlanApproval: { bg: 'rgba(97, 100, 241, 0.12)', fg: tokens.primaria },
    AwaitingNewPlan: { bg: 'rgba(97, 100, 241, 0.12)', fg: tokens.primaria },
    PlanApproved: { bg: 'rgba(22, 163, 74, 0.12)', fg: tokens.sucesso },
    InExecution: { bg: 'rgba(97, 100, 241, 0.12)', fg: tokens.primaria },
    ReadyForPR: { bg: 'rgba(97, 100, 241, 0.12)', fg: tokens.primaria },
    Concluded: { bg: 'rgba(22, 163, 74, 0.12)', fg: tokens.sucesso },
  };

  const statusColor = statusColors[demand.status] || { bg: '#F3F4F6', fg: tokens.textoSuave };

  const isPending = demand.status === 'Pendente';

  return (
    <section style={pageStyle}>
      {/* Header reutilizável (SEM "Voltar ao Workspace" aqui) */}
      <Header />

      <div style={containerStyle}>
        {/* Sidebar reutilizável */}
        <Sidebar sections={defaultSidebarSections} />

        <main style={{ flex: 1, width: '100%', minHeight: 0, padding: `0 ${tokens.xl}px ${tokens.xl}px` }}>
          <div style={columnsStyle}>
            {/* Coluna esquerda: conteúdo da demanda */}
            <section style={leftColumnStyle}>
              {/* Link "Voltar ao Workspace" — abaixo do header, não dentro */}
              <a
                href="#"
                role="link"
                style={backLinkStyle}
              >
                <span style={backArrowStyle} aria-hidden="true">
                  ←
                </span>
                Voltar ao Workspace
              </a>

              {/* Título + status */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.sm,
                  marginBottom: tokens.lg,
                }}
              >
                <h1 role="heading" style={demandTitleStyle}>
                  {demand.title}
                </h1>
                {demand.status === 'InExecution' ? (
                  <p
                    style={{
                      ...statusBadgeStyle(statusColor.bg, statusColor.fg),
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span style={pulseDotStyle} aria-hidden="true"></span>
                    {demand.status}
                  </p>
                ) : (
                  <p style={statusBadgeStyle(statusColor.bg, statusColor.fg)}>
                    {demand.status}
                  </p>
                )}
              </div>

              {/* Linha de metadados: Projeto e Repositório */}
              <div style={metaRowStyle}>
                <div style={metaChipStyle}>
                  <span style={metaIconStyle} aria-hidden="true">
                    📁
                  </span>
                  <div>
                    <p style={metaLabelStyle}>Projeto:</p>
                    <p style={metaValueStyle}>{demand.projectName}</p>
                  </div>
                </div>
                <div style={metaChipStyle}>
                  <span style={metaIconStyle} aria-hidden="true">
                    📦
                  </span>
                  <div>
                    <p style={metaLabelStyle}>Repositório:</p>
                    <p style={metaValueStyle}>{demand.repositoryName}</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div style={tabsContainerStyle}>
                <p style={tabStyle}>Plano</p>
                <p style={tabActiveStyle}>
                  Tarefas
                  <span style={tabBadgeStyle}>{demand.taskCount}</span>
                </p>
                <p style={tabStyle}>Pull Request</p>
              </div>

              {/* Seção de Tarefas */}
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: tokens.md, marginBottom: tokens.lg }}>
                  <h2 role="heading" style={sectionTitleStyle}>
                    Tarefas
                  </h2>
                  <p style={sectionDescriptionStyle}>
                    Acompanhe dependências, Tentativas e decisões de cada Tarefa.
                  </p>
                </div>

                {demand.tasks.map((task) => {
                  const lastAttempt = task.attempts[task.attempts.length - 1];
                  const lastResult = lastAttempt
                    ? lastAttempt.label
                    : task.status === 'Pendente'
                      ? 'Sem tentativas'
                      : 'Sem resultado';
                  const lastStatus = lastAttempt?.status ?? 'pending';

                  return (
                    <div key={`task-${task.number}`} style={taskCardStyle}>
                      <div style={taskHeaderStyle}>
                        <p style={taskNumberTitleStyle}>
                          Tarefa {task.number} — {task.title}
                        </p>
                        <p
                          style={{
                            ...statusBadgeStyle(
                              task.status === 'Aprovada'
                                ? 'rgba(22, 163, 74, 0.1)'
                                : task.status === 'Rejeitada'
                                  ? 'rgba(220, 38, 38, 0.08)'
                                  : '#F3F4F6',
                              task.status === 'Aprovada'
                                ? tokens.sucesso
                                : task.status === 'Rejeitada'
                                  ? tokens.perigo
                                  : tokens.textoSuave
                            ),
                            fontSize: 11,
                            height: 23,
                            padding: '4px 8px',
                          }}
                        >
                          {task.status}
                        </p>
                      </div>

                      <div style={taskAttemptsStyle}>
                        {task.attemptsCount} Tentativa{task.attemptsCount !== 1 ? 's' : ''} →
                        {' '}
                        <span
                          style={{
                            fontWeight: '500',
                            color:
                              lastStatus === 'approved'
                                ? tokens.sucesso
                                : lastStatus === 'rejected'
                                  ? tokens.perigo
                                  : tokens.textoSuave,
                          }}
                        >
                          {lastResult}
                        </span>
                      </div>

                      <div style={taskDividerStyle} />

                      {task.message && (
                        <div
                          style={{
                            ...messageBoxStyle(
                              task.status === 'Aprovada'
                                ? 'rgba(22, 163, 74, 0.08)'
                                : task.status === 'Rejeitada'
                                  ? 'rgba(220, 38, 38, 0.08)'
                                  : tokens.superficieCard,
                              task.status === 'Aprovada'
                                ? 'rgba(22, 163, 74, 0.2)'
                                : task.status === 'Rejeitada'
                                  ? 'rgba(220, 38, 38, 0.2)'
                                  : tokens.border,
                              task.status === 'Aprovada'
                                ? tokens.sucesso
                                : task.status === 'Rejeitada'
                                  ? tokens.perigo
                                  : tokens.textoSuave
                            ),
                          }}
                        >
                          <p style={taskFieldValueStyle}>{task.message}</p>
                        </div>
                      )}

                      {task.creditsConsumed !== undefined && (
                        <div style={taskFieldRowStyle}>
                          <p style={taskFieldLabelStyle}>Crédito consumido</p>
                          <p style={taskFieldValueStyle}>
                            {task.creditsConsumed} Crédito{task.creditsConsumed !== 1 ? 's' : ''}
                          </p>
                        </div>
                      )}

                      {task.dependsOn && (
                        <div style={taskFieldRowStyle}>
                          <p style={taskFieldLabelStyle}>Depende de:</p>
                          <p style={taskFieldValueStyle}>Tarefa {task.dependsOn}</p>
                        </div>
                      )}

                      <div style={actionsRowStyle}>
                        {task.canViewResult && (
                          <button
                            type="button"
                            role="button"
                            style={borderButtonStyle}
                          >
                            <span style={{ width: 14, height: 14, flexShrink: 0 }} aria-hidden="true">
                              👁️
                            </span>
                            Ver Resultado
                          </button>
                        )}
                        {task.canRetry && (
                          <button
                            type="button"
                            role="button"
                            style={{
                              ...actionButtonStyle(tokens.primaria, '#FFFFFF', '16px 8px'),
                              height: 40,
                              borderRadius: 8,
                            }}
                          >
                            <span style={{ width: 16, height: 16, flexShrink: 0 }} aria-hidden="true">
                              🔄
                            </span>
                            Regenerar (1 Crédito)
                          </button>
                        )}
                        {task.canStartExecution && (
                          <button
                            type="button"
                            role="button"
                            style={{
                              ...actionButtonStyle('#EFF6FF', tokens.primaria, '16px 8px'),
                              height: 40,
                              borderRadius: 8,
                            }}
                          >
                            <span style={{ width: 16, height: 16, flexShrink: 0 }} aria-hidden="true">
                              ▶️
                            </span>
                            Iniciar execução
                          </button>
                        )}
                      </div>

                      {task.status === 'Pendente' && (
                        <div
                          style={{
                            border: `1px solid ${tokens.border}`,
                            borderRadius: 4,
                            padding: '5px 9px',
                            marginTop: tokens.md,
                            backgroundColor: tokens.superficieSidebar,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <span style={{ fontWeight: '600', color: tokens.textoSuave, fontSize: 12 }}>
                            Depende de: Tarefa {task.dependsOn}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Coluna direita: Política de Créditos */}
            <section style={rightColumnStyle}>
              <div style={panelCardStyle}>
                <p style={panelTitleStyle}>Política de Créditos</p>
                <div style={panelItemStyle}>
                  <span style={panelIconStyle} aria-hidden="true">
                    ⚡
                  </span>
                  <p style={panelTextStyle}>
                    Cada Tentativa iniciada consome 1 Crédito.
                  </p>
                </div>
                <div style={panelItemStyle}>
                  <span style={panelIconStyle} aria-hidden="true">
                    ⚠️
                  </span>
                  <p style={panelTextStyle}>
                    Se uma Tentativa terminar sem Resultado por falha atribuível ao
                    Macro2PR, o Crédito é devolvido.
                  </p>
                </div>
                <div style={panelItemStyle}>
                  <span style={panelIconStyle} aria-hidden="true">
                    ⚠️
                  </span>
                  <p style={panelTextStyle}>
                    Se houver Resultado, o Crédito permanece consumido mesmo que ele
                    seja posteriormente rejeitado.
                  </p>
                </div>
                <div style={panelItemStyle}>
                  <span style={panelIconStyle} aria-hidden="true">
                    ⚡
                  </span>
                  <p style={panelTextStyle}>
                    Regenerar cria uma nova Tentativa e consome outro Crédito.
                  </p>
                </div>
                <div style={panelItemStyle}>
                  <span style={panelIconStyle} aria-hidden="true">
                    ✅
                  </span>
                  <p style={panelTextStyle}>
                    Gerar ou rejeitar um Plano não consome Crédito.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </section>
  );
}
