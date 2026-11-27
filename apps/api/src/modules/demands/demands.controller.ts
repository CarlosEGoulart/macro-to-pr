import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { DemandsService } from './demands.service.js';
import { CreateDemandDto } from './dto/create-demand.dto.js';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('demands')
export class DemandsController {
  constructor(private readonly demandsService: DemandsService) {}

  @Post()
  async create(
    @Body() createDemandDto: CreateDemandDto,
    @CurrentUser() userId: string,
  ) {
    const developerId = userId;
    return this.demandsService.create(createDemandDto, developerId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.demandsService.findDemandById(id);
  }
}
