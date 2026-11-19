import {
  Controller,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator.js';
import { Roles } from './common/decorators/roles.decorator.js';
import { Role } from './generated/prisma/enums.js';
import { AppService } from './app.service.js';

@ApiTags('saúde')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Verifica se a API está no ar' })
  @ApiResponse({ status: 200, description: 'API responde com saudação' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('admin/ping')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Endpoint de admin (apenas administradores)' })
  @ApiResponse({ status: 200, description: 'Pong' })
  @ApiResponse({ status: 403, description: 'Acesso proibido para não-administradores' })
  adminPing(): string {
    return 'pong';
  }
}
