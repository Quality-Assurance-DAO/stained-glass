import { QualityAssessment } from '../utils/imageQuality';

interface PhotoQualityFeedbackProps {
  assessment: QualityAssessment;
}

export default function PhotoQualityFeedback({
  assessment,
}: PhotoQualityFeedbackProps) {
  const getScoreColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 0.7) return 'bg-green-100';
    if (score >= 0.4) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Overall Quality</span>
        <div
          className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreBgColor(
            assessment.overallScore
          )} ${getScoreColor(assessment.overallScore)}`}
        >
          {Math.round(assessment.overallScore * 100)}%
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Brightness</span>
          <span className={assessment.isTooDark || assessment.isTooBright ? 'text-red-600' : 'text-green-600'}>
            {assessment.isTooDark
              ? 'Too Dark'
              : assessment.isTooBright
              ? 'Too Bright'
              : 'Good'}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span>Sharpness</span>
          <span className={assessment.isBlurry ? 'text-red-600' : 'text-green-600'}>
            {assessment.isBlurry ? 'Blurry' : 'Sharp'}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span>Framing</span>
          <span className={assessment.isWellFramed ? 'text-green-600' : 'text-yellow-600'}>
            {assessment.isWellFramed ? 'Good' : 'Could Improve'}
          </span>
        </div>
      </div>

      {assessment.feedback.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-semibold text-blue-900 mb-2">
            Feedback:
          </div>
          <ul className="space-y-1 text-sm text-blue-800">
            {assessment.feedback.map((msg, idx) => (
              <li key={idx}>• {msg}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

