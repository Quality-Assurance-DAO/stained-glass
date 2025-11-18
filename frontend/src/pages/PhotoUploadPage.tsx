import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChurchDetails } from '../hooks/useChurchDetails';
import { usePhotoUpload } from '../hooks/usePhotoUpload';
import PhotoCapture from '../components/PhotoCapture';
import LocationVerification from '../components/LocationVerification';
import PhotoQualityFeedback from '../components/PhotoQualityFeedback';
import UploadStatus, { UploadStatus as UploadStatusType } from '../components/UploadStatus';
import { QualityAssessment } from '../utils/imageQuality';
import { getOrCreateAppId } from '../utils/appId';
import { AxiosProgressEvent } from 'axios';

export function PhotoUploadPage() {
  const { churchId } = useParams<{ churchId: string }>();
  const navigate = useNavigate();

  const [appId, setAppId] = useState<string | null>(null);
  const [step, setStep] = useState<'capture' | 'location' | 'uploading' | 'complete'>('capture');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [qualityAssessment, setQualityAssessment] = useState<QualityAssessment | null>(null);
  const [userLatitude, setUserLatitude] = useState<number | null>(null);
  const [userLongitude, setUserLongitude] = useState<number | null>(null);
  const [locationVerified, setLocationVerified] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatusType>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | undefined>();

  const {
    data: church,
    isLoading: churchLoading,
    error: churchError,
  } = useChurchDetails(churchId || null);

  const uploadMutation = usePhotoUpload({
    onSuccess: () => {
      setUploadStatus('success');
      setStep('complete');
      setTimeout(() => {
        navigate(`/churches/${churchId}`);
      }, 2000);
    },
    onError: (error) => {
      setUploadStatus('error');
      setUploadError(error.message || 'Upload failed');
    },
  });

  useEffect(() => {
    getOrCreateAppId().then(setAppId);
  }, []);

  const handlePhotoCapture = (file: File, assessment: QualityAssessment) => {
    setPhotoFile(file);
    setQualityAssessment(assessment);
    setStep('location');
  };

  const handleLocationVerified = (lat: number, lon: number, verified: boolean) => {
    setUserLatitude(lat);
    setUserLongitude(lon);
    setLocationVerified(verified);
    setUploadError(undefined); // Clear any previous errors
  };

  const handleUpload = () => {
    if (!photoFile || !churchId || !appId || userLatitude === null || userLongitude === null) {
      setUploadError('Missing required information. Please ensure all fields are filled.');
      return;
    }

    setStep('uploading');
    setUploadStatus('uploading');
    setUploadProgress(0);
    setUploadError(undefined);

    uploadMutation.mutate({
      user_id: appId,
      church_id: churchId,
      photo: photoFile,
      latitude: userLatitude,
      longitude: userLongitude,
      location_verified: locationVerified,
      timestamp: new Date(),
      metadata: {
        quality_score: qualityAssessment?.overallScore,
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      },
    });
  };

  if (churchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">Loading church details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (churchError || !church) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
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
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(`/churches/${churchId}`)}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back to Church
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Photo</h1>
          <p className="text-gray-600">
            {church.name}, {church.town}, {church.county}
          </p>
        </div>

        {step === 'capture' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 1: Capture Photo</h2>
            {uploadError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{uploadError}</p>
              </div>
            )}
            <PhotoCapture
              onPhotoCapture={handlePhotoCapture}
              onError={(error) => {
                setUploadError(error);
                setUploadStatus('error');
              }}
            />
          </div>
        )}

        {step === 'location' && photoFile && qualityAssessment && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Photo Quality</h2>
              <PhotoQualityFeedback assessment={qualityAssessment} />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 2: Verify Location</h2>
              <LocationVerification
                churchLatitude={church.latitude}
                churchLongitude={church.longitude}
                onVerified={handleLocationVerified}
                onError={(error) => {
                  setUploadError(error);
                }}
              />
            </div>

            {userLatitude !== null && userLongitude !== null && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 3: Upload</h2>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>Photo: {photoFile.name}</p>
                    <p>Location: {userLatitude.toFixed(6)}, {userLongitude.toFixed(6)}</p>
                    <p>Verification: {locationVerified ? 'GPS Verified' : 'Manually Verified'}</p>
                    {qualityAssessment && (
                      <p className="mt-2">
                        Quality Score: {Math.round(qualityAssessment.overallScore * 100)}%
                      </p>
                    )}
                  </div>
                  {uploadError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">{uploadError}</p>
                    </div>
                  )}
                  <button
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending || !appId}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {uploadMutation.isPending ? 'Uploading...' : 'Upload Photo'}
                  </button>
                  {!appId && (
                    <p className="text-xs text-gray-500 text-center">
                      Loading app ID...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'uploading' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Uploading...</h2>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{uploadProgress}%</p>
          </div>
        )}

        {step === 'complete' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Complete!</h2>
            <p className="text-gray-600">Your photo has been uploaded successfully.</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting to church page...</p>
          </div>
        )}

        <UploadStatus
          status={uploadStatus}
          progress={uploadProgress}
          error={uploadError}
          onDismiss={() => {
            setUploadStatus('idle');
            setUploadError(undefined);
          }}
        />
      </div>
    </div>
  );
}

