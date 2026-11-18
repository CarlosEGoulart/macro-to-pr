import { Injectable } from '@nestjs/common';
import { ProjectsRepository } from './projects.repository.js';

@Injectable()
export class ProjectsService {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async create(
    createProjectDto: { name: string; repositoryId: string },
    developerId: string,
  ) {
    return this.projectsRepository.create({
      ...createProjectDto,
      developerId,
    });
  }
}
