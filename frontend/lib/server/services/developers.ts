import { prisma } from '@/lib/server/prisma';
import type {
  Prisma,
  Developer,
  DeveloperTier,
  Availability,
} from '@prisma/client';

export const developersService = {
  developer(where: Prisma.DeveloperWhereUniqueInput): Promise<Developer | null> {
    return prisma.developer.findUnique({ where });
  },

  developers(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.DeveloperWhereUniqueInput;
    where?: Prisma.DeveloperWhereInput;
    orderBy?: Prisma.DeveloperOrderByWithRelationInput;
  }): Promise<Developer[]> {
    return prisma.developer.findMany(params);
  },

  createDeveloper(data: Prisma.DeveloperCreateInput): Promise<Developer> {
    return prisma.developer.create({ data });
  },

  updateDeveloper(params: {
    where: Prisma.DeveloperWhereUniqueInput;
    data: Prisma.DeveloperUpdateInput;
  }): Promise<Developer> {
    return prisma.developer.update(params);
  },

  deleteDeveloper(where: Prisma.DeveloperWhereUniqueInput): Promise<Developer> {
    return prisma.developer.delete({ where });
  },

  getDeveloperWithProjects(developerId: string) {
    return prisma.developer.findUnique({
      where: { id: developerId },
      include: {
        user: true,
        projects: true,
        reputationScores: {
          orderBy: { calculatedAt: 'desc' },
          take: 1,
        },
      },
    });
  },

  getDeveloperByUsername(username: string): Promise<Developer | null> {
    return prisma.developer.findUnique({ where: { username } });
  },

  searchDevelopers(params: {
    tier?: DeveloperTier;
    availability?: Availability;
    minReputation?: number;
    location?: string;
    skip?: number;
    take?: number;
  }) {
    const { tier, availability, minReputation, location, skip, take } = params;

    const whereClause: Prisma.DeveloperWhereInput = {};
    if (tier) whereClause.tier = tier;
    if (availability) whereClause.availability = availability;
    if (minReputation) whereClause.reputationScore = { gte: minReputation };
    if (location) whereClause.location = { contains: location, mode: 'insensitive' };

    return prisma.developer.findMany({
      where: whereClause,
      include: {
        user: { select: { email: true, isVerified: true } },
        projects: true,
        reputationScores: {
          orderBy: { calculatedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { reputationScore: 'desc' },
      skip,
      take: take || 20,
    });
  },

  countDevelopers(where?: Prisma.DeveloperWhereInput): Promise<number> {
    return prisma.developer.count({ where });
  },

  findDeveloperByUserId(userId: string): Promise<Developer | null> {
    return prisma.developer.findUnique({ where: { userId } });
  },

  findDeveloperByUsername(username: string): Promise<Developer | null> {
    return this.getDeveloperByUsername(username);
  },
};
