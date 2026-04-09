import { prisma } from '@/lib/server/prisma';
import type { Prisma, Founder } from '@prisma/client';

export const foundersService = {
  founder(where: Prisma.FounderWhereUniqueInput): Promise<Founder | null> {
    return prisma.founder.findUnique({ where });
  },

  founders(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.FounderWhereUniqueInput;
    where?: Prisma.FounderWhereInput;
    orderBy?: Prisma.FounderOrderByWithRelationInput;
    include?: Prisma.FounderInclude;
  }) {
    return prisma.founder.findMany(params);
  },

  createFounder(data: Prisma.FounderCreateInput): Promise<Founder> {
    return prisma.founder.create({ data });
  },

  updateFounder(params: {
    where: Prisma.FounderWhereUniqueInput;
    data: Prisma.FounderUpdateInput;
  }): Promise<Founder> {
    return prisma.founder.update(params);
  },

  deleteFounder(where: Prisma.FounderWhereUniqueInput): Promise<Founder> {
    return prisma.founder.delete({ where });
  },

  getFounderWithJobs(founderId: string) {
    return prisma.founder.findUnique({
      where: { id: founderId },
      include: {
        user: true,
        jobs: { include: { referrals: true } },
      },
    });
  },

  countFounders(where?: Prisma.FounderWhereInput): Promise<number> {
    return prisma.founder.count({ where });
  },

  findFounderByUserId(userId: string): Promise<Founder | null> {
    return prisma.founder.findUnique({ where: { userId } });
  },
};
