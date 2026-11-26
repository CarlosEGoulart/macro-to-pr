import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class GitHubAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByGithubUserId(githubUserId: string) {
    return this.prisma.gitHubAccount.findUnique({
      where: { githubUserId },
    });
  }

  async create(data: {
    githubUserId: string;
    githubLogin: string;
    accessToken: string;
    scopes: string;
  }) {
    return this.prisma.gitHubAccount.create({ data });
  }

  async updateToken(githubUserId: string, accessToken: string, scopes: string) {
    return this.prisma.gitHubAccount.update({
      where: { githubUserId },
      data: { accessToken, scopes },
    });
  }

}
