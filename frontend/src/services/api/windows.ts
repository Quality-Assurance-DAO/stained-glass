import apiClient from './client';

export interface WindowSubmission {
  id: string;
  image_hash: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  location_verified: boolean;
  arweave_tx_id: string | null;
  cardano_tx_id: string | null;
  metadata: any;
}

export interface Window {
  id: string;
  church_id: string;
  location_description: string | null;
  coordinates_on_plan: any;
  submissions: WindowSubmission[];
}

export interface WindowsResponse {
  windows: Window[];
}

export const windowsApi = {
  /**
   * Get all windows for a church with their photo submissions
   */
  getWindowsByChurchId: async (churchId: string): Promise<WindowsResponse> => {
    const response = await apiClient.get<WindowsResponse>(
      `/churches/${churchId}/windows`
    );
    return response.data;
  },

  /**
   * Get a single window by ID
   */
  getWindowById: async (windowId: string): Promise<Window> => {
    const response = await apiClient.get<Window>(`/windows/${windowId}`);
    return response.data;
  },
};

