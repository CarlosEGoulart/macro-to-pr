import {
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '../../generated/prisma/enums.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

/**
 * Guard de autorização baseada em papel (RBAC).
 *
 * É executado APÓS o `AuthGuard` (ordem da lista `APP_GUARD` em `app.module.ts`),
 * portanto `request.user` já está populado (incluindo `role`, preenchido pelo
 * `AuthGuard` a partir do payload do JWT).
 *
 * - Rotas sem `@Roles()`: liberadas para qualquer autenticado.
 * - Rotas com `@Roles(...)`: só passa se `request.user.role` estiver entre os
 *   papéis exigidos; caso contrário lança `ForbiddenException` (403).
 */
@Injectable()
export class RolesGuard {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Sem @Roles na rota: qualquer autenticado passa.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { role?: Role } | undefined;
    const role = user?.role;

    // Sem usuário autenticado ou sem papel no token: não autoriza (403, nunca 500).
    if (!user || role === undefined || !requiredRoles.includes(role)) {
      throw new ForbiddenException();
    }

    return true;
  }
}
