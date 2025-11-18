/**
 * Geolocation service wrapper with permission handling
 */

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export type GeolocationPermissionStatus = 'granted' | 'denied' | 'prompt' | 'unsupported';

/**
 * Check if geolocation is supported
 */
export function isGeolocationSupported(): boolean {
  return 'geolocation' in navigator;
}

/**
 * Get current geolocation permission status
 * Note: This API is only available in secure contexts (HTTPS)
 */
export async function getGeolocationPermissionStatus(): Promise<GeolocationPermissionStatus> {
  if (!isGeolocationSupported()) {
    return 'unsupported';
  }

  // Permission API is not widely supported, so we'll try to get position
  // and handle errors accordingly
  return 'prompt'; // Default to prompt since we can't reliably check
}

/**
 * Request geolocation permission and get current position
 */
export function getCurrentPosition(
  options?: PositionOptions
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser',
      } as GeolocationError);
      return;
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      ...options,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy || 0,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        let message = 'Unknown error occurred';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Geolocation permission denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
        }
        reject({
          code: error.code,
          message,
        } as GeolocationError);
      },
      defaultOptions
    );
  });
}

/**
 * Watch position changes (for continuous tracking)
 */
export function watchPosition(
  callback: (position: GeolocationPosition) => void,
  errorCallback?: (error: GeolocationError) => void,
  options?: PositionOptions
): number {
  if (!isGeolocationSupported()) {
    if (errorCallback) {
      errorCallback({
        code: 0,
        message: 'Geolocation is not supported by this browser',
      });
    }
    return -1;
  }

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 5000,
    ...options,
  };

  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy || 0,
        timestamp: position.timestamp,
      });
    },
    (error) => {
      if (errorCallback) {
        let message = 'Unknown error occurred';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Geolocation permission denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
        }
        errorCallback({
          code: error.code,
          message,
        });
      }
    },
    defaultOptions
  );
}

/**
 * Clear a position watch
 */
export function clearWatch(watchId: number): void {
  if (isGeolocationSupported()) {
    navigator.geolocation.clearWatch(watchId);
  }
}

