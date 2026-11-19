import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('API do Macro2PR')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cabeçalhos de segurança em toda resposta
  app.useSecurityHeaders();

  // Swagger /docs
  SwaggerModule.setup('docs', app, () =>
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  await app.listen(process.env.PORT ?? 3000);
}

if (process.env.VITEST !== 'true') {
  await bootstrap();
}
