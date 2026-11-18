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

  async findDeveloperById(id: string) {
    return this.prisma.developer.findUnique({
      where: { id },
      select: { id: true, githubAccountId: true },
    });
  }

  async findRepositoryById(id: string) {
    return this.prisma.repository.findUnique({
      where: { id },
      select: { id: true, githubAccountId: true },
    });
  }

  async findProjectByDeveloperAndRepository(
    developerId: string,
    repositoryId: string,
  ) {
    return this.prisma.project.findFirst({
      where: { developerId, repositoryId },
      select: { id: true },
    });
  }
}
