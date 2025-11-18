import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignPhotoToWindow } from '../services/api/submissions';

export interface UsePhotoAssignmentOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface AssignPhotoParams {
  submissionId: string;
  windowId: string;
}

export function usePhotoAssignment(options?: UsePhotoAssignmentOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AssignPhotoParams) => {
      return assignPhotoToWindow(params.submissionId, params.windowId);
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['windows'] });
      queryClient.invalidateQueries({ queryKey: ['churches'] });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

