import 'reflect-metadata';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export enum TypeDemand {
  FEATURE = 'feature',
  BUG = 'bug',
  REFACTOR = 'refactor',
}

export enum PriorityDemand {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class CreateDemandDto {
  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsEnum(TypeDemand)
  type: TypeDemand;

  @ApiProperty()
  @IsEnum(PriorityDemand)
  priority: PriorityDemand;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  deadline?: Date;
}
