import { useMutation } from '@tanstack/react-query';
import {
  createPhotoSubmission,
  CreatePhotoSubmissionParams,
  CreatePhotoSubmissionResponse,
} from '../services/api/submissions';
import { AxiosProgressEvent } from 'axios';

export interface UsePhotoUploadOptions {
  onSuccess?: (data: CreatePhotoSubmissionResponse) => void;
  onError?: (error: Error) => void;
}

export function usePhotoUpload(options?: UsePhotoUploadOptions) {
  return useMutation({
    mutationFn: async (
      params: CreatePhotoSubmissionParams & {
        onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
      }
    ) => {
      const { onUploadProgress, ...submissionParams } = params;
      return createPhotoSubmission(submissionParams, onUploadProgress);
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

