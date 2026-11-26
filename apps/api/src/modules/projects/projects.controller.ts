import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';

@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findProjectsByDeveloper(
    @Req() req: { user: { userId: string } },
  ) {
    const developerId = req.user.userId;
    return this.projectsService.findProjectsByDeveloper(developerId);
  }

  @Get('repositories')
  async findRepositories(
    @Req() req: { user: { userId: string } },
  ) {
    const developerId = req.user.userId;
    return this.projectsService.findRepositoriesByDeveloper(developerId);
  }

  @Post()
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @Req() req: { user: { userId: string } },
  ) {
    const developerId = req.user.userId;
    return this.projectsService.create(createProjectDto, developerId);
  }
}
