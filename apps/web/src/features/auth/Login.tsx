/**
 * Tela de login do Macro2PR — reproduz fielmente o design do Figma
 * (node-id 2-8503: header + main + conteúdo + próximos passos).
 *
 * Cores e tipografia vêm de tokens nomeados (design tokens, modo claro).
 * Estilos aplicados via `style` (inline) para que funcionem no jsdom.
 */
import { type ReactNode, type CSSProperties } from 'react';

// --- Design tokens (modo claro) ---------------------------------------------
const tokens = {
  // Cores
  primaria: '#6164F1',
  primariaHover: '#4F46E5',
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
  '3xl': 48,

  // Tipografia
  font: 'Inter, system-ui, sans-serif',
} as const;

// --- Componentes internos ----------------------------------------------------
function Logo() {
  return (
    <div
      data-testid="login-logo"
      style={{
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
      } as CSSProperties}
    >
      M
    </div>
  );
}

function Wordmark() {
  return (
    <span
      style={{
        fontFamily: tokens.font,
        fontWeight: '600',
        fontSize: 18,
        color: tokens.texto,
        letterSpacing: '-0.45px',
        lineHeight: '27px',
        marginLeft: tokens.sm,
      } as CSSProperties}
    >
      Macro2PR
    </span>
  );
}

function Header() {
  return (
    <header
      data-testid="login-header"
      style={{
        backgroundColor: tokens.superficieSidebar,
        borderBottom: `1px solid ${tokens.border}`,
        height: 64,
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: tokens.md,
      } as CSSProperties}
    >
      <Logo />
      <Wordmark />
    </header>
  );
}

function PageTitle() {
  return (
    <h1
      role="heading"
      style={{
        fontFamily: tokens.font,
        fontWeight: '600',
        fontSize: 24,
        color: tokens.texto,
        margin: '0 0 8px 0',
        textAlign: 'left',
      } as CSSProperties}
    >
      Acesso ao Macro2PR
    </h1>
  );
}

function PageSubtitle() {
  return (
    <p
      style={{
        fontFamily: tokens.font,
        fontWeight: '400',
        fontSize: 16,
        color: tokens.textoSuave,
        margin: '0 0 24px 0',
        lineHeight: '1.5',
        textAlign: 'left',
      } as CSSProperties}
    >
      Autorize sua Conta GitHub para acessar os Repositórios disponíveis e
      continuar para o Workspace.
    </p>
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div
      data-testid="login-card"
      style={{
        backgroundColor: tokens.superficieCard,
        border: `1px solid ${tokens.border}`,
        borderRadius: 12,
        height: 344,
        padding: 32,
        display: 'flex',
        alignItems: 'center',
        gap: 32,
        boxSizing: 'border-box',
      } as CSSProperties}
    >
      {children}
    </div>
  );
}

function CardLeft() {
  return (
    <div
      style={{
        width: 520,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        gap: 16,
      } as CSSProperties}
    >
      <h2
        role="heading"
        style={{
          fontFamily: tokens.font,
          fontWeight: '700',
          fontSize: 32,
          color: tokens.texto,
          margin: 0,
          lineHeight: '1.2',
          textAlign: 'left',
        } as CSSProperties}
      >
        Transforme demandas em trabalho estruturado e revisável
      </h2>
      <p
        style={{
          fontFamily: tokens.font,
          fontWeight: '400',
          fontSize: 16,
          color: tokens.textoSuave,
          margin: 0,
          lineHeight: '1.5',
          textAlign: 'left',
        } as CSSProperties}
      >
        O Macro2PR utiliza sua Conta GitHub para permitir acesso aos
        Repositórios disponíveis para você, organizar Demandas, acompanhar
        execuções e Revisões e gerar o Pull Request final após as aprovações
        necessárias.
      </p>
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        width: 1,
        height: 208,
        backgroundColor: tokens.border,
      } as CSSProperties}
    />
  );
}

function AuthorizeButton() {
  return (
    <button
      type="button"
      role="button"
      data-testid="login-authorize-button"
      style={{
        backgroundColor: tokens.primaria,
        color: '#FFFFFF',
        border: 'none',
        borderRadius: 6,
        padding: '10px 16px',
        fontFamily: tokens.font,
        fontWeight: '600',
        fontSize: 16,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        alignSelf: 'center',
        marginBottom: tokens.md,
      } as CSSProperties}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
          tokens.primariaHover;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
          tokens.primaria;
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
  <path d="M8.33333 0C3.73083 0 0 3.73667 0 8.3475C0 12.035 2.3875 15.1642 5.69917 16.2675C6.11583 16.3442 6.2675 16.0867 6.2675 15.865C6.2675 15.6675 6.26083 15.1417 6.25667 14.4458C3.93833 14.95 3.44917 13.3267 3.44917 13.3267C3.07083 12.3617 2.52417 12.105 2.52417 12.105C1.7675 11.5883 2.58167 11.5983 2.58167 11.5983C3.4175 11.6567 3.85667 12.4583 3.85667 12.4583C4.6 13.7333 5.8075 13.365 6.28167 13.1517C6.35833 12.6125 6.57333 12.245 6.81167 12.0367C4.96167 11.8258 3.01583 11.1092 3.01583 7.91083C3.01583 7 3.34083 6.25417 3.87333 5.67083C3.7875 5.46 3.50167 4.61083 3.955 3.4625C3.955 3.4625 4.655 3.2375 6.24667 4.3175C6.92674 4.13202 7.62842 4.03759 8.33333 4.03667C9.04167 4.04 9.75417 4.1325 10.42 4.3175C12.0108 3.2375 12.7092 3.46167 12.7092 3.46167C13.1642 4.61083 12.8775 5.46 12.7925 5.67083C13.3258 6.25417 13.6492 7 13.6492 7.91083C13.6492 11.1175 11.7 11.8233 9.84417 12.03C10.1433 12.2875 10.4092 12.7967 10.4092 13.5758C10.4092 14.6908 10.3992 15.5917 10.3992 15.865C10.3992 16.0883 10.5492 16.3483 10.9725 16.2667C12.6319 15.7101 14.0744 14.6461 15.0962 13.225C16.118 11.804 16.6674 10.0978 16.6667 8.3475C16.6667 3.73667 12.935 0 8.33333 0Z" fill-rule="evenodd" clip-rule="evenodd" fill="white"/>
</svg> Autorizar com GitHub
    </button>
  );
}

function CardRight() {
  return (
    <div
      style={{
        width: 327,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        gap: 12,
      } as CSSProperties}
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
        Acesse com sua Conta GitHub
      </h3>
      <AuthorizeButton />
      <p
        style={{
          fontFamily: tokens.font,
          fontWeight: '400',
          fontSize: 14,
          color: tokens.textoSuave,
          margin: 0,
          lineHeight: '1.4',
        } as CSSProperties}
      >
        Você verá apenas os Repositórios disponíveis para sua Conta GitHub.
      </p>
    </div>
  );
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div
      style={{
        backgroundColor: tokens.superficieCard,
        border: `1px solid ${tokens.border}`,
        borderRadius: 12,
        width: 314,
        height: 93,
        padding: 16,
        display: 'flex',
        gap: 12,
        boxSizing: 'border-box',
      } as CSSProperties}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: tokens.primaria,
          color: '#FFFFFF',
          fontFamily: tokens.font,
          fontWeight: '600',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        } as CSSProperties}
      >
        {number}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div
          role="heading"
          style={{
            fontFamily: tokens.font,
            fontWeight: '400',
            fontSize: 14,
            color: tokens.texto,
            margin: 0,
            lineHeight: '1.4',
          } as CSSProperties}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: tokens.font,
            fontWeight: '400',
            fontSize: 12,
            color: tokens.textoSuave,
            margin: 0,
            lineHeight: '1.4',
          } as CSSProperties}
        >
          {description}
        </div>
      </div>
    </div>
  );
}

function NextSteps() {
  return (
    <section
      data-testid="login-next-steps"
      style={{
        marginTop: tokens['3xl'],
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        gap: 12,
      } as CSSProperties}
    >
      <h3
        role="heading"
        style={{
          fontFamily: tokens.font,
          fontWeight: '600',
          fontSize: 18,
          color: tokens.texto,
          margin: '0 0 12px 0',
          lineHeight: '1.2',
          textAlign: 'left',
        } as CSSProperties}
      >
        Depois da autorização
      </h3>
      <div style={{ display: 'flex', gap: 16, alignItems: 'start', width: 976 }}>
        <Step
          number="1"
          title="Escolha um Repositório"
          description="Use um Repositório disponível para sua Conta GitHub."
        />
        <Step
          number="2"
          title="Crie um Projeto"
          description="Associe o Repositório escolhido a um Projeto."
        />
        <Step
          number="3"
          title="Organize Demandas"
          description="Crie e acompanhe Demandas no Workspace."
        />
      </div>
    </section>
  );
}

export function Login() {
  return (
    <section
      id="login"
      data-testid="login-root"
      aria-label="Login"
      style={{
        backgroundColor: tokens.superficieSidebar,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: '100vh',
      } as CSSProperties}
    >
      <Header />
      <main
        data-testid="login-main"
        style={{
          backgroundColor: tokens.superficieSidebar,
          position: 'relative',
          flex: 1,
          width: '100%',
        } as CSSProperties}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 1280,
            margin: '0 auto',
            height: '100%',
          } as CSSProperties}
        >
          <div
            style={{
              position: 'absolute',
              left: 152,
              top: 64,
              width: 976,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'start',
              gap: 24,
            } as CSSProperties}
          >
            <PageTitle />
            <PageSubtitle />
            <Card>
              <CardLeft />
              <Divider />
              <CardRight />
            </Card>
            <NextSteps />
          </div>
        </div>
      </main>
    </section>
  );
}
