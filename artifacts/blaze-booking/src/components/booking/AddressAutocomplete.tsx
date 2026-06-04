import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { Search, MapPin } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce"; // Need to create this

interface AddressAutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export function AddressAutocomplete({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Simple debounce inline for now
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length > 2 && debouncedQuery !== value) {
      setIsSearching(true);
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          debouncedQuery + ", Long Island, NY"
        )}&format=json&countrycodes=us&limit=5`
      )
        .then((res) => res.json())
        .then((data) => {
          setResults(data);
          setIsSearching(false);
          setShowResults(true);
        })
        .catch((err) => {
          console.error(err);
          setIsSearching(false);
        });
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [debouncedQuery, value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setQuery(result.display_name);
    onChange(result.display_name);
    setShowResults(false);
  };

  return (
    <div className="space-y-2 relative" ref={wrapperRef}>
      <Label>{label}</Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || "Enter address..."}
          className="pl-9 bg-card"
          disabled={disabled}
          onFocus={() => {
            if (results.length > 0) setShowResults(true);
          }}
        />
        {isSearching && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {results.map((result) => (
            <div
              key={result.place_id}
              className="p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm"
              onClick={() => handleSelect(result)}
            >
              <div className="font-medium line-clamp-1">
                {result.display_name.split(",")[0]}
              </div>
              <div className="text-xs text-muted-foreground line-clamp-1">
                {result.display_name.substring(result.display_name.indexOf(",") + 1).trim()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
