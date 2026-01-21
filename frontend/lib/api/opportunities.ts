import apiClient from './client';
import type {
  Hackathon,
  Grant,
  OpportunitiesResponse,
  OpportunitiesFilters,
} from '@/types';

export const opportunitiesApi = {
  /**
   * Get all opportunities (hackathons and grants)
   */
  async getAllOpportunities(filters?: OpportunitiesFilters): Promise<OpportunitiesResponse> {
    const { data } = await apiClient.get('/opportunities', { params: filters });
    return data;
  },

  /**
   * Get active hackathons
   */
  async getActiveHackathons(filters?: Omit<OpportunitiesFilters, 'type'>): Promise<Hackathon[]> {
    const { data } = await apiClient.get('/opportunities/hackathons', { params: filters });
    return data;
  },

  /**
   * Get a single hackathon by ID
   */
  async getHackathon(id: string): Promise<Hackathon> {
    const { data } = await apiClient.get(`/opportunities/hackathons/${id}`);
    return data;
  },

  /**
   * Get open grants
   */
  async getOpenGrants(filters?: Omit<OpportunitiesFilters, 'type'>): Promise<Grant[]> {
    const { data } = await apiClient.get('/opportunities/grants', { params: filters });
    return data;
  },

  /**
   * Get a single grant by ID
   */
  async getGrant(id: string): Promise<Grant> {
    const { data } = await apiClient.get(`/opportunities/grants/${id}`);
    return data;
  },

  /**
   * Get unique ecosystems for filtering
   */
  async getEcosystems(): Promise<string[]> {
    const { data } = await apiClient.get('/opportunities/ecosystems');
    return data;
  },

  /**
   * ADMIN: Create a new hackathon
   */
  async createHackathon(hackathon: {
    name: string;
    ecosystem: string;
    organizer: string;
    prizePool?: number;
    startDate: string;
    endDate: string;
    websiteUrl: string;
  }): Promise<Hackathon> {
    const { data } = await apiClient.post('/opportunities/admin/hackathons', hackathon);
    return data;
  },

  /**
   * ADMIN: Create a new grant
   */
  async createGrant(grant: {
    name: string;
    ecosystem: string;
    provider: string;
    amount?: number;
    websiteUrl: string;
    deadline?: string;
  }): Promise<Grant> {
    const { data } = await apiClient.post('/opportunities/admin/grants', grant);
    return data;
  },
};
