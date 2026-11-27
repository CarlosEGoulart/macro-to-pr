import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador de rota que extrai o `userId` do usuário autenticado
 * a partir do objeto `request.user` populado pelo `JwtStrategy`.
 *
 * Ex.: `@CurrentUser() userId: string`
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.userId;
  },
);
