import { SetMetadata } from '@nestjs/common';
import type { Role } from '../../generated/prisma/enums.js';

export const ROLES_KEY = 'roles';

/**
 * Decorador de rota que declara quais papéis (`Role`) são exigidos para acessá-la.
 * É lido pelo `RolesGuard` via `Reflector` a partir da metadado `ROLES_KEY`.
 *
 * Ex.: `@Roles(Role.Admin)` restringe o endpoint a Administradores.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
