import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ description: 'Nome do projeto' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'ID do Repositório associado' })
  @IsUUID()
  repositoryId: string;
}
