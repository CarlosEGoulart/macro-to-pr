import {
  Injectable,
  Logger,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ProjectsRepository } from './projects.repository.js';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async create(
    createProjectDto: { name: string; repositoryId: string },
    developerId: string,
  ) {
    // CA2 — o Repositório deve pertencer à Conta GitHub vinculada ao Desenvolvedor.
    const repository = await this.projectsRepository.findRepositoryById(
      createProjectDto.repositoryId,
    );
    if (!repository) {
      throw new BadRequestException(
        'Repositório não encontrado ou indisponível.',
      );
    }

    const developer = await this.projectsRepository.findDeveloperById(
      developerId,
    );
    if (!developer) {
      throw new BadRequestException('Desenvolvedor não encontrado.');
    }

    if (developer.githubAccountId !== repository.githubAccountId) {
      throw new BadRequestException(
        'O repositório não pertence à Conta GitHub vinculada a este desenvolvedor.',
      );
    }

    // CA3 — não permite mais de um Projeto por Desenvolvedor + Repositório.
    const existingProject = await this.projectsRepository.findProjectByDeveloperAndRepository(
      developerId,
      createProjectDto.repositoryId,
    );
    if (existingProject) {
      throw new ConflictException(
        'Já existe um Projeto vinculado a este Repositório para este desenvolvedor.',
      );
    }

    return this.projectsRepository.create({
      ...createProjectDto,
      developerId,
    });
  }

  async findProjectsByDeveloper(developerId: string) {
    return this.projectsRepository.findProjectsByDeveloper(developerId);
  }

  async findRepositoriesByDeveloper(developerId: string) {
    // Descobre o githubAccountId do desenvolvedor
    const developer = await this.projectsRepository.findDeveloperById(
      developerId,
    );
    if (!developer || !developer.githubAccountId) {
      return [];
    }
    return this.projectsRepository.findRepositoriesByDeveloper(
      developer.githubAccountId,
    );
  }

  /**
   * Re-sincroniza os repositórios do GitHub sob demanda para o desenvolvedor
   * informado. Descobre a `GitHubAccount` vinculada ao desenvolvedor, chama a
   * sincronização contra a API do GitHub e retorna a lista de repositórios
   * sincronizados com a contagem.
   * Lança BadRequestException (400) quando o desenvolvedor não possui
   * Conta GitHub vinculada.
   */
  async syncRepositoriesByDeveloper(developerId: string) {
    const developer = await this.projectsRepository.findDeveloperById(developerId);
    if (!developer || !developer.githubAccountId) {
      throw new BadRequestException(
        'Desenvolvedor não possui Conta GitHub vinculada. Faça login novamente com o GitHub.',
      );
    }

    const account = await this.projectsRepository.findGitHubAccountById(
      developer.githubAccountId,
    );
    if (!account) {
      throw new BadRequestException(
        'Conta GitHub não encontrada para este desenvolvedor.',
      );
    }

    await this.syncRepositories(account.id, account.accessToken);

    const repositories = await this.findRepositoriesByDeveloper(developerId);
    return {
      synced: repositories.length,
      repositories,
    };
  }

  /**
   * Sincroniza os repositórios da Conta GitHub vinculada com o banco local,
   * buscando `GET /user/repos` com paginação (Link header rel="next") e
   * fazendo upsert na tabela `Repository` vinculada à `GitHubAccount`.
   * Critério de unicidade: `fullName` + `githubAccountId`.
   */
  async syncRepositories(githubAccountId: string, accessToken: string) {
    let url: string | null = 'https://api.github.com/user/repos?per_page=100&sort=updated';

    while (url) {
      const response: Response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'Macro2PR',
          Accept: 'application/vnd.github+json',
        },
      });

      if (!response.ok) {
        this.logger.error(
          `Falha ao buscar repositórios do GitHub: ${response.status}`,
        );
        break;
      }

      const repos = (await response.json()) as Array<{
        id: number;
        name: string;
        full_name: string | null;
        html_url: string;
        owner: { login: string };
        private: boolean;
      }>;

      for (const repo of repos) {
        if (!repo.full_name) continue;
        await this.projectsRepository.upsertRepositoryByFullName(
          githubAccountId,
          repo.full_name,
          {
            name: repo.name,
            fullName: repo.full_name,
            url: repo.html_url,
            owner: repo.owner.login,
            private: repo.private,
          },
        );
      }

      // Paginação via Link header (rel="next")
      const linkHeader: string = response.headers.get('link') ?? '';
      const nextMatch: RegExpMatchArray | null = linkHeader.match(
        /<([^>]+)>;\s*rel="next"/,
      );
      url = nextMatch ? nextMatch[1] : null;
    }
  }
}
