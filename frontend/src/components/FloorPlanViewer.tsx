interface FloorPlanViewerProps {
  floorPlanUrl: string | null;
  windows?: Array<{
    id: string;
    location_description: string | null;
    coordinates_on_plan: any;
    submissionCount: number;
  }>;
  onWindowClick?: (windowId: string) => void;
}

export function FloorPlanViewer({
  floorPlanUrl,
  windows = [],
  onWindowClick,
}: FloorPlanViewerProps) {
  if (!floorPlanUrl) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
        <p>No floor plan available for this church</p>
      </div>
    );
  }

  return (
    <div className="relative bg-gray-50 rounded-lg overflow-hidden">
      <img
        src={floorPlanUrl}
        alt="Church floor plan"
        className="w-full h-auto"
        onError={(e) => {
          // Fallback if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = '<div class="p-8 text-center text-gray-500">Failed to load floor plan image</div>';
          }
        }}
      />
      {windows.length > 0 && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <h3 className="text-sm font-semibold mb-2">Windows</h3>
          <ul className="space-y-1 text-sm">
            {windows.map((window) => (
              <li
                key={window.id}
                className={`cursor-pointer hover:bg-gray-100 p-2 rounded ${
                  window.submissionCount > 0 ? 'text-green-600' : 'text-gray-600'
                }`}
                onClick={() => onWindowClick?.(window.id)}
              >
                {window.location_description || `Window ${window.id.slice(0, 8)}`}
                {window.submissionCount > 0 && (
                  <span className="ml-2 text-xs">
                    ({window.submissionCount} photo{window.submissionCount !== 1 ? 's' : ''})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

