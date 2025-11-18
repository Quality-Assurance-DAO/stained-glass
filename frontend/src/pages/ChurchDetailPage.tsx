import { useParams, useNavigate } from 'react-router-dom';
import { useChurchDetails } from '../hooks/useChurchDetails';
import { useWindowsByChurch } from '../hooks/useWindows';
import { FloorPlanViewer } from '../components/FloorPlanViewer';
import { WindowList } from '../components/WindowList';

export function ChurchDetailPage() {
  const { churchId } = useParams<{ churchId: string }>();
  const navigate = useNavigate();

  const {
    data: church,
    isLoading: churchLoading,
    error: churchError,
    isError: churchIsError,
  } = useChurchDetails(churchId || null);

  const {
    data: windowsData,
    isLoading: windowsLoading,
    error: windowsError,
    isError: windowsIsError,
  } = useWindowsByChurch(churchId || null);

  if (churchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">Loading church details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (churchIsError || !church) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">
              Error loading church: {churchError instanceof Error ? churchError.message : 'Church not found'}
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back to Search
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{church.name}</h1>
          <p className="text-lg text-gray-600">
            {church.town}, {church.county}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Coordinates: {church.latitude.toFixed(6)}, {church.longitude.toFixed(6)}
          </p>
        </div>

        {church.floor_plan_url && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Floor Plan</h2>
            <FloorPlanViewer
              floorPlanUrl={church.floor_plan_url}
              windows={church.windows}
              onWindowClick={(windowId) => {
                // Scroll to window in list or navigate to window detail
                const element = document.getElementById(`window-${windowId}`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Windows</h2>

          {windowsLoading && (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading windows...</p>
            </div>
          )}

          {windowsIsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800">
                Error loading windows: {windowsError instanceof Error ? windowsError.message : 'Unknown error'}
              </p>
            </div>
          )}

          {windowsData && (
            <WindowList
              windows={windowsData.windows}
              onWindowClick={(windowId) => {
                // Could navigate to window detail page in future
                console.log('Window clicked:', windowId);
              }}
              onPhotoClick={(windowId, submissionId) => {
                // Could navigate to photo detail page in future
                console.log('Photo clicked:', windowId, submissionId);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

