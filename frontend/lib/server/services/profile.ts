import { prisma } from '@/lib/server/prisma';
import { developersService } from './developers';
import { foundersService } from './founders';
import { HttpError } from '@/lib/server/http';
import type {
  CreateDeveloperProfileInput,
  UpdateDeveloperProfileInput,
  CreateFounderProfileInput,
  UpdateFounderProfileInput,
} from '@/lib/server/validation/profile';

export const profileService = {
  async getFullProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        developer: {
          include: {
            projects: true,
            vouchesReceived: {
              where: { isActive: true },
              include: {
                developerVoucher: {
                  select: { username: true, tier: true },
                },
                founderVoucher: {
                  select: { fullName: true, companyName: true },
                },
              },
            },
          },
        },
        founder: true,
      },
    });

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    return user;
  },

  async createDeveloperProfile(userId: string, dto: CreateDeveloperProfileInput) {
    const existing = await developersService.findDeveloperByUserId(userId);
    if (existing) {
      throw new HttpError(409, 'Developer profile already exists');
    }

    const usernameExists = await developersService.findDeveloperByUsername(dto.username);
    if (usernameExists) {
      throw new HttpError(409, 'Username already taken');
    }

    return developersService.createDeveloper({
      user: { connect: { id: userId } },
      ...dto,
    });
  },

  async updateDeveloperProfile(userId: string, dto: UpdateDeveloperProfileInput) {
    const developer = await developersService.findDeveloperByUserId(userId);
    if (!developer) {
      throw new HttpError(404, 'Developer profile not found');
    }

    if (dto.username && dto.username !== developer.username) {
      const usernameExists = await developersService.findDeveloperByUsername(dto.username);
      if (usernameExists) {
        throw new HttpError(409, 'Username already taken');
      }
    }

    return developersService.updateDeveloper({
      where: { id: developer.id },
      data: dto,
    });
  },

  async createFounderProfile(userId: string, dto: CreateFounderProfileInput) {
    const existing = await foundersService.findFounderByUserId(userId);
    if (existing) {
      throw new HttpError(409, 'Founder profile already exists');
    }

    return foundersService.createFounder({
      user: { connect: { id: userId } },
      ...dto,
    });
  },

  async updateFounderProfile(userId: string, dto: UpdateFounderProfileInput) {
    const founder = await foundersService.findFounderByUserId(userId);
    if (!founder) {
      throw new HttpError(404, 'Founder profile not found');
    }

    return foundersService.updateFounder({
      where: { id: founder.id },
      data: dto,
    });
  },
};
