import { useQuery } from '@tanstack/react-query';
import { getAIAnalysis, AIAnalysisResult } from '../services/api/submissions';

interface AIAnalysisStatusProps {
  submissionId: string;
  className?: string;
}

export default function AIAnalysisStatus({
  submissionId,
  className = '',
}: AIAnalysisStatusProps) {
  const { data, isLoading, error } = useQuery<AIAnalysisResult>({
    queryKey: ['ai-analysis', submissionId],
    queryFn: async () => {
      const response = await getAIAnalysis(submissionId);
      return response.data;
    },
    refetchInterval: (query) => {
      // Poll every 2 seconds if status is pending
      const data = query.state.data;
      return data?.status === 'pending' ? 2000 : false;
    },
  });

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Loading AI analysis...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-sm text-red-600 ${className}`}>
        Failed to load AI analysis
      </div>
    );
  }

  if (!data) {
    return null;
  }

  if (data.status === 'pending') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">AI analysis in progress...</span>
      </div>
    );
  }

  if (data.status === 'failed') {
    return (
      <div className={`text-sm text-yellow-600 ${className}`}>
        <span className="font-medium">AI analysis failed:</span> {data.error || 'Unknown error'}
      </div>
    );
  }

  if (data.status === 'completed') {
    return (
      <div className={`space-y-2 ${className}`}>
        {/* Classification Status */}
        <div className="flex items-center gap-2">
          {data.classification?.isStainedGlassWindow ? (
            <span className="text-green-600 text-sm font-medium">✓ Stained Glass Window</span>
          ) : (
            <span className="text-red-600 text-sm font-medium">✗ Not a Stained Glass Window</span>
          )}
          {data.classification?.confidence && (
            <span className="text-xs text-gray-500">
              ({Math.round(data.classification.confidence * 100)}% confidence)
            </span>
          )}
        </div>

        {/* Quality Score */}
        {data.quality && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Quality Score:</span>
            <div className="flex items-center gap-1">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    data.quality.score >= 70
                      ? 'bg-green-500'
                      : data.quality.score >= 50
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${data.quality.score}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{data.quality.score}/100</span>
            </div>
          </div>
        )}

        {/* Quality Issues */}
        {data.quality?.issues && data.quality.issues.length > 0 && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Issues:</span>{' '}
            {data.quality.issues.join(', ')}
          </div>
        )}

        {/* Filter Status */}
        {data.shouldFilter && (
          <div className="text-sm text-red-600 font-medium">
            ⚠ Flagged for review: {data.filterReason}
          </div>
        )}

        {/* Reasoning */}
        {data.classification?.reasoning && (
          <div className="text-xs text-gray-500 italic">
            {data.classification.reasoning}
          </div>
        )}
      </div>
    );
  }

  return null;
}



