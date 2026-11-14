import {
  Controller,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AppService } from './app.service.js';

@ApiTags('saúde')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Verifica se a API está no ar' })
  @ApiResponse({ status: 200, description: 'API responde com saudação' })
  getHello(): string {
    return this.appService.getHello();
  }
}
