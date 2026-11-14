import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse();
    const request = host.switchToHttp().getRequest();

    // 1. Erros que o Nest já entende (ex.: validação do ValidationPipe) passam como estão
    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }

    // 2. Erros conhecidos do Prisma viram o código certo
    if (
      exception instanceof Error &&
      'code' in exception &&
      (exception as { code?: string }).code === 'P2002'
    ) {
      response
        .status(HttpStatus.CONFLICT)
        .json({ message: 'Registro já existe para este campo único.' });
      return;
    }

    if (
      exception instanceof Error &&
      'code' in exception &&
      (exception as { code?: string }).code === 'P2025'
    ) {
      response.status(HttpStatus.NOT_FOUND).json({ message: 'Registro não encontrado.' });
      return;
    }

    // 3. Qualquer outro: registre no log e devolva 500 genérico
    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : String(exception),
    );
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Erro interno do servidor.',
    });
  }
}
