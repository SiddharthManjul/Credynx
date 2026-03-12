import { DeveloperTier, Availability } from './auth';
import { Project } from './project';

export interface Developer {
  user: any;
  id: string;
  userId: string;
  username: string;
  fullName: string;
  contactNumber: string;
  twitter?: string;
  linkedin?: string;
  github: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  availability: Availability;
  tier: DeveloperTier;
  reputationScore: number;
  createdAt: string;
  updatedAt: string;
  projects?: Project[];
  vouchesReceived?: any[];
}

export interface Founder {
  id: string;
  userId: string;
  fullName: string;
  companyName: string;
  companyWebsite?: string;
  position: string;
  bio?: string;
  linkedinUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeveloperProfileDto {
  username: string;
  fullName: string;
  contactNumber: string;
  github: string;
  twitter?: string;
  linkedin?: string;
  bio?: string;
  location?: string;
  availability?: Availability;
}

export interface UpdateDeveloperProfileDto {
  fullName?: string;
  contactNumber?: string;
  twitter?: string;
  linkedin?: string;
  bio?: string;
  location?: string;
  availability?: Availability;
  avatarUrl?: string;
}

export interface CreateFounderProfileDto {
  fullName: string;
  companyName: string;
  position: string;
  companyWebsite?: string;
  bio?: string;
  linkedinUrl?: string;
}

export interface UpdateFounderProfileDto {
  fullName?: string;
  companyName?: string;
  position?: string;
  companyWebsite?: string;
  bio?: string;
  linkedinUrl?: string;
}

export interface DeveloperFilterParams {
  tier?: DeveloperTier;
  availability?: Availability;
  minReputation?: number;
  location?: string;
  search?: string;
  skills?: string[];
  limit?: number;
  skip?: number;
  orderBy?: 'reputation' | 'recent' | 'alphabetical';
}
