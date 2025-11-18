import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPhotoSubmission, updatePhotoSubmission, PhotoSubmission } from '../services/api/submissions';
import { useWindowsByChurch } from '../hooks/useWindows';
import { getOrCreateAppId } from '../utils/appId';

export function EditSubmissionPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [appId, setAppId] = useState<string | null>(null);
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Record<string, any>>({});

  useEffect(() => {
    getOrCreateAppId().then(setAppId);
  }, []);

  const {
    data: submission,
    isLoading: submissionLoading,
    error: submissionError,
  } = useQuery<PhotoSubmission>({
    queryKey: ['submission', submissionId],
    queryFn: () => getPhotoSubmission(submissionId!),
    enabled: !!submissionId,
  });

  const churchId = submission?.window?.church?.id || null;

  const {
    data: windowsData,
    isLoading: windowsLoading,
  } = useWindowsByChurch(churchId);

  useEffect(() => {
    if (submission) {
      setSelectedWindowId(submission.window_id || null);
      setMetadata((submission.metadata as Record<string, any>) || {});
    }
  }, [submission]);

  const updateMutation = useMutation({
    mutationFn: async (updates: { window_id?: string | null; metadata?: Record<string, any> }) => {
      if (!appId) throw new Error('App ID not available');
      return updatePhotoSubmission(submissionId!, updates, appId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submission', submissionId] });
      queryClient.invalidateQueries({ queryKey: ['user', 'submissions'] });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      navigate(`/churches/${churchId}`);
    },
    onError: (error: any) => {
      console.error('Failed to update submission:', error);
      alert(error.response?.data?.message || 'Failed to update submission. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates: { window_id?: string | null; metadata?: Record<string, any> } = {};
    
    if (selectedWindowId !== submission?.window_id) {
      updates.window_id = selectedWindowId || null;
    }
    
    if (JSON.stringify(metadata) !== JSON.stringify(submission?.metadata || {})) {
      updates.metadata = metadata;
    }

    if (Object.keys(updates).length === 0) {
      alert('No changes to save');
      return;
    }

    updateMutation.mutate(updates);
  };

  if (submissionLoading || !submission) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">Loading submission...</p>
          </div>
        </div>
      </div>
    );
  }

  if (submissionError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">
              Error loading submission: {submissionError instanceof Error ? submissionError.message : 'Unknown error'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!churchId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              Unable to determine the church for this submission. Please assign it to a window first.
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Submission</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Window Assignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Window Assignment
              </label>
              {windowsLoading ? (
                <p className="text-gray-600">Loading windows...</p>
              ) : (
                <select
                  value={selectedWindowId || ''}
                  onChange={(e) => setSelectedWindowId(e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Unassigned</option>
                  {windowsData?.map((window) => (
                    <option key={window.id} value={window.id}>
                      {window.location_description || `Window ${window.id.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Metadata (Notes) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={metadata.notes || ''}
                onChange={(e) => setMetadata({ ...metadata, notes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any notes about this submission..."
              />
            </div>

            {/* Immutable Fields Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> The following fields cannot be edited: image, location, timestamp, and blockchain references.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/churches/${churchId}`)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

