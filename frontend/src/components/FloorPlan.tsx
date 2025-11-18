import { useState, useRef, useEffect } from 'react';

interface Window {
  id: string;
  location_description: string | null;
  coordinates_on_plan: { x: number; y: number; width?: number; height?: number } | null;
  submissionCount?: number;
}

interface FloorPlanProps {
  floorPlanUrl: string | null;
  windows: Window[];
  selectedWindowId?: string | null;
  onWindowSelect: (windowId: string) => void;
  className?: string;
}

export function FloorPlan({
  floorPlanUrl,
  windows,
  selectedWindowId,
  onWindowSelect,
  className = '',
}: FloorPlanProps) {
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleImageLoad = () => {
      if (imageRef.current) {
        setImageSize({
          width: imageRef.current.naturalWidth,
          height: imageRef.current.naturalHeight,
        });
      }
    };

    const img = imageRef.current;
    if (img) {
      if (img.complete) {
        handleImageLoad();
      } else {
        img.addEventListener('load', handleImageLoad);
        return () => img.removeEventListener('load', handleImageLoad);
      }
    }
  }, [floorPlanUrl]);

  if (!floorPlanUrl) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 text-center text-gray-500 ${className}`}>
        <p>No floor plan available for this church</p>
      </div>
    );
  }

  const getWindowPosition = (window: Window) => {
    if (!window.coordinates_on_plan || !imageSize || !containerRef.current) {
      return null;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const scaleX = containerRect.width / imageSize.width;
    const scaleY = containerRect.height / imageSize.height;

    const x = window.coordinates_on_plan.x * scaleX;
    const y = window.coordinates_on_plan.y * scaleY;
    const width = (window.coordinates_on_plan.width || 50) * scaleX;
    const height = (window.coordinates_on_plan.height || 50) * scaleY;

    return { x, y, width, height };
  };

  return (
    <div className={`relative bg-gray-50 rounded-lg overflow-hidden ${className}`} ref={containerRef}>
      <img
        ref={imageRef}
        src={floorPlanUrl}
        alt="Church floor plan"
        className="w-full h-auto"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = '<div class="p-8 text-center text-gray-500">Failed to load floor plan image</div>';
          }
        }}
      />
      
      {/* Clickable window areas */}
      {imageSize && windows.map((window) => {
        const position = getWindowPosition(window);
        if (!position) return null;

        const isSelected = selectedWindowId === window.id;
        const hasSubmissions = (window.submissionCount || 0) > 0;

        return (
          <div
            key={window.id}
            className={`absolute border-2 cursor-pointer transition-all ${
              isSelected
                ? 'border-blue-600 bg-blue-100 bg-opacity-50 z-10'
                : hasSubmissions
                ? 'border-green-500 bg-green-100 bg-opacity-30 hover:bg-opacity-50'
                : 'border-gray-400 bg-gray-200 bg-opacity-30 hover:bg-opacity-50'
            }`}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: `${position.width}px`,
              height: `${position.height}px`,
            }}
            onClick={() => onWindowSelect(window.id)}
            title={window.location_description || `Window ${window.id.slice(0, 8)}`}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xs font-semibold px-1 py-0.5 rounded ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : hasSubmissions
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-600 text-white'
              }`}>
                {window.location_description || window.id.slice(0, 6)}
              </span>
            </div>
          </div>
        );
      })}

      {/* Legend */}
      {windows.length > 0 && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-20">
          <h3 className="text-sm font-semibold mb-2">Windows</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 border-2 border-blue-600 bg-blue-100 bg-opacity-50"></div>
              <span className="text-xs">Selected</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 border-2 border-green-500 bg-green-100 bg-opacity-30"></div>
              <span className="text-xs">Has Photos</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 border-2 border-gray-400 bg-gray-200 bg-opacity-30"></div>
              <span className="text-xs">No Photos</span>
            </div>
          </div>
          <ul className="space-y-1 text-sm mt-2 max-h-48 overflow-y-auto">
            {windows.map((window) => (
              <li
                key={window.id}
                className={`cursor-pointer hover:bg-gray-100 p-2 rounded ${
                  selectedWindowId === window.id
                    ? 'bg-blue-50 text-blue-600'
                    : (window.submissionCount || 0) > 0
                    ? 'text-green-600'
                    : 'text-gray-600'
                }`}
                onClick={() => onWindowSelect(window.id)}
              >
                {window.location_description || `Window ${window.id.slice(0, 8)}`}
                {(window.submissionCount || 0) > 0 && (
                  <span className="ml-2 text-xs">
                    ({window.submissionCount} photo{(window.submissionCount || 0) !== 1 ? 's' : ''})
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

