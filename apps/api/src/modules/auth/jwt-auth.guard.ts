import {
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator.js';

/**
 * Guard de autenticação JWT (Passport).
 *
 * Respeita o marcador `@Public()`: rotas públicas (como o ponto de entrada do
 * OAuth do GitHub) são liberadas sem exigir token. Rotas não-públicas exigem
 * JWT válido (caso contrário, o Passport lança 401).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return (super.canActivate(context) as unknown) as Promise<boolean>;
  }

  getRequest(context: ExecutionContext) {
    return context.switchToHttp().getRequest();
  }
}
