import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './lib/index.js';
import { DbServicesModule } from './db_services/index.js';
import { AuthModule } from './auth/auth.module.js';
import { ProfileModule } from './profile/profile.module.js';
import { DevelopersModule } from './developers/developers.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { GithubModule } from './github/github.module.js';
import { ReputationModule } from './reputation/reputation.module.js';
import { VouchingModule } from './vouching/vouching.module.js';
import { FoundersModule } from './founders/founders.module.js';
import { OpportunitiesModule } from './opportunities/opportunities.module.js';
import { JwtAuthGuard } from './auth/guards/index.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    DbServicesModule,
    AuthModule,
    ProfileModule,
    DevelopersModule,
    ProjectsModule,
    GithubModule,
    ReputationModule,
    VouchingModule,
    FoundersModule,
    OpportunitiesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
