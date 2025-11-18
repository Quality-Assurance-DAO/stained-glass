import { useEffect, useState } from 'react';

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface UploadStatusProps {
  status: UploadStatus;
  progress?: number;
  error?: string;
  onDismiss?: () => void;
}

export default function UploadStatus({
  status,
  progress,
  error,
  onDismiss,
}: UploadStatusProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      const timer = setTimeout(() => {
        setShow(false);
        onDismiss?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status, onDismiss]);

  if (!show) return null;

  if (status === 'idle') return null;

  if (status === 'uploading') {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <div className="flex-1">
            <div className="font-semibold">Uploading photo...</div>
            {progress !== undefined && (
              <div className="mt-1">
                <div className="w-full bg-blue-700 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="text-xs mt-1">{progress}%</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
        <div className="flex items-center gap-3">
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <div className="font-semibold">Upload successful!</div>
            <div className="text-sm">Your photo has been uploaded.</div>
          </div>
          <button
            onClick={() => {
              setShow(false);
              onDismiss?.();
            }}
            className="text-white hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
        <div className="flex items-center gap-3">
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
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <div className="font-semibold">Upload failed</div>
            <div className="text-sm">{error || 'An error occurred during upload'}</div>
          </div>
          <button
            onClick={() => {
              setShow(false);
              onDismiss?.();
            }}
            className="text-white hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return null;
}

