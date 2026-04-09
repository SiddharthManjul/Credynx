import { developersService } from './developers';
import { vouchesService } from './vouches';
import { HttpError } from '@/lib/server/http';
import { DeveloperTier } from '@prisma/client';
import type { CreateVouchInput } from '@/lib/server/validation/vouch';

const TIER_WEIGHTS: Record<string, number> = {
  TIER_1: 3.0,
  TIER_2: 2.0,
  TIER_3: 1.0,
  TIER_4: 0.0,
  ADMIN: 5.0,
  FOUNDER: 2.5,
};

const MAX_VOUCHES_PER_MONTH = 5;

function canVouchForTier(voucherTier: DeveloperTier, targetTier: DeveloperTier): boolean {
  const hierarchy: Record<DeveloperTier, DeveloperTier[]> = {
    TIER_1: [DeveloperTier.TIER_2, DeveloperTier.TIER_3, DeveloperTier.TIER_4],
    TIER_2: [DeveloperTier.TIER_3, DeveloperTier.TIER_4],
    TIER_3: [DeveloperTier.TIER_4],
    TIER_4: [],
  };
  return hierarchy[voucherTier]?.includes(targetTier) || false;
}

function getVouchWeight(tier: DeveloperTier, isAdmin: boolean = false): number {
  if (isAdmin) return TIER_WEIGHTS.ADMIN;
  return TIER_WEIGHTS[tier] || 0;
}

export const vouchingService = {
  /**
   * Check if developer is eligible to receive vouches.
   * NOTE: All eligibility checks are disabled for testing (mirrors backend).
   */
  async checkVouchEligibility(
    developerId: string,
  ): Promise<{ isEligible: boolean; reasonsNotEligible: string[] }> {
    const developer = await developersService.developer({ id: developerId });
    if (!developer) {
      throw new HttpError(404, 'Developer not found');
    }

    const reasonsNotEligible: string[] = [];
    const isEligible = true;

    await vouchesService.updateVouchEligibility(developerId, isEligible, reasonsNotEligible);

    return { isEligible, reasonsNotEligible };
  },

  async createVouch(voucherId: string, dto: CreateVouchInput, isFounder: boolean = false) {
    let voucherTier: DeveloperTier | undefined;
    let weight: number;

    if (isFounder) {
      weight = TIER_WEIGHTS.FOUNDER;
      voucherTier = undefined;
    } else {
      const voucher = await developersService.developer({ id: voucherId });
      if (!voucher) {
        throw new HttpError(404, 'Voucher not found');
      }

      const vouchedUser = await developersService.developer({ id: dto.vouchedUserId });
      if (!vouchedUser) {
        throw new HttpError(404, 'Developer to vouch for not found');
      }

      if (voucherId === dto.vouchedUserId) {
        throw new HttpError(400, 'Cannot vouch for yourself');
      }

      if (!canVouchForTier(voucher.tier, vouchedUser.tier)) {
        throw new HttpError(403, `${voucher.tier} tier cannot vouch for ${vouchedUser.tier} tier`);
      }

      voucherTier = voucher.tier;
      weight = getVouchWeight(voucher.tier);
    }

    const vouchedUser = await developersService.developer({ id: dto.vouchedUserId });
    if (!vouchedUser) {
      throw new HttpError(404, 'Developer to vouch for not found');
    }

    const existingVouch = await vouchesService.vouches({
      where: {
        voucherId,
        vouchedUserId: dto.vouchedUserId,
      },
    });

    if (existingVouch.length > 0) {
      throw new HttpError(400, 'You have already vouched for this developer');
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const vouchesThisMonth = await vouchesService.vouches({
      where: {
        voucherId,
        createdAt: { gte: startOfMonth },
        isActive: true,
      },
    });

    if (vouchesThisMonth.length >= MAX_VOUCHES_PER_MONTH) {
      throw new HttpError(
        400,
        `You have reached the maximum of ${MAX_VOUCHES_PER_MONTH} vouches per month`,
      );
    }

    const vouchData: any = {
      voucherId,
      voucherType: isFounder ? 'FOUNDER' : 'DEVELOPER',
      voucherTier,
      vouchedUser: { connect: { id: dto.vouchedUserId } },
      vouchedUserTier: vouchedUser.tier,
      skillsEndorsed: dto.skillsEndorsed,
      message: dto.message,
      weight,
      isActive: true,
    };

    if (isFounder) {
      vouchData.founderVoucher = { connect: { id: voucherId } };
    } else {
      vouchData.developerVoucher = { connect: { id: voucherId } };
    }

    return vouchesService.createVouch(vouchData);
  },

  async getVouchesForDeveloper(developerId: string) {
    const vouches = await vouchesService.vouches({
      where: { vouchedUserId: developerId, isActive: true },
      include: {
        developerVoucher: {
          select: { id: true, username: true, fullName: true, tier: true },
        },
        founderVoucher: {
          select: { id: true, fullName: true, companyName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const transformedVouches = vouches.map((vouch: any) => {
      const voucher =
        vouch.voucherType === 'FOUNDER' && vouch.founderVoucher
          ? {
              id: vouch.founderVoucher.id,
              username: vouch.founderVoucher.companyName,
              fullName: vouch.founderVoucher.fullName,
              tier: 'FOUNDER',
            }
          : {
              id: vouch.developerVoucher?.id,
              username: vouch.developerVoucher?.username,
              fullName: vouch.developerVoucher?.fullName,
              tier: vouch.developerVoucher?.tier,
            };

      return { ...vouch, voucher };
    });

    const totalWeight = vouches.reduce((sum: number, v: any) => sum + v.weight, 0);
    const vouchCount = vouches.length;

    return { vouches: transformedVouches, totalWeight, vouchCount };
  },

  getVouchesGivenByDeveloper(developerId: string) {
    return vouchesService.vouches({
      where: { voucherId: developerId, isActive: true },
      include: {
        vouchedUser: {
          select: { id: true, username: true, fullName: true, tier: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async revokeVouch(vouchId: string, voucherId: string, reason?: string) {
    const vouch = await vouchesService.vouch({ id: vouchId });

    if (!vouch) {
      throw new HttpError(404, 'Vouch not found');
    }

    if (vouch.voucherId !== voucherId) {
      throw new HttpError(403, 'You can only revoke your own vouches');
    }

    if (!vouch.isActive) {
      throw new HttpError(400, 'This vouch is already revoked');
    }

    return vouchesService.updateVouch({
      where: { id: vouchId },
      data: {
        isActive: false,
        revokedAt: new Date(),
        revokeReason: reason,
      },
    });
  },
};
