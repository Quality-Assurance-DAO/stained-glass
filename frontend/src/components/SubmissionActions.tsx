import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePhotoSubmission } from '../services/api/submissions';
import { getOrCreateAppId } from '../utils/appId';
import { useNavigate } from 'react-router-dom';

interface SubmissionActionsProps {
  submissionId: string;
  onEdit?: () => void;
}

export function SubmissionActions({ submissionId, onEdit }: SubmissionActionsProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [appId, setAppId] = useState<string | null>(null);

  useEffect(() => {
    getOrCreateAppId().then(setAppId);
  }, []);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!appId) throw new Error('App ID not available');
      return deletePhotoSubmission(submissionId, appId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'submissions'] });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      setShowDeleteConfirm(false);
      navigate('/profile');
    },
    onError: (error) => {
      console.error('Failed to delete submission:', error);
      alert('Failed to delete submission. Please try again.');
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this submission? This action cannot be undone, but blockchain records will remain.')) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="flex gap-2">
      {onEdit && (
        <button
          onClick={onEdit}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Edit
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={deleteMutation.isPending}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  );
}

