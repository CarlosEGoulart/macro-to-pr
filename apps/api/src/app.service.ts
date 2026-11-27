import { Injectable, NotFoundException } from '@nestjs/common';
import { DeveloperRepository } from './modules/auth/developer.repository.js';

@Injectable()
export class AppService {
  constructor(private readonly developerRepository: DeveloperRepository) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getDeveloperMe(id: string) {
    const developer = await this.developerRepository.findById(id);
    if (!developer) {
      throw new NotFoundException('Desenvolvedor não encontrado');
    }
    return {
      id: developer.id,
      name: developer.name,
      email: developer.email,
      avatarUrl: developer.avatarUrl,
    };
  }
}
