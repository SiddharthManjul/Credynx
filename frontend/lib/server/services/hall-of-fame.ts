import { prisma } from '@/lib/server/prisma';
import type {
  Prisma,
  Hackathon,
  HackathonParticipation,
  Grant,
  GrantRecipient,
  OpenSourceContribution,
} from '@prisma/client';

export const hallOfFameService = {
  // Hackathons
  hackathon(where: Prisma.HackathonWhereUniqueInput): Promise<Hackathon | null> {
    return prisma.hackathon.findUnique({ where });
  },

  hackathons(params: {
    skip?: number;
    take?: number;
    where?: Prisma.HackathonWhereInput;
    orderBy?: Prisma.HackathonOrderByWithRelationInput;
  }): Promise<Hackathon[]> {
    return prisma.hackathon.findMany(params);
  },

  createHackathon(data: Prisma.HackathonCreateInput): Promise<Hackathon> {
    return prisma.hackathon.create({ data });
  },

  updateHackathon(params: {
    where: Prisma.HackathonWhereUniqueInput;
    data: Prisma.HackathonUpdateInput;
  }): Promise<Hackathon> {
    return prisma.hackathon.update(params);
  },

  submitHackathonParticipation(
    data: Prisma.HackathonParticipationCreateInput,
  ): Promise<HackathonParticipation> {
    return prisma.hackathonParticipation.create({ data });
  },

  verifyHackathonParticipation(
    participationId: string,
    verifiedBy: string,
  ): Promise<HackathonParticipation> {
    return prisma.hackathonParticipation.update({
      where: { id: participationId },
      data: { isVerified: true, verifiedAt: new Date(), verifiedBy },
    });
  },

  rejectHackathonParticipation(
    participationId: string,
    reason: string,
  ): Promise<HackathonParticipation> {
    return prisma.hackathonParticipation.update({
      where: { id: participationId },
      data: { isVerified: false, rejectionReason: reason },
    });
  },

  getHackathonWinners(params?: { ecosystem?: string; skip?: number; take?: number }) {
    return prisma.hackathonParticipation.findMany({
      where: {
        isVerified: true,
        ...(params?.ecosystem && { hackathon: { ecosystem: params.ecosystem } }),
      },
      include: {
        developer: { select: { username: true, fullName: true, tier: true } },
        hackathon: true,
      },
      orderBy: { placement: 'asc' },
      skip: params?.skip,
      take: params?.take || 100,
    });
  },

  // Grants
  grant(where: Prisma.GrantWhereUniqueInput): Promise<Grant | null> {
    return prisma.grant.findUnique({ where });
  },

  grants(params: {
    skip?: number;
    take?: number;
    where?: Prisma.GrantWhereInput;
    orderBy?: Prisma.GrantOrderByWithRelationInput;
  }): Promise<Grant[]> {
    return prisma.grant.findMany(params);
  },

  createGrant(data: Prisma.GrantCreateInput): Promise<Grant> {
    return prisma.grant.create({ data });
  },

  updateGrant(params: {
    where: Prisma.GrantWhereUniqueInput;
    data: Prisma.GrantUpdateInput;
  }): Promise<Grant> {
    return prisma.grant.update(params);
  },

  submitGrantRecipient(data: Prisma.GrantRecipientCreateInput): Promise<GrantRecipient> {
    return prisma.grantRecipient.create({ data });
  },

  verifyGrantRecipient(recipientId: string, verifiedBy: string): Promise<GrantRecipient> {
    return prisma.grantRecipient.update({
      where: { id: recipientId },
      data: { isVerified: true, verifiedAt: new Date(), verifiedBy },
    });
  },

  rejectGrantRecipient(recipientId: string, reason: string): Promise<GrantRecipient> {
    return prisma.grantRecipient.update({
      where: { id: recipientId },
      data: { isVerified: false, rejectionReason: reason },
    });
  },

  getGrantRecipients(params?: { ecosystem?: string; skip?: number; take?: number }) {
    return prisma.grantRecipient.findMany({
      where: {
        isVerified: true,
        ...(params?.ecosystem && { grant: { ecosystem: params.ecosystem } }),
      },
      include: {
        developer: { select: { username: true, fullName: true, tier: true } },
        grant: true,
      },
      orderBy: { amountReceived: 'desc' },
      skip: params?.skip,
      take: params?.take || 100,
    });
  },

  // Open source contributions
  createOpenSourceContribution(
    data: Prisma.OpenSourceContributionCreateInput,
  ): Promise<OpenSourceContribution> {
    return prisma.openSourceContribution.create({ data });
  },

  updateOpenSourceContribution(params: {
    where: Prisma.OpenSourceContributionWhereUniqueInput;
    data: Prisma.OpenSourceContributionUpdateInput;
  }): Promise<OpenSourceContribution> {
    return prisma.openSourceContribution.update(params);
  },

  getTopOpenSourceContributors(params?: { skip?: number; take?: number }) {
    return prisma.developer.findMany({
      where: { openSourceContributions: { some: {} } },
      include: {
        openSourceContributions: {
          orderBy: { impactScore: 'desc' },
          take: 5,
        },
      },
      orderBy: { openSourceContributions: { _count: 'desc' } },
      skip: params?.skip,
      take: params?.take || 100,
    });
  },

  async getPendingVerifications() {
    const [hackathonParticipations, grantRecipients] = await Promise.all([
      prisma.hackathonParticipation.findMany({
        where: { isVerified: false, rejectionReason: null },
        include: {
          developer: { select: { username: true, fullName: true } },
          hackathon: true,
        },
        orderBy: { submittedAt: 'desc' },
      }),
      prisma.grantRecipient.findMany({
        where: { isVerified: false, rejectionReason: null },
        include: {
          developer: { select: { username: true, fullName: true } },
          grant: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return { hackathonParticipations, grantRecipients };
  },
};
