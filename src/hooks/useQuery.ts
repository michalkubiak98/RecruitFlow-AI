import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateService, specService } from '../services/database';

export function useCandidates() {
  return useQuery({
    queryKey: ['candidates'],
    queryFn: candidateService.getAll
  });
}

export function useSpecs() {
  return useQuery({
    queryKey: ['specs'],
    queryFn: specService.getAll
  });
}

export function useRefreshData() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['candidates'] });
    queryClient.invalidateQueries({ queryKey: ['specs'] });
  };
}
