import { prisma } from '@/lib/server/prisma';
import { githubService } from './github';
import { HttpError } from '@/lib/server/http';
import { DeveloperTier } from '@prisma/client';

export interface ReputationBreakdown {
  totalScore: number;
  tier: DeveloperTier;
  breakdown: {
    githubScore: number;
    projectsScore: number;
    timeScore: number;
    hackathonsScore: number;
    communityScore: number;
  };
  weights: {
    github: number;
    projects: number;
    time: number;
    hackathons: number;
    community: number;
  };
  metadata: {
    githubStats?: any;
    projectStats?: any;
    hackathonStats?: any;
    communityStats?: any;
  };
}

const WEIGHTS = {
  GITHUB: 0.3,
  PROJECTS: 0.25,
  TIME: 0.15,
  HACKATHONS: 0.2,
  COMMUNITY: 0.1,
};

const VOUCH_WEIGHTS: Record<string, number> = {
  TIER_1: 5.0,
  TIER_2: 3.0,
  TIER_3: 1.5,
  TIER_4: 0.5,
};

function extractGitHubUsername(githubUrl: string): string | null {
  const match = githubUrl.match(/github\.com\/([^\/]+)/);
  return match ? match[1] : null;
}

function assignTier(score: number): DeveloperTier {
  if (score >= 76) return DeveloperTier.TIER_1;
  if (score >= 51) return DeveloperTier.TIER_2;
  if (score >= 26) return DeveloperTier.TIER_3;
  return DeveloperTier.TIER_4;
}

async function calculateGitHubScore(developer: any): Promise<number> {
  try {
    if (!developer.github) return 0;
    const username = extractGitHubUsername(developer.github);
    if (!username) return 0;

    const stats = await githubService.getGitHubStats(username);

    const repoScore = Math.min((stats.repositories.length / 20) * 25, 25);
    const starScore = Math.min((stats.totalStars / 100) * 35, 35);
    const forkScore = Math.min((stats.totalForks / 50) * 20, 20);
    const followerScore = Math.min((stats.profile.followers / 100) * 20, 20);

    return Math.min(repoScore + starScore + forkScore + followerScore, 100);
  } catch (error) {
    console.warn('[reputation] Failed to calculate GitHub score, returning 0', error);
    return 0;
  }
}

function calculateProjectsScore(developer: any): number {
  const projects = developer.projects || [];
  if (projects.length === 0) return 0;

  const projectCountScore = Math.min((projects.length / 10) * 40, 40);

  const allTechnologies = projects.flatMap((p: any) => p.technologies || []);
  const uniqueTech = new Set(allTechnologies);
  const techDiversityScore = Math.min((uniqueTech.size / 15) * 25, 25);

  const deployedCount = projects.filter(
    (p: any) => p.livePlatformUrl && p.livePlatformUrl.length > 0,
  ).length;
  const deploymentScore = Math.min((deployedCount / 5) * 20, 20);

  const totalProjectStars = projects.reduce(
    (sum: number, p: any) => sum + (p.githubStars || 0),
    0,
  );
  const starsScore = Math.min((totalProjectStars / 50) * 15, 15);

  return Math.min(projectCountScore + techDiversityScore + deploymentScore + starsScore, 100);
}

function calculateTimeInvestmentScore(developer: any): number {
  const now = new Date();
  const createdAt = new Date(developer.createdAt);
  const updatedAt = new Date(developer.updatedAt);

  const ageInMonths = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
  const ageScore = Math.min((ageInMonths / 12) * 40, 40);

  const daysSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
  const activityScore =
    daysSinceUpdate <= 7 ? 30 : daysSinceUpdate <= 30 ? 20 : daysSinceUpdate <= 90 ? 10 : 0;

  const projects = developer.projects || [];
  const recentProjects = projects.filter((p: any) => {
    const projectUpdate = new Date(p.updatedAt);
    const daysSince = (now.getTime() - projectUpdate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 90;
  });
  const recencyScore = Math.min((recentProjects.length / 3) * 30, 30);

  return Math.min(ageScore + activityScore + recencyScore, 100);
}

function calculateHackathonsGrantsScore(developer: any): number {
  const hackathons = developer.hackathonParticipations || [];
  const grants = developer.grantRecipients || [];

  const hackathonCountScore = Math.min((hackathons.length / 5) * 25, 25);

  const placementScore = hackathons.reduce((sum: number, h: any) => {
    if (h.placement === 1) return sum + 20;
    if (h.placement === 2) return sum + 15;
    if (h.placement === 3) return sum + 10;
    return sum + 5;
  }, 0);
  const normalizedPlacementScore = Math.min(placementScore, 40);

  const grantCountScore = Math.min((grants.length / 3) * 20, 20);

  const totalPrize = [
    ...hackathons.map((h: any) => h.prizeAmount || 0),
    ...grants.map((g: any) => g.amountReceived || 0),
  ].reduce((sum: number, amount: number) => sum + amount, 0);
  const prizeScore = Math.min((totalPrize / 10000) * 15, 15);

  return Math.min(
    hackathonCountScore + normalizedPlacementScore + grantCountScore + prizeScore,
    100,
  );
}

function calculateCommunityScore(developer: any): number {
  const vouches = developer.vouchesReceived || [];
  if (vouches.length === 0) return 0;

  const vouchScore = vouches.reduce((sum: number, vouch: any) => {
    const voucherTier = vouch.developerVoucher?.tier || vouch.voucherTier;
    const weight = VOUCH_WEIGHTS[voucherTier] || 1.0;
    return sum + weight;
  }, 0);

  return Math.min((vouchScore / 20) * 100, 100);
}

async function saveReputationScore(
  developerId: string,
  breakdown: ReputationBreakdown,
): Promise<void> {
  await prisma.reputationScore.create({
    data: {
      developer: { connect: { id: developerId } },
      totalScore: breakdown.totalScore,
      tier: breakdown.tier,
      githubScore: breakdown.breakdown.githubScore,
      projectsScore: breakdown.breakdown.projectsScore,
      timeScore: breakdown.breakdown.timeScore,
      hackathonsScore: breakdown.breakdown.hackathonsScore,
      communityScore: breakdown.breakdown.communityScore,
      metadata: breakdown.metadata,
    },
  });
}

async function saveReputationHistory(
  developerId: string,
  score: number,
  tier: DeveloperTier,
): Promise<void> {
  await prisma.reputationHistory.create({
    data: {
      developer: { connect: { id: developerId } },
      score,
      tier,
    },
  });
}

export const reputationService = {
  async calculateReputation(developerId: string): Promise<ReputationBreakdown> {
    const developer = await prisma.developer.findUnique({
      where: { id: developerId },
      include: {
        projects: true,
        vouchesReceived: {
          where: { isActive: true },
          include: {
            developerVoucher: { select: { tier: true } },
            founderVoucher: { select: { id: true } },
          },
        },
        hackathonParticipations: { where: { isVerified: true } },
        grantRecipients: { where: { isVerified: true } },
        openSourceContributions: true,
      },
    });

    if (!developer) {
      throw new HttpError(404, 'Developer not found');
    }

    const githubScore = await calculateGitHubScore(developer);
    const projectsScore = calculateProjectsScore(developer);
    const timeScore = calculateTimeInvestmentScore(developer);
    const hackathonsScore = calculateHackathonsGrantsScore(developer);
    const communityScore = calculateCommunityScore(developer);

    const totalScore =
      githubScore * WEIGHTS.GITHUB +
      projectsScore * WEIGHTS.PROJECTS +
      timeScore * WEIGHTS.TIME +
      hackathonsScore * WEIGHTS.HACKATHONS +
      communityScore * WEIGHTS.COMMUNITY;

    const tier = assignTier(totalScore);

    const breakdown: ReputationBreakdown = {
      totalScore: Math.round(totalScore * 10) / 10,
      tier,
      breakdown: {
        githubScore: Math.round(githubScore * 10) / 10,
        projectsScore: Math.round(projectsScore * 10) / 10,
        timeScore: Math.round(timeScore * 10) / 10,
        hackathonsScore: Math.round(hackathonsScore * 10) / 10,
        communityScore: Math.round(communityScore * 10) / 10,
      },
      weights: {
        github: WEIGHTS.GITHUB,
        projects: WEIGHTS.PROJECTS,
        time: WEIGHTS.TIME,
        hackathons: WEIGHTS.HACKATHONS,
        community: WEIGHTS.COMMUNITY,
      },
      metadata: {},
    };

    await saveReputationScore(developerId, breakdown);

    await prisma.developer.update({
      where: { id: developerId },
      data: { reputationScore: breakdown.totalScore, tier },
    });

    await saveReputationHistory(developerId, breakdown.totalScore, tier);

    return breakdown;
  },

  async getReputation(developerId: string) {
    const latestScore = await prisma.reputationScore.findFirst({
      where: { developerId },
      orderBy: { calculatedAt: 'desc' },
    });

    if (!latestScore) {
      throw new HttpError(404, 'No reputation score found. Calculate first.');
    }

    return latestScore;
  },

  getReputationHistory(developerId: string) {
    return prisma.reputationHistory.findMany({
      where: { developerId },
      orderBy: { date: 'desc' },
      take: 30,
    });
  },

  async recalculateAllReputations(): Promise<{ success: number; failed: number }> {
    const developers = await prisma.developer.findMany({ select: { id: true } });

    let success = 0;
    let failed = 0;

    for (const developer of developers) {
      try {
        await this.calculateReputation(developer.id);
        success++;
      } catch (error) {
        console.error(`[reputation] Failed to calculate reputation for ${developer.id}`, error);
        failed++;
      }
    }

    return { success, failed };
  },
};
