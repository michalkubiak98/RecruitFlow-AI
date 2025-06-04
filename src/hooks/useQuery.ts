import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tauriCandidateService } from '../services/database/tauri-commands';

export function useCandidates() {
  return useQuery({
    queryKey: ['candidates'],
    queryFn: tauriCandidateService.getAll,
    refetchOnWindowFocus: false,
  });
}

export function useRefreshData() {
  const queryClient = useQueryClient();
  
  return () => {
    console.log('🔄 Refreshing candidate data...');
    queryClient.invalidateQueries({ queryKey: ['candidates'] });
  };
}
