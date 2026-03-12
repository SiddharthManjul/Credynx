import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ProfileService } from './profile.service.js';
import { ProjectsService } from '../db_services/projects.service.js';
import { CurrentUser } from '../auth/decorators/index.js';
import type { User } from '../../generated/prisma/client.js';
import {
  CreateDeveloperProfileDto,
  UpdateDeveloperProfileDto,
  CreateFounderProfileDto,
  UpdateFounderProfileDto,
} from './dto/index.js';
import {
  CreateProjectDto,
  UpdateProjectDto,
} from '../projects/dto/index.js';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Get('me')
  async getMyProfile(@CurrentUser() user: User) {
    return this.profileService.getFullProfile(user.id);
  }

  @Patch('me')
  async updateMyProfile(
    @CurrentUser() user: User,
    @Body() updateDto: UpdateDeveloperProfileDto | UpdateFounderProfileDto,
  ) {
    if (user.role === 'DEVELOPER') {
      return this.profileService.updateDeveloperProfile(
        user.id,
        updateDto as UpdateDeveloperProfileDto,
      );
    } else if (user.role === 'FOUNDER') {
      return this.profileService.updateFounderProfile(
        user.id,
        updateDto as UpdateFounderProfileDto,
      );
    }

    // For ADMIN or other roles, detect profile type by checking what exists
    const profile = await this.profileService.getFullProfile(user.id);
    if ((profile as any).developer) {
      return this.profileService.updateDeveloperProfile(
        user.id,
        updateDto as UpdateDeveloperProfileDto,
      );
    } else if ((profile as any).founder) {
      return this.profileService.updateFounderProfile(
        user.id,
        updateDto as UpdateFounderProfileDto,
      );
    }

    throw new HttpException(
      'No profile found to update',
      HttpStatus.NOT_FOUND,
    );
  }

  @Post('me')
  async createMyProfile(
    @CurrentUser() user: User,
    @Body() createDto: CreateDeveloperProfileDto | CreateFounderProfileDto,
  ) {
    if (user.role === 'DEVELOPER') {
      return this.profileService.createDeveloperProfile(
        user.id,
        createDto as CreateDeveloperProfileDto,
      );
    } else if (user.role === 'FOUNDER') {
      return this.profileService.createFounderProfile(
        user.id,
        createDto as CreateFounderProfileDto,
      );
    }
    throw new HttpException(
      'Invalid user role',
      HttpStatus.BAD_REQUEST,
    );
  }

  // Project management endpoints
  @Get('me/projects')
  async getMyProjects(@CurrentUser() user: User) {
    const profile = await this.profileService.getFullProfile(user.id);
    if (!(profile as any).developer) {
      throw new HttpException(
        'Only developers can have projects',
        HttpStatus.FORBIDDEN,
      );
    }
    return this.projectsService.findProjectsByDeveloper((profile as any).developer.id);
  }

  @Post('me/projects')
  async createProject(
    @CurrentUser() user: User,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    const profile = await this.profileService.getFullProfile(user.id);
    if (!(profile as any).developer) {
      throw new HttpException(
        'Only developers can create projects',
        HttpStatus.FORBIDDEN,
      );
    }
    return this.projectsService.createProject({
      developer: { connect: { id: (profile as any).developer.id } },
      ...createProjectDto,
    });
  }

  @Patch('me/projects/:id')
  async updateProject(
    @CurrentUser() user: User,
    @Param('id') projectId: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    const profile = await this.profileService.getFullProfile(user.id);
    if (!(profile as any).developer) {
      throw new HttpException(
        'Only developers can update projects',
        HttpStatus.FORBIDDEN,
      );
    }

    // Verify project belongs to this developer
    const project = await this.projectsService.findProjectById(projectId);
    if (!project || project.developerId !== (profile as any).developer.id) {
      throw new HttpException(
        'Project not found or access denied',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.projectsService.updateProject({
      where: { id: projectId },
      data: updateProjectDto,
    });
  }

  @Delete('me/projects/:id')
  async deleteProject(
    @CurrentUser() user: User,
    @Param('id') projectId: string,
  ) {
    const profile = await this.profileService.getFullProfile(user.id);
    if (!(profile as any).developer) {
      throw new HttpException(
        'Only developers can delete projects',
        HttpStatus.FORBIDDEN,
      );
    }

    // Verify project belongs to this developer
    const project = await this.projectsService.findProjectById(projectId);
    if (!project || project.developerId !== (profile as any).developer.id) {
      throw new HttpException(
        'Project not found or access denied',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.projectsService.deleteProject({ id: projectId });
  }
}
