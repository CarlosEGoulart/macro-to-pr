import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { GitHubAccountRepository } from './github-account.repository.js';
import { DeveloperRepository } from './developer.repository.js';
import { ProjectsService } from '../projects/projects.service.js';

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string | null;
  email: string | null;
}

export interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

/**
 * Serviço de autenticação OAuth com o GitHub (US01).
 *
 * Orquestra a troca do `code` pelo access token do GitHub, a busca do perfil,
 * o vínculo da `GitHubAccount` ao `Developer` e a emissão do JWT.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly githubAccountRepository: GitHubAccountRepository,
    private readonly developerRepository: DeveloperRepository,
    private readonly projectsService: ProjectsService,
  ) {}

  /**
   * Conclui o fluxo de callback do GitHub OAuth.
   * Troca o `code` por token, vincula/cria a conta GitHub e o Desenvolvedor,
   * e emite o JWT de sessão.
   */
  async handleGitHubCallback(code: string) {
    // 1. Troca o code pelo access token do GitHub
    const tokenResponse = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: this.config.get<string>('GITHUB_CLIENT_ID'),
          client_secret: this.config.get<string>('GITHUB_CLIENT_SECRET'),
          code,
        }),
      },
    );

    const tokenData = await tokenResponse.json();
    if (tokenData.error || !tokenData.access_token) {
      this.logger.error('Falha ao trocar code por token:', tokenData);
      throw new Error(
        'Falha ao trocar código por token de acesso do GitHub',
      );
    }

    const accessToken = tokenData.access_token as string;
    const scopes = (tokenData.scope ?? '') as string;

    // 2. Busca o perfil do usuário no GitHub
    const profileResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'Macro2PR',
        Accept: 'application/vnd.github+json',
      },
    });

    if (!profileResponse.ok) {
      throw new Error('Falha ao buscar perfil do GitHub');
    }

    const profile = (await profileResponse.json()) as GitHubUser;

    // 3. Descobre o e-mail primário (obrigatório para o Desenvolvedor)
    let email = profile.email;
    if (!email && scopes.includes('user:email')) {
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'Macro2PR',
          Accept: 'application/vnd.github+json',
        },
      });
      if (emailsResponse.ok) {
        const emails = (await emailsResponse.json()) as GitHubEmail[];
        const primary = emails.find((e) => e.primary && e.verified);
        if (primary) email = primary.email;
      }
    }
    if (!email) {
      email = `${profile.login}@users.noreply.github.com`;
    }

    // 4. Upsert GitHubAccount
    let account = await this.githubAccountRepository.findByGithubUserId(
      String(profile.id),
    );
    if (account) {
      account = await this.githubAccountRepository.updateToken(
        String(profile.id),
        accessToken,
        scopes,
      );
    } else {
      account = await this.githubAccountRepository.create({
        githubUserId: String(profile.id),
        githubLogin: profile.login,
        accessToken,
        scopes,
      });
    }

    // 5. Encontra ou cria o Desenvolvedor vinculado à conta GitHub
    let developer = await this.developerRepository.findByEmail(email);
    if (!developer) {
      developer = await this.developerRepository.create({
        email,
        name: profile.name ?? profile.login,
        avatarUrl: profile.avatar_url ?? null,
      });
    }

    if (!developer.githubAccountId) {
      await this.developerRepository.linkGitHubAccount(
        developer.id,
        account.id,
      );
    }

    // 5.5. Sincroniza repositórios da Conta GitHub com o banco local.
    // Falha no sync não impede a emissão do JWT: apenas loga o erro.
    try {
      await this.projectsService.syncRepositories(account.id, accessToken);
    } catch (err) {
      this.logger.error(
        'Falha ao sincronizar repositórios do GitHub (ignorado — JWT será emitido)',
        err instanceof Error ? err.stack : String(err),
      );
    }

    // 6. Emite JWT
    const payload = {
      sub: String(developer.id),
      email: String(developer.email),
      role: String(developer.role),
    };
    // O segredo vem do JwtModule registrado globalmente no AppModule.
    const token = await this.jwtService.signAsync(payload);

    return { token, developer };
  }

}
