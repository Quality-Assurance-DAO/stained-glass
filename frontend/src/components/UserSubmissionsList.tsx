import { useNavigate } from 'react-router-dom';
import { useUserSubmissions } from '../hooks/useUserProfile';
import { getOrCreateAppId } from '../utils/appId';
import { useState, useEffect } from 'react';

interface UserSubmissionsListProps {
  appId: string;
}

export function UserSubmissionsList({ appId }: UserSubmissionsListProps) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 20;

  const {
    data: submissionsData,
    isLoading,
    error,
    isError,
  } = useUserSubmissions(appId, page, limit);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Loading your submissions...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">
          Error loading submissions: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  if (!submissionsData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 text-center">You haven't submitted any photos yet.</p>
      </div>
    );
  }

  const submissions = submissionsData.data || [];
  const pagination = submissionsData.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 };

  if (submissions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 text-center">You haven't submitted any photos yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Submissions</h2>
      
      <div className="space-y-4">
        {submissions.map((submission) => (
          <div
            key={submission.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => {
              if (submission.window?.church?.id) {
                navigate(`/churches/${submission.window.church.id}`);
              }
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {submission.window?.church && (
                    <span className="font-semibold text-gray-900">
                      {submission.window.church.name}
                    </span>
                  )}
                  {submission.window && (
                    <span className="text-sm text-gray-600">
                      • Window: {submission.window.location_description || 'Unassigned'}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  <p>Uploaded: {new Date(submission.timestamp).toLocaleString()}</p>
                  {submission.location_verified && (
                    <p className="text-green-600">✓ Location verified</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/submissions/${submission.id}/edit`);
                  }}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

