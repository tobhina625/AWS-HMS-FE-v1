import { ref } from 'vue';

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface LocationVerificationResult {
  isWithinRange: boolean;
  distance: number;
  allowedRadius: number | null;
  message: string;
}

export function useGeolocation() {
  const isSupported = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const position = ref<GeolocationPosition | null>(null);

  if (typeof window !== 'undefined' && 'geolocation' in navigator) {
    isSupported.value = true;
  }

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!isSupported.value) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      isLoading.value = true;
      error.value = null;

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const geoPosition: GeolocationPosition = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          position.value = geoPosition;
          isLoading.value = false;
          resolve(geoPosition);
        },
        (err) => {
          isLoading.value = false;
          let errorMessage = 'Unable to retrieve your location';

          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case err.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
          }

          error.value = errorMessage;
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const earthRadiusMeters = 6371000;
    const dLat = degreesToRadians(lat2 - lat1);
    const dLon = degreesToRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusMeters * c;
  };

  const degreesToRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  const verifyBranchLocation = async (branchLatitude: number, branchLongitude: number, allowedRadius: number): Promise<LocationVerificationResult> => {
    const currentPosition = await getCurrentPosition();
    const distance = calculateDistance(currentPosition.latitude, currentPosition.longitude, branchLatitude, branchLongitude);

    const isWithinRange = distance <= allowedRadius;

    return {
      isWithinRange,
      distance: Math.round(distance),
      allowedRadius,
      message: isWithinRange ? 'Location verified successfully' : `You are ${Math.round(distance - allowedRadius)} meters outside the allowed range`,
    };
  };

  return {
    isSupported,
    isLoading,
    error,
    position,
    getCurrentPosition,
    calculateDistance,
    verifyBranchLocation,
  };
}
