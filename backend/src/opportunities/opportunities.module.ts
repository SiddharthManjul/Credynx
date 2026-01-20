import { Module } from '@nestjs/common';
import { OpportunitiesController } from './opportunities.controller.js';
import { OpportunitiesService } from './opportunities.service.js';
import { HallOfFameService } from '../db_services/hall-of-fame.service.js';
import { PrismaService } from '../lib/prisma.service.js';

@Module({
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService, HallOfFameService, PrismaService],
  exports: [OpportunitiesService],
})
export class OpportunitiesModule {}
