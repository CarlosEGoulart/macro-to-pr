import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, createHash } from 'crypto';

const NOTION_MCP_SERVER_URL = 'https://mcp.notion.com';

export interface NotionTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
}

export interface NotionOAuthMetadata {
  authorization_endpoint: string;
  token_endpoint: string;
  registration_endpoint?: string;
  revocation_endpoint?: string;
}

@Injectable()
export class NotionService {
  private readonly logger = new Logger(NotionService.name);

  private oauthMetadata: NotionOAuthMetadata | null = null;
  private clientId: string | null = null;
  private clientSecret: string | null = null;

  // Armazenamento temporário de state e codeVerifier por usuário (sessão)
  // Em produção, use um store seguro (Redis/Prisma) com TTL curto
  private pendingAuth = new Map<
    string,
    { codeVerifier: string; state: string; userId: string }
  >();

  constructor(private readonly configService: ConfigService) {}

  /**
   * Descobre os metadados OAuth do servidor Notion MCP.
   */
  async discoverMetadata(): Promise<NotionOAuthMetadata> {
    if (this.oauthMetadata) {
      return this.oauthMetadata;
    }

    const metadataUrl = `${NOTION_MCP_SERVER_URL}/.well-known/oauth-authorization-server`;
    this.logger.log(`Descobrindo metadados OAuth: ${metadataUrl}`);

    const response = await fetch(metadataUrl, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(
        `Falha ao descobrir metadados OAuth do Notion: ${response.status}`,
      );
    }

    this.oauthMetadata = (await response.json()) as NotionOAuthMetadata;
    return this.oauthMetadata;
  }

  /**
   * Registra o cliente OAuth dinamicamente no Notion MCP
   * usando o redirect_uri do codespace.
   */
  async registerClient(redirectUri: string): Promise<{
    client_id: string;
    client_secret?: string;
  }> {
    const metadata = await this.discoverMetadata();

    if (!metadata.registration_endpoint) {
      throw new Error(
        'O servidor Notion MCP não suporta registro dinâmico de cliente.',
      );
    }

    const registrationRequest = {
      client_name: 'Macro2PR Notion MCP',
      client_uri: redirectUri,
      redirect_uris: [redirectUri],
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
      scope: '',
    };

    this.logger.log(
      `Registrando cliente Notion com redirect_uri: ${redirectUri}`,
    );

    const response = await fetch(metadata.registration_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(registrationRequest),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Registro de cliente Notion falhou: ${response.status} - ${errorBody}`,
      );
    }

    const credentials = (await response.json()) as {
      client_id: string;
      client_secret?: string;
    };

    this.clientId = credentials.client_id;
    this.clientSecret = credentials.client_secret ?? null;

    return credentials;
  }

  /**
   * Gera um code_verifier PKCE (RFC 7636).
   */
  generateCodeVerifier(): string {
    return randomBytes(32).toString('base64url');
  }

  /**
   * Gera o code_challenge a partir do code_verifier (S256).
   */
  generateCodeChallenge(codeVerifier: string): string {
    const digest = createHash('sha256').update(codeVerifier).digest('base64');
    return digest.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  /**
   * Gera um state aleatório para prevenir CSRF.
   */
  generateState(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Constrói a URL de autorização do Notion OAuth.
   */
  buildAuthorizationUrl(
    metadata: NotionOAuthMetadata,
    clientId: string,
    redirectUri: string,
    codeChallenge: string,
    state: string,
    scopes: string[] = [],
  ): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scopes.join(' '),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      prompt: 'consent',
    });

    return `${metadata.authorization_endpoint}?${params.toString()}`;
  }

  /**
   * Inicia o fluxo de autorização OAuth do Notion para um usuário.
   * Retorna a URL para a qual o usuário deve ser redirecionado.
   */
  async startAuthFlow(userId: string): Promise<string> {
    const redirectUri = this.getRedirectUri();

    // Garante que o cliente está registrado
    if (!this.clientId) {
      await this.registerClient(redirectUri);
    }

    const metadata = await this.discoverMetadata();

    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = this.generateCodeChallenge(codeVerifier);
    const state = this.generateState();

    // Armazena state e codeVerifier para validação no callback
    this.pendingAuth.set(state, { codeVerifier, state, userId });

    this.logger.log(
      `Iniciando fluxo OAuth Notion para usuário ${userId} (state: ${state})`,
    );

    return this.buildAuthorizationUrl(
      metadata,
      this.clientId!,
      redirectUri,
      codeChallenge,
      state,
    );
  }

  /**
   * Trata o callback do Notion OAuth.
   * Valida o state, troca o código por tokens.
   */
  async handleCallback(
    callbackUrl: string,
    userId: string,
  ): Promise<NotionTokens> {
    const url = new URL(callbackUrl);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      throw new Error(`Erro no callback OAuth do Notion: ${error}`);
    }

    if (!code || !state) {
      throw new Error('Código ou state ausente no callback do Notion.');
    }

    const pending = this.pendingAuth.get(state);
    if (!pending) {
      throw new Error('State inválido ou expirado no callback do Notion.');
    }

    if (pending.userId !== userId) {
      this.pendingAuth.delete(state);
      throw new Error('State não pertence ao usuário autenticado.');
    }

    const { codeVerifier } = pending;
    this.pendingAuth.delete(state);

    const metadata = await this.discoverMetadata();
    const redirectUri = this.getRedirectUri();

    const tokens = await this.exchangeCodeForTokens(
      code,
      codeVerifier,
      metadata,
      redirectUri,
    );

    this.logger.log(
      `Tokens Notion obtidos para usuário ${userId} (state: ${state})`,
    );

    return tokens;
  }

  /**
   * Troca o código de autorização por tokens de acesso.
   */
  private async exchangeCodeForTokens(
    code: string,
    codeVerifier: string,
    metadata: NotionOAuthMetadata,
    redirectUri: string,
  ): Promise<NotionTokens> {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: this.clientId!,
      code_verifier: codeVerifier,
    });

    const response = await fetch(metadata.token_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Troca de código por tokens falhou: ${response.status} - ${errorBody}`,
      );
    }

    return (await response.json()) as NotionTokens;
  }

  /**
   * Retorna o redirect URI do codespace (variável NOTION_REDIRECT_URI
   * ou construída a partir do CODESPACE_NAME).
   */
  getRedirectUri(): string {
    const configured = this.configService.get<string>('NOTION_REDIRECT_URI');
    if (configured) {
      return configured;
    }

    const codespaceName = process.env.CODESPACE_NAME;
    if (codespaceName) {
      return `https://${codespaceName}-3000.app.github.dev/api/auth/notion/callback`;
    }

    throw new Error(
      'NOTION_REDIRECT_URI não configurada e CODESPACE_NAME não disponível.',
    );
  }

  /**
   * Limpa uma autorização pendente (ex: logout ou expiração).
   */
  clearPendingAuth(state: string): void {
    this.pendingAuth.delete(state);
  }
}
