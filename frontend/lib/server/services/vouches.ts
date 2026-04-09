import { prisma } from '@/lib/server/prisma';
import type { Prisma, Vouch, VouchEligibility } from '@prisma/client';

export const vouchesService = {
  vouch(where: Prisma.VouchWhereUniqueInput): Promise<Vouch | null> {
    return prisma.vouch.findUnique({ where });
  },

  vouches(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.VouchWhereUniqueInput;
    where?: Prisma.VouchWhereInput;
    orderBy?: Prisma.VouchOrderByWithRelationInput;
    include?: Prisma.VouchInclude;
  }) {
    return prisma.vouch.findMany(params);
  },

  createVouch(data: Prisma.VouchCreateInput): Promise<Vouch> {
    return prisma.vouch.create({ data });
  },

  updateVouch(params: {
    where: Prisma.VouchWhereUniqueInput;
    data: Prisma.VouchUpdateInput;
  }): Promise<Vouch> {
    return prisma.vouch.update(params);
  },

  deleteVouch(where: Prisma.VouchWhereUniqueInput): Promise<Vouch> {
    return prisma.vouch.delete({ where });
  },

  getVouchesForDeveloper(developerId: string) {
    return prisma.vouch.findMany({
      where: { vouchedUserId: developerId, isActive: true },
      include: {
        developerVoucher: {
          select: { username: true, fullName: true, tier: true },
        },
        founderVoucher: {
          select: { fullName: true, companyName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  getVouchesByDeveloper(voucherId: string) {
    return prisma.vouch.findMany({
      where: { voucherId, isActive: true },
      include: {
        vouchedUser: {
          select: { username: true, fullName: true, tier: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  checkVouchEligibility(developerId: string): Promise<VouchEligibility | null> {
    return prisma.vouchEligibility.findUnique({ where: { developerId } });
  },

  updateVouchEligibility(
    developerId: string,
    isEligible: boolean,
    reasonsNotEligible: string[],
  ): Promise<VouchEligibility> {
    return prisma.vouchEligibility.upsert({
      where: { developerId },
      update: { isEligible, reasonsNotEligible, lastCheckedAt: new Date() },
      create: {
        developer: { connect: { id: developerId } },
        isEligible,
        reasonsNotEligible,
      },
    });
  },

  revokeVouch(vouchId: string, reason: string): Promise<Vouch> {
    return prisma.vouch.update({
      where: { id: vouchId },
      data: {
        isActive: false,
        revokedAt: new Date(),
        revokeReason: reason,
      },
    });
  },

  countVouches(where?: Prisma.VouchWhereInput): Promise<number> {
    return prisma.vouch.count({ where });
  },
};
