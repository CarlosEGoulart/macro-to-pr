import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotionController } from './notion.controller.js';
import { NotionService } from './notion.service.js';

@Module({
  imports: [ConfigModule],
  controllers: [NotionController],
  providers: [NotionService, ConfigService],
  exports: [NotionService],
})
export class NotionModule {}
