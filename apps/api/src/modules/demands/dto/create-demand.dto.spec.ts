import { validate } from 'class-validator';
import {
  CreateDemandDto,
  PriorityDemand,
  TypeDemand,
} from './create-demand.dto.js';

describe('CreateDemandDto', () => {
  it('deve gerar erros de validação quando campos obrigatórios estão ausentes', async () => {
    const dto = new CreateDemandDto();
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);

    const fields = errors.map((e) => e.property);
    expect(fields).toContain('title');
    expect(fields).toContain('description');
    expect(fields).toContain('type');
    expect(fields).toContain('priority');
  });

  it('não deve gerar erro de validação quando o campo opcional deadline está ausente', async () => {
    const dto = new CreateDemandDto();
    dto.title = 'Implementar login';
    dto.description = 'Tela de login com GitHub';
    dto.type = TypeDemand.FEATURE;
    dto.priority = PriorityDemand.HIGH;
    // deadline intencionalmente ausente (opcional)

    const errors = await validate(dto);

    const deadlineErrors = errors.filter((e) => e.property === 'deadline');
    expect(deadlineErrors).toHaveLength(0);
  });
});
