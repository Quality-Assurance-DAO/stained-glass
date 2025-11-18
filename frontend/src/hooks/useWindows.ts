import { useQuery } from '@tanstack/react-query';
import { windowsApi } from '../services/api/windows';

export const useWindowsByChurch = (churchId: string | null) => {
  return useQuery({
    queryKey: ['windows', 'church', churchId],
    queryFn: () => windowsApi.getWindowsByChurchId(churchId!),
    enabled: !!churchId,
  });
};

export const useWindow = (windowId: string | null) => {
  return useQuery({
    queryKey: ['windows', windowId],
    queryFn: () => windowsApi.getWindowById(windowId!),
    enabled: !!windowId,
  });
};



