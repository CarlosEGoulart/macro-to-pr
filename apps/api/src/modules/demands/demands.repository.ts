import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PriorityDemand, TypeDemand } from '../../generated/prisma/client.js';

@Injectable()
export class DemandsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    title: string;
    description: string;
    type: TypeDemand;
    priority: PriorityDemand;
    projectId: string;
  }) {
    const { title, description, type, priority, projectId } = data;
    return this.prisma.demand.create({
      data: { title, description, type, priority, projectId },
    });
  }
}
