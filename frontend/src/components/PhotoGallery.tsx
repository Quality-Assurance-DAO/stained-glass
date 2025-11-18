import { WindowSubmission } from '../services/api/windows';
import { selectPrimaryPhoto } from '../utils/photoSelection';

interface PhotoGalleryProps {
  submissions: WindowSubmission[];
  onPhotoClick?: (submission: WindowSubmission) => void;
}

export function PhotoGallery({ submissions, onPhotoClick }: PhotoGalleryProps) {
  const primaryPhoto = selectPrimaryPhoto(submissions);

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No photos available for this window</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {primaryPhoto && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Primary Photo</h3>
          <div
            className="bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => onPhotoClick?.(primaryPhoto)}
          >
            <div className="aspect-video flex items-center justify-center p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Photo ID: {primaryPhoto.id.slice(0, 8)}...</p>
                <p className="text-xs text-gray-500">
                  {new Date(primaryPhoto.timestamp).toLocaleDateString()}
                </p>
                {primaryPhoto.arweave_tx_id && (
                  <p className="text-xs text-green-600 mt-1">✓ Uploaded to Arweave</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {submissions.length > 1 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            All Photos ({submissions.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className={`bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity ${
                  primaryPhoto?.id === submission.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => onPhotoClick?.(submission)}
              >
                <div className="aspect-square flex items-center justify-center p-2">
                  <div className="text-center">
                    <p className="text-xs text-gray-600">
                      {new Date(submission.timestamp).toLocaleDateString()}
                    </p>
                    {submission.arweave_tx_id && (
                      <p className="text-xs text-green-600 mt-1">✓</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}



