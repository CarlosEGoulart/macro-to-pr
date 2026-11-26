import {
  APP_FILTER,
  APP_GUARD,
  APP_INTERCEPTOR,
  APP_PIPE,
} from '@nestjs/core';
import {
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AllExceptionsFilter } from './all-exceptions/all-exceptions.filter.js';
import { TransformInterceptor } from './transform/transform.interceptor.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { JwtStrategy } from './modules/auth/jwt.strategy.js';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard.js';
import { AuthController } from './modules/auth/auth.controller.js';
import { AuthService } from './modules/auth/auth.service.js';
import { GitHubAccountRepository } from './modules/auth/github-account.repository.js';
import { DeveloperRepository } from './modules/auth/developer.repository.js';
import { AuthGuard } from './common/guards/auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';
import { ProjectsModule } from './modules/projects/projects.module.js';
import { DemandsModule } from './modules/demands/demands.module.js';
import { NotionModule } from './modules/notion/notion.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    ProjectsModule,
    DemandsModule,
    NotionModule,
  ],
  controllers: [AppController, AuthController],
  providers: [
    AppService,
    JwtStrategy,
    JwtAuthGuard,
    AuthService,
    GitHubAccountRepository,
    DeveloperRepository,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    },
  ],
})
export class AppModule {}
