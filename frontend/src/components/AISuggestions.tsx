import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAISuggestion, assignPhotoToWindow } from '../services/api/submissions';
import { useWindowsByChurch } from '../hooks/useWindows';

interface AISuggestionsProps {
  submissionId: string;
  churchId: string;
  onAssignmentComplete?: () => void;
  className?: string;
}

export default function AISuggestions({
  submissionId,
  churchId,
  onAssignmentComplete,
  className = '',
}: AISuggestionsProps) {
  const queryClient = useQueryClient();
  const { data: windowsData } = useWindowsByChurch(churchId);
  const windows = windowsData?.windows || [];

  const { data: suggestion, isLoading } = useQuery({
    queryKey: ['ai-suggestion', submissionId],
    queryFn: async () => {
      const response = await getAISuggestion(submissionId);
      return response.data;
    },
    enabled: !!submissionId,
  });

  const assignMutation = useMutation({
    mutationFn: (windowId: string) => assignPhotoToWindow(submissionId, windowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['windows', churchId] });
      onAssignmentComplete?.();
    },
  });

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Loading AI suggestions...</span>
      </div>
    );
  }

  if (!suggestion) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        No AI suggestion available. Please assign manually.
      </div>
    );
  }

  const suggestedWindow = windows?.find((w) => w.id === suggestion.windowId);
  const confidencePercent = Math.round(suggestion.confidence * 100);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              AI Suggestion
            </h3>
            {suggestedWindow ? (
              <div className="text-sm text-blue-800">
                <p className="font-medium">
                  Suggested Window: {suggestedWindow.location_description || 'Window ' + suggestedWindow.id.slice(0, 8)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Confidence: {confidencePercent}%
                </p>
                {suggestion.reasoning && (
                  <p className="text-xs text-blue-600 mt-1 italic">
                    {suggestion.reasoning}
                  </p>
                )}
                {suggestion.locationDescription && (
                  <p className="text-xs text-blue-600 mt-1">
                    Location: {suggestion.locationDescription}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-sm text-blue-800">
                <p>Window ID: {suggestion.windowId}</p>
                <p className="text-xs text-blue-600 mt-1">
                  Confidence: {confidencePercent}%
                </p>
              </div>
            )}
          </div>
        </div>

        {suggestedWindow && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => {
                if (suggestedWindow) {
                  assignMutation.mutate(suggestedWindow.id);
                }
              }}
              disabled={assignMutation.isPending}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {assignMutation.isPending ? 'Assigning...' : 'Accept Suggestion'}
            </button>
            <button
              onClick={() => {
                // Could trigger manual assignment UI
                onAssignmentComplete?.();
              }}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
            >
              Assign Manually
            </button>
          </div>
        )}

        {confidencePercent < 80 && (
          <div className="mt-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2">
            ⚠ Low confidence suggestion. Consider reviewing manually.
          </div>
        )}
      </div>
    </div>
  );
}

