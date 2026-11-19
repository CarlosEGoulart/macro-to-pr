process.env.JWT_SECRET = 'test-secret-123456';

import { ForbiddenException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../src/common/guards/roles.guard.js';
import { Role } from '../src/generated/prisma/enums.js';

type MockReflector = {
  getAllAndOverride: ReturnType<typeof vi.fn>;
};

const reflectorMock = {
  getAllAndOverride: vi.fn(),
} as unknown as MockReflector;

function makeContext(
  requiredRoles: Role[] | undefined,
  user: Record<string, unknown> | undefined,
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;

  beforeEach(() => {
    guard = new RolesGuard(reflectorMock as unknown as Reflector);
    vi.clearAllMocks();
  });

  it('libera rota sem @Roles() para qualquer autenticado (qualquer papel)', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(undefined);
    const ctx = makeContext(undefined, { role: Role.Developer });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('libera rota sem @Roles() mesmo quando request.user não traz role', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(undefined);
    const ctx = makeContext(undefined, { userId: '1', email: 'dev@test.com' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('responde 403 (ForbiddenException) para Desenvolvedor em rota de @Roles(Role.Admin)', () => {
    reflectorMock.getAllAndOverride.mockReturnValue([Role.Admin]);
    const ctx = makeContext([Role.Admin], { role: Role.Developer });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('libera Admin em rota de @Roles(Role.Admin)', () => {
    reflectorMock.getAllAndOverride.mockReturnValue([Role.Admin]);
    const ctx = makeContext([Role.Admin], { role: Role.Admin });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('responde 403 quando o token não traz role (sem 500)', () => {
    reflectorMock.getAllAndOverride.mockReturnValue([Role.Admin]);
    const ctx = makeContext([Role.Admin], {
      userId: '1',
      email: 'dev@test.com',
    });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
