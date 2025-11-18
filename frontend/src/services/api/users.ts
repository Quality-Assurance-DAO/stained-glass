import apiClient from './client';

export interface UserProfile {
  app_id: string;
  contribution_count: number;
  quality_score: number | null;
  created_at: string;
  updated_at: string;
  stats: {
    total_submissions: number;
    average_quality_score: number | null;
  };
}

export interface UserSubmissionsResult {
  data: Array<{
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
    window?: {
      id: string;
      location_description: string | null;
      church: {
        id: string;
        name: string;
        county: string;
        town: string;
      };
    };
    user: {
      app_id: string;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const usersApi = {
  /**
   * Get user profile by app ID
   */
  getUserProfile: async (appId: string): Promise<UserProfile> => {
    const response = await apiClient.get<{ success: true; data: UserProfile }>(
      `/users/${appId}`
    );
    return response.data.data;
  },

  /**
   * Get user submissions
   */
  getUserSubmissions: async (
    appId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<UserSubmissionsResult> => {
    const response = await apiClient.get<{ success: true; data: UserSubmissionsResult }>(
      `/users/${appId}/submissions`,
      {
        params: { page, limit },
      }
    );
    return response.data.data;
  },
};

