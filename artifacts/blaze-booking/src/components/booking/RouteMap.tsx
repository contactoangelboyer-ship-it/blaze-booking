import { useState, useEffect, useRef } from "react";
import { GoogleMap, DirectionsRenderer, Marker } from "@react-google-maps/api";
import { useGoogleMaps } from "@/hooks/use-google-maps";
import { MapPin, Clock, Route } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MapProps {
  pickupStr?: string;
  dropoffStr?: string;
  height?: string;
}

const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0d0d0d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0d0d0d" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#111" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1b1b1b" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#1e1e1e" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#282828" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#353535" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#3d3d3d" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#050505" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] },
];

const DEFAULT_CENTER = { lat: 40.7891, lng: -73.135 };

interface RouteInfo {
  distance: string;
  duration: string;
}

export function RouteMap({ pickupStr, dropoffStr, height = "h-72" }: MapProps) {
  const { isLoaded } = useGoogleMaps();
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [pickupPos, setPickupPos] = useState<google.maps.LatLngLiteral | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(9);
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    const hasDropoff = dropoffStr && dropoffStr !== "As Directed" && dropoffStr.trim();

    if (pickupStr && hasDropoff) {
      setPickupPos(null);
      const service = new google.maps.DirectionsService();
      service.route(
        {
          origin: pickupStr,
          destination: dropoffStr!,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirections(result);
            const leg = result.routes[0]?.legs[0];
            if (leg) {
              setRouteInfo({
                distance: leg.distance?.text ?? "",
                duration: leg.duration?.text ?? "",
              });
            }
          } else {
            setDirections(null);
            setRouteInfo(null);
          }
        }
      );
    } else if (pickupStr) {
      setDirections(null);
      setRouteInfo(null);
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: pickupStr }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const loc = results[0].geometry.location;
          const pos = { lat: loc.lat(), lng: loc.lng() };
          setPickupPos(pos);
          setCenter(pos);
          setZoom(13);
        }
      });
    } else {
      setDirections(null);
      setPickupPos(null);
      setRouteInfo(null);
      setCenter(DEFAULT_CENTER);
      setZoom(9);
    }
  }, [isLoaded, pickupStr, dropoffStr]);

  if (!isLoaded) {
    return (
      <div className={`${height} w-full rounded-lg overflow-hidden border border-border bg-[#0d0d0d] flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <MapPin size={20} className="animate-pulse text-primary" />
          <span className="text-xs">Loading map…</span>
        </div>
      </div>
    );
  }

  const pinIcon: google.maps.Symbol = {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 9,
    fillColor: "#e63946",
    fillOpacity: 1,
    strokeColor: "#fff",
    strokeWeight: 2,
  };

  return (
    <div className={`${height} w-full rounded-lg overflow-hidden border border-border relative`}>
      <GoogleMap
        mapContainerStyle={{ height: "100%", width: "100%" }}
        center={center}
        zoom={zoom}
        options={{
          styles: DARK_MAP_STYLE,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "cooperative",
          clickableIcons: false,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM,
          },
        }}
        onLoad={(map) => { mapRef.current = map; }}
      >
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: "#e63946",
                strokeWeight: 4,
                strokeOpacity: 0.9,
              },
              markerOptions: {
                icon: pinIcon,
              },
            }}
          />
        )}
        {pickupPos && !directions && (
          <Marker position={pickupPos} icon={pinIcon} title="Pickup" />
        )}
      </GoogleMap>

      {/* Route info overlay */}
      <AnimatePresence>
        {routeInfo && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-3 left-3 z-10 flex items-center gap-3 bg-black/80 backdrop-blur-sm border border-white/10 rounded-md px-3 py-2"
          >
            <div className="flex items-center gap-1.5 text-xs text-white/90">
              <Route size={12} className="text-primary shrink-0" />
              <span className="font-semibold">{routeInfo.distance}</span>
            </div>
            <div className="w-px h-3 bg-white/20" />
            <div className="flex items-center gap-1.5 text-xs text-white/70">
              <Clock size={12} className="shrink-0" />
              <span>{routeInfo.duration}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
