import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { UserSubmissionsList } from '../components/UserSubmissionsList';
import { getOrCreateAppId } from '../utils/appId';

export function UserProfilePage() {
  const navigate = useNavigate();
  const [appId, setAppId] = useState<string | null>(null);
  const [appIdError, setAppIdError] = useState<string | null>(null);

  useEffect(() => {
    getOrCreateAppId()
      .then((id) => {
        setAppId(id);
      })
      .catch((error) => {
        console.error('Failed to get app ID:', error);
        setAppIdError(error.message || 'Failed to get app ID');
      });
  }, []);

  const {
    data: profile,
    isLoading,
    error,
    isError,
  } = useUserProfile(appId);

  if (appIdError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">
              Error: {appIdError}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!appId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">Loading app ID...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">
              Error loading profile: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
            {error && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm">Error details</summary>
                <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(error, null, 2)}</pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              ← Back to Search
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">App ID</label>
              <p className="text-gray-900 font-mono text-sm">{profile.app_id}</p>
              <p className="text-xs text-gray-500 mt-1">
                This is your anonymous identifier. It's stored locally and never shared.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700">Total Contributions</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {profile.stats.total_submissions}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700">Average Quality Score</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {profile.stats.average_quality_score !== null
                    ? profile.stats.average_quality_score.toFixed(1)
                    : 'N/A'}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700">Member Since</div>
                <div className="text-sm text-gray-900 mt-1">
                  {new Date(profile.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <UserSubmissionsList appId={appId} />
      </div>
    </div>
  );
}

