import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service.js';
import { Public, Roles } from '../auth/decorators/index.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { HackathonStatus, GrantStatus } from '../../generated/prisma/client.js';
import { CreateHackathonDto } from './dto/create-hackathon.dto.js';
import { CreateGrantDto } from './dto/create-grant.dto.js';

@Controller('opportunities')
@Public() // All opportunities endpoints are public
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  /**
   * Get all opportunities (hackathons and grants)
   * Public endpoint
   */
  @Get()
  async getAllOpportunities(
    @Query('ecosystem') ecosystem?: string,
    @Query('type') type?: 'hackathon' | 'grant' | 'all',
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.opportunitiesService.getAllOpportunities({
      ecosystem,
      type,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  /**
   * Get active hackathons
   * Public endpoint
   */
  @Get('hackathons')
  async getActiveHackathons(
    @Query('ecosystem') ecosystem?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.opportunitiesService.getActiveHackathons({
      ecosystem,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  /**
   * Get a single hackathon by ID
   * Public endpoint
   */
  @Get('hackathons/:id')
  async getHackathon(@Param('id') id: string) {
    const hackathon = await this.opportunitiesService.getHackathon(id);
    if (!hackathon) {
      throw new HttpException('Hackathon not found', HttpStatus.NOT_FOUND);
    }
    return hackathon;
  }

  /**
   * Get open grants
   * Public endpoint
   */
  @Get('grants')
  async getOpenGrants(
    @Query('ecosystem') ecosystem?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.opportunitiesService.getOpenGrants({
      ecosystem,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  /**
   * Get a single grant by ID
   * Public endpoint
   */
  @Get('grants/:id')
  async getGrant(@Param('id') id: string) {
    const grant = await this.opportunitiesService.getGrant(id);
    if (!grant) {
      throw new HttpException('Grant not found', HttpStatus.NOT_FOUND);
    }
    return grant;
  }

  /**
   * Get unique ecosystems for filtering
   * Public endpoint
   */
  @Get('ecosystems')
  async getEcosystems() {
    return this.opportunitiesService.getEcosystems();
  }

  /**
   * ADMIN: Create a new hackathon
   * Protected - Admin only
   */
  @Post('admin/hackathons')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async createHackathon(@Body() dto: CreateHackathonDto) {
    return this.opportunitiesService.createHackathon(dto);
  }

  /**
   * ADMIN: Create a new grant
   * Protected - Admin only
   */
  @Post('admin/grants')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async createGrant(@Body() dto: CreateGrantDto) {
    return this.opportunitiesService.createGrant(dto);
  }

  /**
   * ADMIN: Update hackathon status
   * Protected - Admin only
   */
  @Patch('admin/hackathons/:id/status')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async updateHackathonStatus(
    @Param('id') id: string,
    @Body('status') status: HackathonStatus,
  ) {
    return this.opportunitiesService.updateHackathonStatus(id, status);
  }

  /**
   * ADMIN: Update grant status
   * Protected - Admin only
   */
  @Patch('admin/grants/:id/status')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async updateGrantStatus(
    @Param('id') id: string,
    @Body('status') status: GrantStatus,
  ) {
    return this.opportunitiesService.updateGrantStatus(id, status);
  }
}
