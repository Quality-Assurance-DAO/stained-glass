import { useQuery } from '@tanstack/react-query';
import { churchesApi } from '../services/api/churches';

export const useChurchDetails = (churchId: string | null) => {
  return useQuery({
    queryKey: ['churches', churchId],
    queryFn: () => churchesApi.getChurchById(churchId!),
    enabled: !!churchId,
  });
};



