export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
    );
    
    if (!response.ok) {
      throw new Error("Geocoding failed");
    }
    
    const data = await response.json();
    
    if (data.address) {
      const parts = [];
      
      if (data.address.village || data.address.town || data.address.city || data.address.suburb) {
        parts.push(data.address.village || data.address.town || data.address.city || data.address.suburb);
      }
      
      if (data.address.state_district || data.address.state) {
        parts.push(data.address.state_district || data.address.state);
      }
      
      return parts.length > 0 ? parts.join(", ") : formatCoordinates(latitude, longitude);
    }
    
    return formatCoordinates(latitude, longitude);
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return formatCoordinates(latitude, longitude);
  }
}

export function formatCoordinates(latitude: number, longitude: number): string {
  const latDir = latitude >= 0 ? "N" : "S";
  const lngDir = longitude >= 0 ? "E" : "W";
  
  const latValue = Math.abs(latitude).toFixed(4);
  const lngValue = Math.abs(longitude).toFixed(4);
  
  return `${latValue}°${latDir}, ${lngValue}°${lngDir}`;
}

export function getLocationDisplay(
  location: string | null | undefined,
  latitude: string | number | null | undefined,
  longitude: string | number | null | undefined
): string {
  if (location && location.trim() !== "" && location !== "Unknown" && location !== "Location detected" && location !== "Your location" && location !== "Location on file") {
    return location;
  }
  
  if (latitude != null && longitude != null && latitude !== '' && longitude !== '') {
    const lat = typeof latitude === 'number' ? latitude : parseFloat(latitude);
    const lng = typeof longitude === 'number' ? longitude : parseFloat(longitude);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      return formatCoordinates(lat, lng);
    }
  }
  
  return "Location unavailable";
}
