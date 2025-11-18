import { useState, useRef, useCallback } from 'react';
import { assessImageFileQuality, QualityAssessment } from '../utils/imageQuality';

interface PhotoCaptureProps {
  onPhotoCapture: (file: File, assessment: QualityAssessment) => void;
  onError?: (error: string) => void;
}

export default function PhotoCapture({
  onPhotoCapture,
  onError,
}: PhotoCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<QualityAssessment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Prefer back camera on mobile
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCapturing(true);
    } catch (error: any) {
      const errorMessage =
        error.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access.'
          : error.name === 'NotFoundError'
          ? 'No camera found on this device.'
          : 'Failed to access camera.';
      onError?.(errorMessage);
    }
  }, [onError]);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      onError?.('Failed to capture photo');
      return;
    }

    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          onError?.('Failed to create photo');
          return;
        }

        const file = new File([blob], `photo-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });

        try {
          const qualityAssessment = await assessImageFileQuality(file);
          setAssessment(qualityAssessment);
          setPreview(URL.createObjectURL(blob));
          stopCamera();
          setIsCapturing(false);
        } catch (error: any) {
          onError?.(error.message || 'Failed to assess photo quality');
        }
      },
      'image/jpeg',
      0.9
    );
  }, [stopCamera, onError]);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        onError?.('Please select an image file');
        return;
      }

      try {
        const qualityAssessment = await assessImageFileQuality(file);
        setAssessment(qualityAssessment);
        setPreview(URL.createObjectURL(file));
      } catch (error: any) {
        onError?.(error.message || 'Failed to assess photo quality');
      }
    },
    [onError]
  );

  const handleConfirm = useCallback(() => {
    if (!preview || !assessment) return;

    // Get the file from the preview URL or file input
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      // Create file from preview if needed
      fetch(preview)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `photo-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });
          onPhotoCapture(file, assessment);
        })
        .catch(() => onError?.('Failed to process photo'));
      return;
    }

    onPhotoCapture(file, assessment);
  }, [preview, assessment, onPhotoCapture, onError]);

  const handleRetake = useCallback(() => {
    setPreview(null);
    setAssessment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="space-y-4">
      {!preview && !isCapturing && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={startCamera}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Open Camera
          </button>
          <div className="text-center text-gray-500">or</div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Choose from Gallery
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {isCapturing && (
        <div className="space-y-2">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg"
            style={{ maxHeight: '400px', objectFit: 'contain' }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={capturePhoto}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Capture Photo
            </button>
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setIsCapturing(false);
              }}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {preview && (
        <div className="space-y-4">
          <img
            src={preview}
            alt="Preview"
            className="w-full rounded-lg"
            style={{ maxHeight: '400px', objectFit: 'contain' }}
          />
          {assessment && (
            <div className="space-y-2">
              <div className="text-sm font-semibold">Quality Assessment:</div>
              <div className="text-sm text-gray-600">
                Score: {Math.round(assessment.overallScore * 100)}%
              </div>
              {assessment.feedback.length > 0 && (
                <div className="space-y-1">
                  {assessment.feedback.map((msg, idx) => (
                    <div key={idx} className="text-sm text-gray-700">
                      • {msg}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Use This Photo
            </button>
            <button
              type="button"
              onClick={handleRetake}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Retake
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

