import { Window } from '../services/api/windows';
import { PhotoGallery } from './PhotoGallery';

interface WindowListProps {
  windows: Window[];
  selectedWindowId?: string | null;
  onWindowClick?: (windowId: string) => void;
  onPhotoClick?: (windowId: string, submissionId: string) => void;
}

export function WindowList({ windows, selectedWindowId, onWindowClick, onPhotoClick }: WindowListProps) {
  if (windows.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No windows documented for this church</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {windows.map((window) => {
        const isSelected = selectedWindowId === window.id;
        return (
        <div
          key={window.id}
          id={`window-${window.id}`}
          className={`border rounded-lg p-6 hover:shadow-md transition-all ${
            isSelected
              ? 'border-blue-600 bg-blue-50 shadow-lg'
              : 'border-gray-200'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {window.location_description || `Window ${window.id.slice(0, 8)}`}
              </h3>
              {window.coordinates_on_plan && (
                <p className="text-sm text-gray-500 mt-1">
                  Coordinates: {JSON.stringify(window.coordinates_on_plan)}
                </p>
              )}
            </div>
            <button
              onClick={() => onWindowClick?.(window.id)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View Details
            </button>
          </div>

          <div className="mt-4">
            <PhotoGallery
              submissions={window.submissions}
              onPhotoClick={(submission) =>
                onPhotoClick?.(window.id, submission.id)
              }
            />
          </div>
        </div>
        );
      })}
    </div>
  );
}

