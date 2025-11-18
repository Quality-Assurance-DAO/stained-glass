import { useQuery } from '@tanstack/react-query';
import { usersApi, UserProfile, UserSubmissionsResult } from '../services/api/users';

export const useUserProfile = (appId: string | null) => {
  return useQuery<UserProfile>({
    queryKey: ['user', 'profile', appId],
    queryFn: () => usersApi.getUserProfile(appId!),
    enabled: !!appId,
  });
};

export const useUserSubmissions = (
  appId: string | null,
  page: number = 1,
  limit: number = 20
) => {
  return useQuery<UserSubmissionsResult>({
    queryKey: ['user', 'submissions', appId, page, limit],
    queryFn: () => usersApi.getUserSubmissions(appId!, page, limit),
    enabled: !!appId,
  });
};

