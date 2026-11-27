import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateDemandDto } from './dto/create-demand.dto.js';
import { DemandsService } from './demands.service.js';
import { DemandsRepository } from './demands.repository.js';
import { ProjectsRepository } from '../projects/projects.repository.js';

const mockDemandsRepository = {
  create: vi.fn(),
  findDemandById: vi.fn(),
} as unknown as DemandsRepository;

const mockProjectsRepository = {
  findProjectByIdAndDeveloper: vi.fn(),
} as unknown as ProjectsRepository;

describe('DemandsService', () => {
  let service: DemandsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DemandsService(mockDemandsRepository, mockProjectsRepository);
  });

  describe('create', () => {
    const dto: CreateDemandDto = {
      title: 'Nova demanda',
      description: 'Descrição',
      type: 'feature',
      priority: 'high',
      projectId: 'proj-1',
    };

    it('deve criar demanda quando projeto pertence ao desenvolvedor', async () => {
      mockProjectsRepository.findProjectByIdAndDeveloper.mockResolvedValue({
        id: 'proj-1',
        developerId: 'dev-1',
      });
      mockDemandsRepository.create.mockResolvedValue({
        id: 'demand-1',
        ...dto,
        projectId: 'proj-1',
      });

      const result = await service.create(dto, 'dev-1');

      expect(result.id).toBe('demand-1');
      expect(mockDemandsRepository.create).toHaveBeenCalledWith({
        title: dto.title,
        description: dto.description,
        type: dto.type,
        priority: dto.priority,
        projectId: dto.projectId,
      });
    });

    it('deve lançar ForbiddenException quando projeto não existe', async () => {
      mockProjectsRepository.findProjectByIdAndDeveloper.mockResolvedValue(null);

      await expect(service.create(dto, 'dev-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('deve lançar ForbiddenException quando projeto não pertence ao desenvolvedor', async () => {
      mockProjectsRepository.findProjectByIdAndDeveloper.mockResolvedValue({
        id: 'proj-1',
        developerId: 'dev-2',
      });

      await expect(service.create(dto, 'dev-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findDemandById', () => {
    it('deve retornar demanda quando encontrada', async () => {
      mockDemandsRepository.findDemandById.mockResolvedValue({
        id: 'demand-1',
        title: 'Nova demanda',
      });

      const result = await service.findDemandById('demand-1');

      expect(result.id).toBe('demand-1');
    });

    it('deve lançar NotFoundException quando demanda não existe', async () => {
      mockDemandsRepository.findDemandById.mockResolvedValue(null);

      await expect(service.findDemandById('demand-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
