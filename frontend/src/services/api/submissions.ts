import apiClient from './client';
import { AxiosProgressEvent } from 'axios';

export interface PhotoSubmission {
  id: string;
  window_id: string | null;
  user_id: string;
  arweave_tx_id: string | null;
  cardano_tx_id: string | null;
  image_hash: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  location_verified: boolean;
  ai_classification: any;
  metadata: any;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePhotoSubmissionParams {
  user_id: string;
  church_id: string;
  photo: File;
  latitude: number;
  longitude: number;
  location_verified: boolean;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export interface CreatePhotoSubmissionResponse {
  success: boolean;
  data: PhotoSubmission;
}

/**
 * Upload a photo submission
 */
export async function createPhotoSubmission(
  params: CreatePhotoSubmissionParams,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<CreatePhotoSubmissionResponse> {
  const formData = new FormData();
  formData.append('photo', params.photo);
  formData.append('user_id', params.user_id);
  formData.append('church_id', params.church_id);
  formData.append('latitude', params.latitude.toString());
  formData.append('longitude', params.longitude.toString());
  formData.append('location_verified', params.location_verified.toString());
  
  if (params.timestamp) {
    formData.append('timestamp', params.timestamp.toISOString());
  }
  
  if (params.metadata) {
    formData.append('metadata', JSON.stringify(params.metadata));
  }

  const response = await apiClient.post<CreatePhotoSubmissionResponse>(
    '/submissions',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    }
  );

  return response.data;
}

/**
 * Get a photo submission by ID
 */
export async function getPhotoSubmission(
  submissionId: string
): Promise<PhotoSubmission> {
  const response = await apiClient.get<{ success: boolean; data: PhotoSubmission }>(
    `/submissions/${submissionId}`
  );
  return response.data.data;
}

/**
 * Assign a photo submission to a window
 */
export async function assignPhotoToWindow(
  submissionId: string,
  windowId: string
): Promise<{ success: boolean; data: PhotoSubmission }> {
  const response = await apiClient.post<{ success: boolean; data: PhotoSubmission }>(
    `/submissions/${submissionId}/assign`,
    { window_id: windowId }
  );
  return response.data;
}

