import { Injectable } from '@nestjs/common';
import { CreateDemandDto } from './dto/create-demand.dto.js';
import { DemandsRepository } from './demands.repository.js';

@Injectable()
export class DemandsService {
  constructor(private readonly demandsRepository: DemandsRepository) {}

  async create(createDemandDto: CreateDemandDto, developerId: string) {
    // O developerId é recebido para rastrear a autoria; a associação ao
    // Projeto é feita pelo projectId do DTO. A regra de permissão
    // (projeto pertence ao desenvolvedor) fica para a Tarefa 5 (CA3).
    return this.demandsRepository.create({
      title: createDemandDto.title,
      description: createDemandDto.description,
      projectId: createDemandDto.projectId,
    });
  }
}
