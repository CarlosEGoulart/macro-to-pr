import { Module } from '@nestjs/common';
import { DemandsController } from './demands.controller.js';
import { DemandsService } from './demands.service.js';
import { DemandsRepository } from './demands.repository.js';
import { PrismaModule } from '../../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [DemandsController],
  providers: [DemandsService, DemandsRepository],
})
export class DemandsModule {}
