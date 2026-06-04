import { useState, useRef, useEffect } from "react";
import { Autocomplete } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
import { useGoogleMaps } from "@/hooks/use-google-maps";

interface AddressAutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

function getBounds() {
  if (typeof google === "undefined") return undefined;
  return new google.maps.LatLngBounds(
    { lat: 40.45, lng: -74.35 }, // SW — includes Newark, Staten Island
    { lat: 41.35, lng: -71.85 }  // NE — covers all of Long Island + Westchester + SW CT
  );
}

export function AddressAutocomplete({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: AddressAutocompleteProps) {
  const { isLoaded } = useGoogleMaps();
  const [inputValue, setInputValue] = useState(value);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      const address = place.formatted_address || place.name || "";
      if (address) {
        setInputValue(address);
        onChange(address);
      }
    }
  };

  const inputEl = (
    <div className="relative">
      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
      <Input
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          if (!e.target.value) onChange("");
        }}
        placeholder={placeholder || "Enter address…"}
        className="pl-9 bg-card"
        disabled={disabled}
      />
    </div>
  );

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {!isLoaded || disabled ? (
        inputEl
      ) : (
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}
          options={{
            bounds: getBounds(),
            strictBounds: false,
            componentRestrictions: { country: "us" },
            fields: ["formatted_address", "geometry", "name"],
          }}
        >
          {inputEl}
        </Autocomplete>
      )}
    </div>
  );
}
