import { useState, useEffect } from 'react';
import { getCurrentPosition, GeolocationError } from '../utils/geolocation';

interface LocationVerificationProps {
  churchLatitude: number;
  churchLongitude: number;
  onVerified: (latitude: number, longitude: number, verified: boolean) => void;
  onError?: (error: string) => void;
}

export default function LocationVerification({
  churchLatitude,
  churchLongitude,
  onVerified,
  onError,
}: LocationVerificationProps) {
  const [status, setStatus] = useState<
    'idle' | 'requesting' | 'success' | 'error' | 'manual'
  >('idle');
  const [userLatitude, setUserLatitude] = useState<number | null>(null);
  const [userLongitude, setUserLongitude] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [showManualOverride, setShowManualOverride] = useState(false);
  const [manualConfirm, setManualConfirm] = useState(false);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = async () => {
    setStatus('requesting');
    try {
      const position = await getCurrentPosition();
      setUserLatitude(position.latitude);
      setUserLongitude(position.longitude);

      // Calculate distance using Haversine formula
      const calculatedDistance = calculateDistance(
        position.latitude,
        position.longitude,
        churchLatitude,
        churchLongitude
      );
      setDistance(calculatedDistance);

      // Check if within 50 meters
      if (calculatedDistance <= 50) {
        setStatus('success');
        onVerified(position.latitude, position.longitude, true);
      } else {
        setStatus('error');
      }
    } catch (error: any) {
      setStatus('error');
      if (error.code === 1) {
        // Permission denied
        setShowManualOverride(true);
      } else {
        onError?.(error.message || 'Failed to get location');
        setShowManualOverride(true);
      }
    }
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371000; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const handleManualOverride = () => {
    if (manualConfirm && userLatitude && userLongitude) {
      setStatus('manual');
      onVerified(userLatitude, userLongitude, false);
    }
  };

  if (status === 'idle' || status === 'requesting') {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Requesting location...</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="p-4 bg-green-50 rounded-lg">
        <div className="flex items-center gap-2 text-green-800">
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
          <span className="font-semibold">Location Verified</span>
        </div>
        {distance !== null && (
          <p className="text-sm text-green-700 mt-1">
            You are {Math.round(distance)}m from the church
          </p>
        )}
      </div>
    );
  }

  if (status === 'error' || showManualOverride) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
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
            <span className="font-semibold">Location Verification Failed</span>
          </div>
          {distance !== null && distance > 50 && (
            <p className="text-sm text-yellow-700 mt-1">
              You are {Math.round(distance)}m from the church (maximum 50m allowed)
            </p>
          )}
          {!userLatitude && (
            <p className="text-sm text-yellow-700 mt-1">
              Could not determine your location. You can manually verify that you are at the correct church.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={manualConfirm}
              onChange={(e) => setManualConfirm(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">
              I confirm that I am at the correct church location
            </span>
          </label>

          <button
            type="button"
            onClick={handleManualOverride}
            disabled={!manualConfirm}
            className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Continue with Manual Verification
          </button>

          <button
            type="button"
            onClick={requestLocation}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (status === 'manual') {
    return (
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 text-blue-800">
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
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span className="font-semibold">Manually Verified</span>
        </div>
        <p className="text-sm text-blue-700 mt-1">
          Location verified via manual confirmation
        </p>
      </div>
    );
  }

  return null;
}

