import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { githubApi } from '@/lib/api';
import { toast } from 'sonner';

export function useGitHubProfile(username: string) {
  return useQuery({
    queryKey: ['github', 'profile', username],
    queryFn: () => githubApi.getProfile(username),
    enabled: !!username,
  });
}

export function useGitHubStats(username: string) {
  return useQuery({
    queryKey: ['github', 'stats', username],
    queryFn: () => githubApi.getStats(username),
    enabled: !!username,
    staleTime: 0, // Always treat as stale
    gcTime: 0, // Don't cache
  });
}

export function useSyncGitHub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => githubApi.syncMyData(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['github'] });
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['reputation', 'me'] });
      toast.success('GitHub data synced successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to sync GitHub data');
    },
  });
}

export function useValidateRepository(url: string) {
  return useQuery({
    queryKey: ['github', 'validate', url],
    queryFn: () => githubApi.validateRepository(url),
    enabled: !!url && url.includes('github.com'),
    retry: false,
  });
}
