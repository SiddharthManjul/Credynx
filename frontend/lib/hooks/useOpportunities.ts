import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { opportunitiesApi } from '../api/opportunities';
import type { OpportunitiesFilters } from '@/types';
import { toast } from 'sonner';

/**
 * Get all opportunities (hackathons and grants)
 */
export function useOpportunities(filters?: OpportunitiesFilters) {
  return useQuery({
    queryKey: ['opportunities', filters],
    queryFn: () => opportunitiesApi.getAllOpportunities(filters),
  });
}

/**
 * Get active hackathons
 */
export function useHackathons(filters?: Omit<OpportunitiesFilters, 'type'>) {
  return useQuery({
    queryKey: ['hackathons', filters],
    queryFn: () => opportunitiesApi.getActiveHackathons(filters),
  });
}

/**
 * Get a single hackathon by ID
 */
export function useHackathon(id: string | undefined) {
  return useQuery({
    queryKey: ['hackathon', id],
    queryFn: () => opportunitiesApi.getHackathon(id!),
    enabled: !!id,
  });
}

/**
 * Get open grants
 */
export function useGrants(filters?: Omit<OpportunitiesFilters, 'type'>) {
  return useQuery({
    queryKey: ['grants', filters],
    queryFn: () => opportunitiesApi.getOpenGrants(filters),
  });
}

/**
 * Get a single grant by ID
 */
export function useGrant(id: string | undefined) {
  return useQuery({
    queryKey: ['grant', id],
    queryFn: () => opportunitiesApi.getGrant(id!),
    enabled: !!id,
  });
}

/**
 * Get unique ecosystems for filtering
 */
export function useEcosystems() {
  return useQuery({
    queryKey: ['ecosystems'],
    queryFn: () => opportunitiesApi.getEcosystems(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * ADMIN: Create a new hackathon
 */
export function useCreateHackathon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: opportunitiesApi.createHackathon,
    onSuccess: () => {
      toast.success('Hackathon created successfully!');
      queryClient.invalidateQueries({ queryKey: ['hackathons'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['ecosystems'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create hackathon');
    },
  });
}

/**
 * ADMIN: Create a new grant
 */
export function useCreateGrant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: opportunitiesApi.createGrant,
    onSuccess: () => {
      toast.success('Grant created successfully!');
      queryClient.invalidateQueries({ queryKey: ['grants'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['ecosystems'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create grant');
    },
  });
}
