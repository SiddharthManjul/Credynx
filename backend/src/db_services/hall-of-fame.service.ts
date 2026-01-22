import { Injectable } from '@nestjs/common';
import { PrismaService } from '../lib/prisma.service.js';
import {
  Hackathon,
  HackathonParticipation,
  Grant,
  GrantRecipient,
  OpenSourceContribution,
  Prisma,
} from '../../generated/prisma/client.js';

@Injectable()
export class HallOfFameService {
  constructor(private prisma: PrismaService) {}

  // Hackathon methods
  async hackathon(
    hackathonWhereUniqueInput: Prisma.HackathonWhereUniqueInput,
  ): Promise<Hackathon | null> {
    return this.prisma.hackathon.findUnique({
      where: hackathonWhereUniqueInput,
    });
  }

  async hackathons(params: {
    skip?: number;
    take?: number;
    where?: Prisma.HackathonWhereInput;
    orderBy?: Prisma.HackathonOrderByWithRelationInput;
  }): Promise<Hackathon[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.hackathon.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  async createHackathon(data: Prisma.HackathonCreateInput): Promise<Hackathon> {
    return this.prisma.hackathon.create({
      data,
    });
  }

  async updateHackathon(params: {
    where: Prisma.HackathonWhereUniqueInput;
    data: Prisma.HackathonUpdateInput;
  }): Promise<Hackathon> {
    const { where, data } = params;
    return this.prisma.hackathon.update({
      data,
      where,
    });
  }

  async submitHackathonParticipation(
    data: Prisma.HackathonParticipationCreateInput,
  ): Promise<HackathonParticipation> {
    return this.prisma.hackathonParticipation.create({
      data,
    });
  }

  async verifyHackathonParticipation(
    participationId: string,
    verifiedBy: string,
  ): Promise<HackathonParticipation> {
    return this.prisma.hackathonParticipation.update({
      where: { id: participationId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy,
      },
    });
  }

  async rejectHackathonParticipation(
    participationId: string,
    reason: string,
  ): Promise<HackathonParticipation> {
    return this.prisma.hackathonParticipation.update({
      where: { id: participationId },
      data: {
        isVerified: false,
        rejectionReason: reason,
      },
    });
  }

  async getHackathonWinners(params?: {
    ecosystem?: string;
    skip?: number;
    take?: number;
  }) {
    return this.prisma.hackathonParticipation.findMany({
      where: {
        isVerified: true,
        ...(params?.ecosystem && {
          hackathon: {
            ecosystem: params.ecosystem,
          },
        }),
      },
      include: {
        developer: {
          select: {
            username: true,
            fullName: true,
            tier: true,
          },
        },
        hackathon: true,
      },
      orderBy: {
        placement: 'asc',
      },
      skip: params?.skip,
      take: params?.take || 100,
    });
  }

  // Grant methods
  async grant(
    grantWhereUniqueInput: Prisma.GrantWhereUniqueInput,
  ): Promise<Grant | null> {
    return this.prisma.grant.findUnique({
      where: grantWhereUniqueInput,
    });
  }

  async grants(params: {
    skip?: number;
    take?: number;
    where?: Prisma.GrantWhereInput;
    orderBy?: Prisma.GrantOrderByWithRelationInput;
  }): Promise<Grant[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.grant.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  async createGrant(data: Prisma.GrantCreateInput): Promise<Grant> {
    return this.prisma.grant.create({
      data,
    });
  }

  async updateGrant(params: {
    where: Prisma.GrantWhereUniqueInput;
    data: Prisma.GrantUpdateInput;
  }): Promise<Grant> {
    const { where, data } = params;
    return this.prisma.grant.update({
      data,
      where,
    });
  }

  async submitGrantRecipient(
    data: Prisma.GrantRecipientCreateInput,
  ): Promise<GrantRecipient> {
    return this.prisma.grantRecipient.create({
      data,
    });
  }

  async verifyGrantRecipient(
    recipientId: string,
    verifiedBy: string,
  ): Promise<GrantRecipient> {
    return this.prisma.grantRecipient.update({
      where: { id: recipientId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy,
      },
    });
  }

  async rejectGrantRecipient(
    recipientId: string,
    reason: string,
  ): Promise<GrantRecipient> {
    return this.prisma.grantRecipient.update({
      where: { id: recipientId },
      data: {
        isVerified: false,
        rejectionReason: reason,
      },
    });
  }

  async getGrantRecipients(params?: {
    ecosystem?: string;
    skip?: number;
    take?: number;
  }) {
    return this.prisma.grantRecipient.findMany({
      where: {
        isVerified: true,
        ...(params?.ecosystem && {
          grant: {
            ecosystem: params.ecosystem,
          },
        }),
      },
      include: {
        developer: {
          select: {
            username: true,
            fullName: true,
            tier: true,
          },
        },
        grant: true,
      },
      orderBy: {
        amountReceived: 'desc',
      },
      skip: params?.skip,
      take: params?.take || 100,
    });
  }

  // Open Source Contribution methods
  async createOpenSourceContribution(
    data: Prisma.OpenSourceContributionCreateInput,
  ): Promise<OpenSourceContribution> {
    return this.prisma.openSourceContribution.create({
      data,
    });
  }

  async updateOpenSourceContribution(params: {
    where: Prisma.OpenSourceContributionWhereUniqueInput;
    data: Prisma.OpenSourceContributionUpdateInput;
  }): Promise<OpenSourceContribution> {
    const { where, data } = params;
    return this.prisma.openSourceContribution.update({
      data,
      where,
    });
  }

  async getTopOpenSourceContributors(params?: {
    skip?: number;
    take?: number;
  }) {
    return this.prisma.developer.findMany({
      where: {
        openSourceContributions: {
          some: {},
        },
      },
      include: {
        openSourceContributions: {
          orderBy: {
            impactScore: 'desc',
          },
          take: 5,
        },
      },
      orderBy: {
        openSourceContributions: {
          _count: 'desc',
        },
      },
      skip: params?.skip,
      take: params?.take || 100,
    });
  }

  async getPendingVerifications() {
    const [hackathonParticipations, grantRecipients] = await Promise.all([
      this.prisma.hackathonParticipation.findMany({
        where: {
          isVerified: false,
          rejectionReason: null,
        },
        include: {
          developer: {
            select: {
              username: true,
              fullName: true,
            },
          },
          hackathon: true,
        },
        orderBy: {
          submittedAt: 'desc',
        },
      }),
      this.prisma.grantRecipient.findMany({
        where: {
          isVerified: false,
          rejectionReason: null,
        },
        include: {
          developer: {
            select: {
              username: true,
              fullName: true,
            },
          },
          grant: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return {
      hackathonParticipations,
      grantRecipients,
    };
  }
}
