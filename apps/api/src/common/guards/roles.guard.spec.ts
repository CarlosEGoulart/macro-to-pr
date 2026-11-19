process.env.JWT_SECRET = 'test-secret-123456';

import { ForbiddenException, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { Role } from '../../generated/prisma/enums.js';
import { Roles } from '../decorators/roles.decorator.js';
import { RolesGuard } from './roles.guard.js';

class AdminController {
  @Roles(Role.Admin)
  adminRoute() {}
}

class OpenController {
  openRoute() {}
}

function makeContext(
  user: { role: Role } | undefined,
  handler: Function,
  controller: Function,
): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => controller,
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard (unidade)', () => {
  let guard: RolesGuard;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = moduleRef.get(RolesGuard);
  });

  it('Desenvolvedor em rota @Roles(Role.Admin) lança ForbiddenException (403)', () => {
    const context = makeContext(
      { role: Role.Developer },
      AdminController.prototype.adminRoute,
      AdminController,
    );

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('Admin em rota @Roles(Role.Admin) é liberado (retorna true)', () => {
    const context = makeContext(
      { role: Role.Admin },
      AdminController.prototype.adminRoute,
      AdminController,
    );

    expect(guard.canActivate(context)).toBe(true);
  });

  it('rota sem @Roles() é liberada para qualquer autenticado (retorna true)', () => {
    const context = makeContext(
      { role: Role.Developer },
      OpenController.prototype.openRoute,
      OpenController,
    );

    expect(guard.canActivate(context)).toBe(true);
  });
});
