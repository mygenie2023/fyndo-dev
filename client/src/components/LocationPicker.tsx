import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Navigation } from "lucide-react";
import { reverseGeocode } from "@/lib/geocoding";

interface LocationPickerProps {
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  currentLocation?: { lat: number; lng: number; address: string };
  showCoordinates?: boolean;
}

export default function LocationPicker({
  onLocationSelect,
  currentLocation,
  showCoordinates = false,
}: LocationPickerProps) {
  const [address, setAddress] = useState(currentLocation?.address || "");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(
    currentLocation ? { lat: currentLocation.lat, lng: currentLocation.lng } : null
  );
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    if (currentLocation) {
      setAddress(currentLocation.address || "");
      setCoordinates({ lat: currentLocation.lat, lng: currentLocation.lng });
    }
  }, [currentLocation]);

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          const locationName = await reverseGeocode(lat, lng);
          
          const location = {
            lat,
            lng,
            address: locationName,
          };
          
          setAddress(locationName);
          setCoordinates({ lat, lng });
          
          onLocationSelect?.(location);
          setIsDetecting(false);
        },
        (error) => {
          console.error("Error detecting location:", error);
          setIsDetecting(false);
        }
      );
    } else {
      console.log("Geolocation not supported");
      setIsDetecting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MapPin className="w-5 h-5 text-primary" />
          <span>Your Location</span>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Address</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your location"
              data-testid="input-location"
            />
          </div>
          
          {showCoordinates && coordinates && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Map Coordinates</Label>
              <Input
                value={`${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`}
                readOnly
                className="bg-muted/50 text-muted-foreground"
                data-testid="input-coordinates"
              />
            </div>
          )}
          
          <Button
            onClick={handleDetectLocation}
            variant="outline"
            className="w-full"
            disabled={isDetecting}
            data-testid="button-detect-location"
          >
            <Navigation className="w-4 h-4 mr-2" />
            {isDetecting ? "Detecting..." : "Use Current Location"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          We'll use this location to find nearby associates and jobs within 20km radius.
        </p>
      </CardContent>
    </Card>
  );
}
