import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { NotionService } from './notion.service.js';

interface AuthenticatedRequest extends Request {
  user: { userId: string };
}

@Controller('auth/notion')
export class NotionController {
  constructor(private readonly notionService: NotionService) {}

  /**
   * Inicia o fluxo de autorização OAuth do Notion.
   * Redireciona o navegador do usuário para a URL de autorização do Notion.
   */
  @Get('authorize')
  @UseGuards(JwtAuthGuard)
  async authorize(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const userId = req.user.userId;
    const authorizationUrl = await this.notionService.startAuthFlow(userId);

    return res.redirect(authorizationUrl);
  }

  /**
   * Endpoint de callback do Notion OAuth.
   * O Notion redireciona o usuário para cá após a autorização.
   * Troca o código por tokens de acesso.
   */
  @Get('callback')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async callback(
    @Req() req: AuthenticatedRequest,
    @Query('code') code?: string,
    @Query('state') state?: string,
    @Query('error') error?: string,
  ) {
    const userId = req.user.userId;

    if (error) {
      return {
        success: false,
        error,
        message: 'Erro na autorização do Notion.',
      };
    }

    if (!code || !state) {
      return {
        success: false,
        error: 'missing_params',
        message: 'Código ou state ausente no callback do Notion.',
      };
    }

    // Reconstruir a URL completa do callback para validação
    const callbackUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    const tokens = await this.notionService.handleCallback(
      callbackUrl,
      userId,
    );

    return {
      success: true,
      message: 'Autorização do Notion concluída com sucesso.',
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        scope: tokens.scope,
        token_type: tokens.token_type,
      },
    };
  }
}
