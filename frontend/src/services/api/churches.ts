import apiClient from './client';

export interface Church {
  id: string;
  name: string;
  county: string;
  town: string;
  latitude: number;
  longitude: number;
  floor_plan_url: string | null;
}

export interface ChurchSearchParams {
  county?: string;
  town?: string;
  page?: number;
  limit?: number;
}

export interface ChurchSearchResult {
  churches: Church[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ChurchDetails extends Church {
  windows: Array<{
    id: string;
    location_description: string | null;
    coordinates_on_plan: any;
    submissionCount: number;
  }>;
}

export const churchesApi = {
  /**
   * Search churches by county and/or town
   */
  searchChurches: async (params: ChurchSearchParams): Promise<ChurchSearchResult> => {
    const response = await apiClient.get<ChurchSearchResult>('/churches/search', {
      params,
    });
    return response.data;
  },

  /**
   * Get church details by ID
   */
  getChurchById: async (churchId: string): Promise<ChurchDetails> => {
    const response = await apiClient.get<ChurchDetails>(`/churches/${churchId}`);
    return response.data;
  },
};

