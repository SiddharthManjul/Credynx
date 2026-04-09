import { hallOfFameService } from './hall-of-fame';
import { HackathonStatus, GrantStatus } from '@prisma/client';
import type { Hackathon, Grant } from '@prisma/client';
import type {
  CreateHackathonInput,
  CreateGrantInput,
} from '@/lib/server/validation/opportunity';

export const opportunitiesService = {
  getActiveHackathons(filters?: { ecosystem?: string; skip?: number; take?: number }) {
    return hallOfFameService.hackathons({
      where: {
        status: { in: [HackathonStatus.UPCOMING, HackathonStatus.ONGOING] },
        ...(filters?.ecosystem && { ecosystem: filters.ecosystem }),
      },
      orderBy: { startDate: 'asc' },
      skip: filters?.skip,
      take: filters?.take || 50,
    });
  },

  getHackathon(id: string) {
    return hallOfFameService.hackathon({ id });
  },

  getOpenGrants(filters?: { ecosystem?: string; skip?: number; take?: number }) {
    return hallOfFameService.grants({
      where: {
        status: GrantStatus.OPEN,
        ...(filters?.ecosystem && { ecosystem: filters.ecosystem }),
        OR: [{ deadline: { gte: new Date() } }, { deadline: null }],
      },
      orderBy: { deadline: 'asc' },
      skip: filters?.skip,
      take: filters?.take || 50,
    });
  },

  getGrant(id: string) {
    return hallOfFameService.grant({ id });
  },

  async getAllOpportunities(filters?: {
    ecosystem?: string;
    type?: 'hackathon' | 'grant' | 'all';
    skip?: number;
    take?: number;
  }) {
    const ecosystem = filters?.ecosystem;
    const type = filters?.type || 'all';

    const hackathonsPromise: Promise<Hackathon[]> =
      type === 'all' || type === 'hackathon'
        ? this.getActiveHackathons({ ecosystem, skip: filters?.skip, take: filters?.take })
        : Promise.resolve([]);

    const grantsPromise: Promise<Grant[]> =
      type === 'all' || type === 'grant'
        ? this.getOpenGrants({ ecosystem, skip: filters?.skip, take: filters?.take })
        : Promise.resolve([]);

    const [hackathons, grants] = await Promise.all([hackathonsPromise, grantsPromise]);

    return {
      hackathons,
      grants,
      total: hackathons.length + grants.length,
    };
  },

  async getEcosystems() {
    const [hackathons, grants] = await Promise.all([
      hallOfFameService.hackathons({
        where: { status: { in: [HackathonStatus.UPCOMING, HackathonStatus.ONGOING] } },
      }),
      hallOfFameService.grants({ where: { status: GrantStatus.OPEN } }),
    ]);

    const ecosystems = new Set<string>();
    hackathons.forEach((h) => {
      if (h.ecosystem) ecosystems.add(h.ecosystem);
    });
    grants.forEach((g) => {
      if (g.ecosystem) ecosystems.add(g.ecosystem);
    });

    return Array.from(ecosystems).sort();
  },

  createHackathon(data: CreateHackathonInput) {
    return hallOfFameService.createHackathon({
      name: data.name,
      ecosystem: data.ecosystem,
      organizer: data.organizer,
      prizePool: data.prizePool || null,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      websiteUrl: data.websiteUrl,
      status: HackathonStatus.UPCOMING,
    });
  },

  createGrant(data: CreateGrantInput) {
    return hallOfFameService.createGrant({
      name: data.name,
      ecosystem: data.ecosystem,
      provider: data.provider,
      amount: data.amount || null,
      websiteUrl: data.websiteUrl,
      deadline: data.deadline ? new Date(data.deadline) : null,
      status: GrantStatus.OPEN,
    });
  },

  updateHackathonStatus(id: string, status: HackathonStatus) {
    return hallOfFameService.updateHackathon({ where: { id }, data: { status } });
  },

  updateGrantStatus(id: string, status: GrantStatus) {
    return hallOfFameService.updateGrant({ where: { id }, data: { status } });
  },
};
