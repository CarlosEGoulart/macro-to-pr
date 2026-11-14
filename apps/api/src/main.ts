import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cabeçalhos de segurança em toda resposta
  app.useSecurityHeaders();

  // Swagger /docs
  const config = new DocumentBuilder()
    .setTitle('API do Macro2PR')
    .setVersion('1.0')
    .build();

  SwaggerModule.setup('docs', app, () =>
    SwaggerModule.createDocument(app, config),
  );

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
