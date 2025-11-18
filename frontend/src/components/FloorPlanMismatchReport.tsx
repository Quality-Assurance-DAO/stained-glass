import { useState } from 'react';
import apiClient from '../services/api/client';

interface FloorPlanMismatchReportProps {
  churchId: string;
  onReportSubmitted?: () => void;
}

export function FloorPlanMismatchReport({
  churchId,
  onReportSubmitted,
}: FloorPlanMismatchReportProps) {
  const [showReportForm, setShowReportForm] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    affectedWindows: '',
    suggestedFix: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReporting(true);

    try {
      const response = await apiClient.post(`/churches/${churchId}/floor-plan-mismatch`, {
        description: formData.description,
        affected_windows: formData.affectedWindows.split(',').map((id) => id.trim()).filter(Boolean),
        suggested_fix: formData.suggestedFix || undefined,
      });

      // Reset form
      setFormData({
        description: '',
        affectedWindows: '',
        suggestedFix: '',
      });
      setShowReportForm(false);
      
      // Show success message
      alert(response.data.message || 'Report submitted successfully!');
      onReportSubmitted?.();
    } catch (error: any) {
      console.error('Error submitting floor plan mismatch report:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit report. Please try again.';
      alert(errorMessage);
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="border-t pt-4 mt-4">
      <button
        onClick={() => setShowReportForm(!showReportForm)}
        className="w-full text-left p-3 rounded-lg border border-yellow-200 bg-yellow-50 hover:bg-yellow-100 flex items-center justify-between text-sm text-yellow-800"
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          Report Floor Plan Mismatch
        </span>
        <span className="text-yellow-600">{showReportForm ? '−' : '+'}</span>
      </button>

      {showReportForm && (
        <form onSubmit={handleSubmit} className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 mb-4">
            If the floor plan doesn't match the actual church layout, please report it. This helps us improve the accuracy of window assignments.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description of the Mismatch <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., 'Windows are in different positions than shown on the floor plan' or 'The floor plan shows 8 windows but there are actually 10'"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Affected Window IDs (comma-separated, optional)
              </label>
              <input
                type="text"
                value={formData.affectedWindows}
                onChange={(e) => setFormData({ ...formData, affectedWindows: e.target.value })}
                placeholder="e.g., window-id-1, window-id-2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suggested Fix (optional)
              </label>
              <textarea
                value={formData.suggestedFix}
                onChange={(e) => setFormData({ ...formData, suggestedFix: e.target.value })}
                placeholder="e.g., 'Update coordinates for windows 3-5' or 'Add missing windows to the floor plan'"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              disabled={!formData.description.trim() || reporting}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
            >
              {reporting ? 'Submitting...' : 'Submit Report'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowReportForm(false);
                setFormData({
                  description: '',
                  affectedWindows: '',
                  suggestedFix: '',
                });
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

