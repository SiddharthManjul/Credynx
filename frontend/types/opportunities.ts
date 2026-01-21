export enum HackathonStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
}

export enum GrantStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export interface Hackathon {
  id: string;
  name: string;
  ecosystem: string;
  organizer: string;
  prizePool: number | null;
  startDate: string;
  endDate: string;
  websiteUrl: string;
  status: HackathonStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Grant {
  id: string;
  name: string;
  ecosystem: string;
  provider: string;
  amount: number | null;
  websiteUrl: string;
  deadline: string | null;
  status: GrantStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OpportunitiesResponse {
  hackathons: Hackathon[];
  grants: Grant[];
  total: number;
}

export interface OpportunitiesFilters {
  ecosystem?: string;
  type?: 'hackathon' | 'grant' | 'all';
  skip?: number;
  take?: number;
}
