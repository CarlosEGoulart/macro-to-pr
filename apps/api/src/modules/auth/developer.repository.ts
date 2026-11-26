import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class DeveloperRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.developer.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.developer.findUnique({ where: { email } });
  }

  async create(data: {
    email: string;
    name: string;
    avatarUrl?: string | null;
    role?: string;
  }) {
    return this.prisma.developer.create({
      data: {
        email: data.email,
        name: data.name,
        avatarUrl: data.avatarUrl ?? null,
        role: (data.role ?? 'Developer') as any,
      },
    });
  }

  async linkGitHubAccount(developerId: string, githubAccountId: string) {
    return this.prisma.developer.update({
      where: { id: developerId },
      data: { githubAccountId },
    });
  }
}
