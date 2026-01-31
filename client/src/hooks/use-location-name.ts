import { useEffect, useState } from "react";
import { reverseGeocode, getLocationDisplay } from "@/lib/geocoding";

const locationCache = new Map<string, string>();

export function useLocationName(
  location: string | null | undefined,
  latitude: string | number | null | undefined,
  longitude: string | number | null | undefined
) {
  const [locationName, setLocationName] = useState<string>(() => {
    return getLocationDisplay(location, latitude, longitude);
  });

  useEffect(() => {
    const fetchLocationName = async () => {
      if (latitude == null || longitude == null || latitude === '' || longitude === '') {
        setLocationName(getLocationDisplay(location, latitude, longitude));
        return;
      }

      const lat = typeof latitude === 'number' ? latitude : parseFloat(latitude);
      const lng = typeof longitude === 'number' ? longitude : parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng)) {
        setLocationName(getLocationDisplay(location, latitude, longitude));
        return;
      }

      const cacheKey = `${lat},${lng}`;
      
      if (locationCache.has(cacheKey)) {
        setLocationName(locationCache.get(cacheKey)!);
        return;
      }

      if (location && location.trim() !== "" && 
          location !== "Unknown" && 
          location !== "Location detected" && 
          location !== "Your location" && 
          location !== "Location on file") {
        locationCache.set(cacheKey, location);
        setLocationName(location);
        return;
      }

      try {
        const name = await reverseGeocode(lat, lng);
        locationCache.set(cacheKey, name);
        setLocationName(name);
      } catch (error) {
        console.error("Failed to fetch location name:", error);
        setLocationName(getLocationDisplay(location, latitude, longitude));
      }
    };

    fetchLocationName();
  }, [location, latitude, longitude]);

  return locationName;
}
