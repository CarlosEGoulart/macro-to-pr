import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ProjectsRepository } from './projects.repository.js';

@Injectable()
export class ProjectsService {
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
}
