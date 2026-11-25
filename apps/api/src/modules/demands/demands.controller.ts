import { Controller, Post, Body } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { DemandsService } from './demands.service.js';
import { CreateDemandDto } from './dto/create-demand.dto.js';

@ApiBearerAuth()
@Controller('demandas')
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
}
