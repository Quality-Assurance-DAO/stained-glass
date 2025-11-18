import logger from '../utils/logger';

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
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
}

export interface LocationVerificationResult {
  isValid: boolean;
  distance: number;
  message: string;
}

export class LocationService {
  private readonly TOLERANCE_RADIUS_METERS = 50;

  /**
   * Verify that user location is within tolerance radius of church coordinates
   */
  verifyLocation(
    userLat: number,
    userLon: number,
    churchLat: number,
    churchLon: number,
    manualOverride: boolean = false
  ): LocationVerificationResult {
    if (manualOverride) {
      logger.info('Location verification bypassed with manual override', {
        userLat,
        userLon,
        churchLat,
        churchLon,
      });
      return {
        isValid: true,
        distance: haversineDistance(userLat, userLon, churchLat, churchLon),
        message: 'Location verified via manual override',
      };
    }

    const distance = haversineDistance(userLat, userLon, churchLat, churchLon);

    if (distance <= this.TOLERANCE_RADIUS_METERS) {
      logger.debug('Location verification passed', {
        distance,
        tolerance: this.TOLERANCE_RADIUS_METERS,
        userLat,
        userLon,
        churchLat,
        churchLon,
      });
      return {
        isValid: true,
        distance,
        message: `Location verified (${Math.round(distance)}m from church)`,
      };
    }

    logger.warn('Location verification failed', {
      distance,
      tolerance: this.TOLERANCE_RADIUS_METERS,
      userLat,
      userLon,
      churchLat,
      churchLon,
    });

    return {
      isValid: false,
      distance,
      message: `Location too far from church (${Math.round(distance)}m away, maximum ${this.TOLERANCE_RADIUS_METERS}m allowed)`,
    };
  }

  /**
   * Check if church has valid coordinates
   */
  hasValidCoordinates(churchLat: number | null, churchLon: number | null): boolean {
    return (
      churchLat !== null &&
      churchLon !== null &&
      !isNaN(Number(churchLat)) &&
      !isNaN(Number(churchLon)) &&
      churchLat >= -90 &&
      churchLat <= 90 &&
      churchLon >= -180 &&
      churchLon <= 180
    );
  }
}

export default new LocationService();

