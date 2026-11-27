import {
  Controller,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator.js';
import { AuthService } from './auth.service.js';

/**
 * Fluxo de OAuth com o GitHub (US01).
 *
 * - `GET /auth/github` inicia a autorização (redireciona para o GitHub).
 * - `GET /auth/github/callback` é chamado pelo GitHub após o usuário autorizar
 *   (ou negar). Troca o `code` por token, vincula a conta e emite o JWT.
 */
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Get('github')
  @Public()
  authGitHub(@Res() res: Response) {
    const clientId = this.config.get<string>('GITHUB_CLIENT_ID');
    const callbackUrl = this.config.get<string>('GITHUB_CALLBACK_URL') ?? '';
    // user:email permite ler o e-mail primário do usuário (obrigatório p/ o Desenvolvedor)
    const scope = 'repo user:email';

    if (!clientId) {
      return res.status(500).json({
        message: 'GITHUB_CLIENT_ID não configurada no backend.',
      });
    }

    const authorizationUrl =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
      `&scope=${encodeURIComponent(scope)}`;

    return res.redirect(authorizationUrl);
  }

  @Get('github/callback')
  @Public()
  async authGitHubCallback(
    @Res() res: Response,
    @Query('code') code?: string,
    @Query('error') error?: string,
  ) {
    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';

    if (error || !code) {
      return res.redirect(
        `${frontendUrl}/login?error=${error ?? 'access_denied'}`,
      );
    }

    try {
      const { token } = await this.authService.handleGitHubCallback(code);
      return res.redirect(`${frontendUrl}/login?token=${token}`);
    } catch (err) {
      this.logger.error('Callback OAuth falhou', err);
      return res.redirect(`${frontendUrl}/login?error=callback_failed`);
    }
  }
}
