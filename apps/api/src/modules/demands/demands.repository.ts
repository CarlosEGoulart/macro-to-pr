import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class DemandsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    title: string;
    description: string;
    projectId: string;
  }) {
    const { title, description, projectId } = data;
    return this.prisma.demand.create({
      data: { title, description, projectId },
    });
  }
}
