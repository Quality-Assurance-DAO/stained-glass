import { Window } from '../services/api/windows';
import { PhotoGallery } from './PhotoGallery';

interface WindowDetailProps {
  window: Window;
  churchName: string;
  onClose: () => void;
  onPhotoClick?: (windowId: string, submissionId: string) => void;
}

export function WindowDetail({
  window,
  churchName,
  onClose,
  onPhotoClick,
}: WindowDetailProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {window.location_description || `Window ${window.id.slice(0, 8)}`}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{churchName}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Window Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Window Information</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Window ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{window.id}</dd>
              </div>
              {window.coordinates_on_plan && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Coordinates on Plan</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {typeof window.coordinates_on_plan === 'object' ? (
                      <span>
                        X: {window.coordinates_on_plan.x}, Y: {window.coordinates_on_plan.y}
                        {window.coordinates_on_plan.width && (
                          <span>
                            {' '}
                            ({window.coordinates_on_plan.width} × {window.coordinates_on_plan.height})
                          </span>
                        )}
                      </span>
                    ) : (
                      JSON.stringify(window.coordinates_on_plan)
                    )}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Photo Submissions</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {window.submissions.length} photo{window.submissions.length !== 1 ? 's' : ''}
                </dd>
              </div>
            </dl>
          </div>

          {/* Photo Gallery */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Photos</h3>
            {window.submissions.length > 0 ? (
              <PhotoGallery
                submissions={window.submissions}
                onPhotoClick={(submission) =>
                  onPhotoClick?.(window.id, submission.id)
                }
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No photos have been submitted for this window yet.</p>
                <p className="text-sm mt-2">Be the first to upload a photo!</p>
              </div>
            )}
          </div>

          {/* Submission Details */}
          {window.submissions.length > 0 && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Details</h3>
              <div className="space-y-4">
                {window.submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onPhotoClick?.(window.id, submission.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Submission {submission.id.slice(0, 8)}...
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(submission.timestamp).toLocaleString()}
                        </p>
                        {submission.metadata?.description && (
                          <p className="text-sm text-gray-600 mt-2">
                            {submission.metadata.description}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 flex flex-col items-end gap-2">
                        {submission.arweave_tx_id && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Arweave
                          </span>
                        )}
                        {submission.cardano_tx_id && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ✓ Cardano
                          </span>
                        )}
                        {submission.metadata?.quality_score && (
                          <span className="text-xs text-gray-500">
                            Quality: {Math.round(submission.metadata.quality_score * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

