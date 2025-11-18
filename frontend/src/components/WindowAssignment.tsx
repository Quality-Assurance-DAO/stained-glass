import { useState } from 'react';

interface Window {
  id: string;
  location_description: string | null;
  coordinates_on_plan: any;
}

interface WindowAssignmentProps {
  windows: Window[];
  selectedWindowId: string | null;
  onWindowSelect: (windowId: string) => void;
  onTextDescriptionSubmit?: (description: string) => void;
  onManualCoordinatesSubmit?: (coordinates: { x: number; y: number; width?: number; height?: number }) => void;
}

export function WindowAssignment({
  windows,
  selectedWindowId,
  onWindowSelect,
  onTextDescriptionSubmit,
  onManualCoordinatesSubmit,
}: WindowAssignmentProps) {
  const [showTextDescription, setShowTextDescription] = useState(false);
  const [showManualCoordinates, setShowManualCoordinates] = useState(false);
  const [textDescription, setTextDescription] = useState('');
  const [coordinates, setCoordinates] = useState({
    x: '',
    y: '',
    width: '',
    height: '',
  });

  const handleTextDescriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textDescription.trim() && onTextDescriptionSubmit) {
      onTextDescriptionSubmit(textDescription.trim());
      setTextDescription('');
      setShowTextDescription(false);
    }
  };

  const handleManualCoordinatesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const x = parseFloat(coordinates.x);
    const y = parseFloat(coordinates.y);
    const width = coordinates.width ? parseFloat(coordinates.width) : undefined;
    const height = coordinates.height ? parseFloat(coordinates.height) : undefined;

    if (!isNaN(x) && !isNaN(y) && onManualCoordinatesSubmit) {
      onManualCoordinatesSubmit({ x, y, width, height });
      setCoordinates({ x: '', y: '', width: '', height: '' });
      setShowManualCoordinates(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Window List Selection */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Select from Existing Windows</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {windows.map((window) => (
            <button
              key={window.id}
              onClick={() => onWindowSelect(window.id)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                selectedWindowId === window.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="font-medium text-gray-900">
                {window.location_description || `Window ${window.id.slice(0, 8)}`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Alternative Assignment Methods */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Alternative Assignment Methods</h3>
        <div className="space-y-2">
          {/* Text Description Method */}
          <div>
            <button
              onClick={() => {
                setShowTextDescription(!showTextDescription);
                setShowManualCoordinates(false);
              }}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-between"
            >
              <span className="text-sm text-gray-700">Assign by Text Description</span>
              <span className="text-gray-400">{showTextDescription ? '−' : '+'}</span>
            </button>
            {showTextDescription && (
              <form onSubmit={handleTextDescriptionSubmit} className="mt-2 p-3 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Window Description
                </label>
                <textarea
                  value={textDescription}
                  onChange={(e) => setTextDescription(e.target.value)}
                  placeholder="e.g., 'North wall, second window from left'"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <button
                  type="submit"
                  disabled={!textDescription.trim()}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                >
                  Search Windows
                </button>
              </form>
            )}
          </div>

          {/* Manual Coordinates Method */}
          <div>
            <button
              onClick={() => {
                setShowManualCoordinates(!showManualCoordinates);
                setShowTextDescription(false);
              }}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-between"
            >
              <span className="text-sm text-gray-700">Assign by Manual Coordinates</span>
              <span className="text-gray-400">{showManualCoordinates ? '−' : '+'}</span>
            </button>
            {showManualCoordinates && (
              <form onSubmit={handleManualCoordinatesSubmit} className="mt-2 p-3 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">X Position</label>
                    <input
                      type="number"
                      value={coordinates.x}
                      onChange={(e) => setCoordinates({ ...coordinates, x: e.target.value })}
                      placeholder="X"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Y Position</label>
                    <input
                      type="number"
                      value={coordinates.y}
                      onChange={(e) => setCoordinates({ ...coordinates, y: e.target.value })}
                      placeholder="Y"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Width (optional)</label>
                    <input
                      type="number"
                      value={coordinates.width}
                      onChange={(e) => setCoordinates({ ...coordinates, width: e.target.value })}
                      placeholder="Width"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Height (optional)</label>
                    <input
                      type="number"
                      value={coordinates.height}
                      onChange={(e) => setCoordinates({ ...coordinates, height: e.target.value })}
                      placeholder="Height"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  Coordinates are relative to the floor plan image (0-100 or pixel values)
                </p>
                <button
                  type="submit"
                  disabled={!coordinates.x || !coordinates.y || isNaN(parseFloat(coordinates.x)) || isNaN(parseFloat(coordinates.y))}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                >
                  Find Nearest Window
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

