import { Injectable } from '@nestjs/common';
import { HallOfFameService } from '../db_services/hall-of-fame.service.js';
import { HackathonStatus, GrantStatus, Hackathon, Grant } from '../../generated/prisma/client.js';
import type { CreateHackathonDto } from './dto/create-hackathon.dto.js';
import type { CreateGrantDto } from './dto/create-grant.dto.js';

@Injectable()
export class OpportunitiesService {
  constructor(private hallOfFameService: HallOfFameService) {}

  /**
   * Get active hackathons (UPCOMING and ONGOING)
   */
  async getActiveHackathons(filters?: {
    ecosystem?: string;
    skip?: number;
    take?: number;
  }) {
    const hackathons = await this.hallOfFameService.hackathons({
      where: {
        status: {
          in: [HackathonStatus.UPCOMING, HackathonStatus.ONGOING],
        },
        ...(filters?.ecosystem && { ecosystem: filters.ecosystem }),
      },
      orderBy: {
        startDate: 'asc',
      },
      skip: filters?.skip,
      take: filters?.take || 50,
    });

    return hackathons;
  }

  /**
   * Get a single hackathon by ID
   */
  async getHackathon(id: string) {
    return this.hallOfFameService.hackathon({ id });
  }

  /**
   * Get open grants
   */
  async getOpenGrants(filters?: {
    ecosystem?: string;
    skip?: number;
    take?: number;
  }) {
    const grants = await this.hallOfFameService.grants({
      where: {
        status: GrantStatus.OPEN,
        ...(filters?.ecosystem && { ecosystem: filters.ecosystem }),
        // Only show grants with future or no deadline
        OR: [
          { deadline: { gte: new Date() } },
          { deadline: null },
        ],
      },
      orderBy: {
        deadline: 'asc',
      },
      skip: filters?.skip,
      take: filters?.take || 50,
    });

    return grants;
  }

  /**
   * Get a single grant by ID
   */
  async getGrant(id: string) {
    return this.hallOfFameService.grant({ id });
  }

  /**
   * Get all opportunities (hackathons and grants combined)
   */
  async getAllOpportunities(filters?: {
    ecosystem?: string;
    type?: 'hackathon' | 'grant' | 'all';
    skip?: number;
    take?: number;
  }) {
    const ecosystem = filters?.ecosystem;
    const type = filters?.type || 'all';

    let hackathonsPromise: Promise<Hackathon[]>;
    let grantsPromise: Promise<Grant[]>;

    if (type === 'all' || type === 'hackathon') {
      hackathonsPromise = this.getActiveHackathons({ ecosystem, skip: filters?.skip, take: filters?.take });
    } else {
      hackathonsPromise = Promise.resolve([]);
    }

    if (type === 'all' || type === 'grant') {
      grantsPromise = this.getOpenGrants({ ecosystem, skip: filters?.skip, take: filters?.take });
    } else {
      grantsPromise = Promise.resolve([]);
    }

    const [hackathons, grants] = await Promise.all([hackathonsPromise, grantsPromise]);

    return {
      hackathons,
      grants,
      total: hackathons.length + grants.length,
    };
  }

  /**
   * Get unique ecosystems for filtering
   */
  async getEcosystems() {
    const [hackathons, grants] = await Promise.all([
      this.hallOfFameService.hackathons({
        where: {
          status: {
            in: [HackathonStatus.UPCOMING, HackathonStatus.ONGOING],
          },
        },
      }),
      this.hallOfFameService.grants({
        where: {
          status: GrantStatus.OPEN,
        },
      }),
    ]);

    const ecosystems = new Set<string>();

    hackathons.forEach((h) => {
      if (h.ecosystem) ecosystems.add(h.ecosystem);
    });

    grants.forEach((g) => {
      if (g.ecosystem) ecosystems.add(g.ecosystem);
    });

    return Array.from(ecosystems).sort();
  }

  /**
   * ADMIN: Create a new hackathon
   */
  async createHackathon(data: CreateHackathonDto) {
    return this.hallOfFameService.createHackathon({
      name: data.name,
      ecosystem: data.ecosystem,
      organizer: data.organizer,
      prizePool: data.prizePool || null,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      websiteUrl: data.websiteUrl,
      status: HackathonStatus.UPCOMING,
    });
  }

  /**
   * ADMIN: Create a new grant
   */
  async createGrant(data: CreateGrantDto) {
    return this.hallOfFameService.createGrant({
      name: data.name,
      ecosystem: data.ecosystem,
      provider: data.provider,
      amount: data.amount || null,
      websiteUrl: data.websiteUrl,
      deadline: data.deadline ? new Date(data.deadline) : null,
      status: GrantStatus.OPEN,
    });
  }

  /**
   * ADMIN: Update hackathon status
   */
  async updateHackathonStatus(id: string, status: HackathonStatus) {
    return this.hallOfFameService.updateHackathon({
      where: { id },
      data: { status },
    });
  }

  /**
   * ADMIN: Update grant status
   */
  async updateGrantStatus(id: string, status: GrantStatus) {
    return this.hallOfFameService.updateGrant({
      where: { id },
      data: { status },
    });
  }
}
