import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateDemandDto } from './dto/create-demand.dto.js';
import { DemandsRepository } from './demands.repository.js';
import { ProjectsRepository } from '../projects/projects.repository.js';

@Injectable()
export class DemandsService {
  constructor(
    private readonly demandsRepository: DemandsRepository,
    private readonly projectsRepository: ProjectsRepository,
  ) {}

  async create(createDemandDto: CreateDemandDto, developerId: string) {
    // CA3: a Demanda só pode ser criada em um Projeto que pertence ao
    // desenvolvedor autenticado. Consulta o Projeto pelo projectId e
    // impede a criação quando o Projeto não existir ou não pertencer ao
    // developerId do desenvolvedor autenticado.
    const project = await this.projectsRepository.findProjectByIdAndDeveloper(
      createDemandDto.projectId,
      developerId,
    );

    if (!project || project.developerId !== developerId) {
      throw new ForbiddenException(
        'Você não tem permissão para criar uma demanda neste projeto.',
      );
    }

    return this.demandsRepository.create({
      title: createDemandDto.title,
      description: createDemandDto.description,
      type: createDemandDto.type,
      priority: createDemandDto.priority,
      projectId: createDemandDto.projectId,
    });
  }

  async findDemandById(id: string) {
    const demand = await this.demandsRepository.findDemandById(id);
    if (!demand) {
      throw new NotFoundException('Demanda não encontrada.');
    }
    return demand;
  }
}
