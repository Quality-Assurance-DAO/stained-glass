import { useQuery } from '@tanstack/react-query';
import { churchesApi, ChurchSearchParams } from '../services/api/churches';

export const useChurchSearch = (params: ChurchSearchParams) => {
  return useQuery({
    queryKey: ['churches', 'search', params],
    queryFn: () => churchesApi.searchChurches(params),
    enabled: !!(params.county || params.town), // Only run if at least one search param
  });
};

