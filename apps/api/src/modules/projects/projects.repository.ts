import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ProjectsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    repositoryId: string;
    developerId: string;
  }) {
    return this.prisma.project.create({ data });
  }
}
