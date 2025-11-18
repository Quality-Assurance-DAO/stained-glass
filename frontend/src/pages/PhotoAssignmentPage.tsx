import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChurchDetails } from '../hooks/useChurchDetails';
import { useWindowsByChurch } from '../hooks/useWindows';
import { usePhotoAssignment } from '../hooks/usePhotoAssignment';
import { FloorPlan } from '../components/FloorPlan';
import { WindowAssignment } from '../components/WindowAssignment';
import { FloorPlanMismatchReport } from '../components/FloorPlanMismatchReport';
import AISuggestions from '../components/AISuggestions';
import AIAnalysisStatus from '../components/AIAnalysisStatus';
import { getPhotoSubmission } from '../services/api/submissions';

export function PhotoAssignmentPage() {
  const { churchId, submissionId } = useParams<{ churchId: string; submissionId: string }>();
  const navigate = useNavigate();
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [loadingSubmission, setLoadingSubmission] = useState(true);

  const {
    data: church,
    isLoading: churchLoading,
    error: churchError,
  } = useChurchDetails(churchId || null);

  const {
    data: windowsData,
    isLoading: windowsLoading,
    error: windowsError,
  } = useWindowsByChurch(churchId || null);

  const assignmentMutation = usePhotoAssignment({
    onSuccess: () => {
      navigate(`/churches/${churchId}`);
    },
    onError: (error) => {
      console.error('Assignment error:', error);
    },
  });

  // Load submission details
  useEffect(() => {
    if (submissionId) {
      getPhotoSubmission(submissionId)
        .then(setSubmission)
        .catch((error) => {
          console.error('Error loading submission:', error);
        })
        .finally(() => {
          setLoadingSubmission(false);
        });
    } else {
      setLoadingSubmission(false);
    }
  }, [submissionId]);

  const handleWindowSelect = (windowId: string) => {
    setSelectedWindowId(windowId);
  };

  const handleAssign = () => {
    if (!submissionId || !selectedWindowId) {
      return;
    }

    assignmentMutation.mutate({
      submissionId,
      windowId: selectedWindowId,
    });
  };

  const handleSkip = () => {
    navigate(`/churches/${churchId}`);
  };

  if (churchLoading || windowsLoading || loadingSubmission) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (churchError || windowsError || !church) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">
              Error loading data: {churchError instanceof Error ? churchError.message : 'Unknown error'}
            </p>
          </div>
          <button
            onClick={() => navigate(`/churches/${churchId}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Church
          </button>
        </div>
      </div>
    );
  }

  const windows = windowsData?.windows || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(`/churches/${churchId}`)}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back to Church
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Assign Photo to Window</h1>
          <p className="text-gray-600">
            {church.name}, {church.town}, {church.county}
          </p>
          {submission && (
            <>
              <p className="text-sm text-gray-500 mt-1">
                Submission ID: {submission.id.slice(0, 8)}...
              </p>
              <div className="mt-4">
                <AIAnalysisStatus submissionId={submission.id} />
              </div>
            </>
          )}
        </div>

        {/* AI Suggestions */}
        {submissionId && churchId && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <AISuggestions
              submissionId={submissionId}
              churchId={churchId}
              onAssignmentComplete={() => {
                navigate(`/churches/${churchId}`);
              }}
            />
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Select Window on Floor Plan
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Click on a window in the floor plan below to assign this photo to it.
          </p>
          
          <FloorPlan
            floorPlanUrl={church.floor_plan_url}
            windows={windows.map((w) => ({
              id: w.id,
              location_description: w.location_description,
              coordinates_on_plan: w.coordinates_on_plan,
              submissionCount: w.submissions?.length || 0,
            }))}
            selectedWindowId={selectedWindowId || undefined}
            onWindowSelect={handleWindowSelect}
            className="mb-6"
          />

          {selectedWindowId && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Selected: {windows.find((w) => w.id === selectedWindowId)?.location_description || 'Window'}
              </p>
            </div>
          )}

          {!church.floor_plan_url && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                No floor plan available. Please use the window list below to assign the photo.
              </p>
            </div>
          )}
        </div>

        {/* Alternative: Window assignment methods */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Window</h2>
          <WindowAssignment
            windows={windows}
            selectedWindowId={selectedWindowId}
            onWindowSelect={handleWindowSelect}
            onTextDescriptionSubmit={(description) => {
              // Find windows matching the description
              const matchingWindow = windows.find(
                (w) =>
                  w.location_description &&
                  w.location_description.toLowerCase().includes(description.toLowerCase())
              );
              if (matchingWindow) {
                setSelectedWindowId(matchingWindow.id);
              } else {
                alert(`No window found matching "${description}". Please select from the list or use manual coordinates.`);
              }
            }}
            onManualCoordinatesSubmit={(coords) => {
              // Find the nearest window to the given coordinates
              // For now, just show a message that this feature needs window coordinate data
              alert('Manual coordinate assignment requires window coordinate data. Please select from the list or use text description.');
            }}
          />
        </div>

        {/* Floor plan mismatch reporting */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <FloorPlanMismatchReport
            churchId={churchId || ''}
            onReportSubmitted={() => {
              // Optionally refresh data or show confirmation
            }}
          />
        </div>

        {/* Action buttons */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex gap-4">
            <button
              onClick={handleAssign}
              disabled={!selectedWindowId || assignmentMutation.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {assignmentMutation.isPending ? 'Assigning...' : 'Assign to Selected Window'}
            </button>
            <button
              onClick={handleSkip}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Skip for Now
            </button>
          </div>
          {!selectedWindowId && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              Please select a window to assign this photo
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

