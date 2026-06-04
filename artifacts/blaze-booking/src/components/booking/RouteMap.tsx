import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Fix leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapProps {
  pickupStr?: string;
  dropoffStr?: string;
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Simple geocoding for the map
import { useState } from "react";

export function RouteMap({ pickupStr, dropoffStr }: MapProps) {
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (pickupStr) {
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(pickupStr)}&format=json&limit=1`)
        .then(r => r.json())
        .then(d => { if (d[0]) setPickupCoords([parseFloat(d[0].lat), parseFloat(d[0].lon)]) });
    }
  }, [pickupStr]);

  useEffect(() => {
    if (dropoffStr && dropoffStr !== "As Directed") {
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(dropoffStr)}&format=json&limit=1`)
        .then(r => r.json())
        .then(d => { if (d[0]) setDropoffCoords([parseFloat(d[0].lat), parseFloat(d[0].lon)]) });
    } else {
      setDropoffCoords(null);
    }
  }, [dropoffStr]);

  const defaultCenter: [number, number] = [40.7891, -73.1350]; // Long Island
  let center = defaultCenter;
  let zoom = 9;

  if (pickupCoords && dropoffCoords) {
    center = [(pickupCoords[0] + dropoffCoords[0]) / 2, (pickupCoords[1] + dropoffCoords[1]) / 2];
    zoom = 10;
  } else if (pickupCoords) {
    center = pickupCoords;
    zoom = 12;
  }

  return (
    <div className="h-64 w-full rounded-md overflow-hidden border border-border z-0">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} zoom={zoom} />
        {pickupCoords && (
          <Marker position={pickupCoords}>
            <Popup>Pickup</Popup>
          </Marker>
        )}
        {dropoffCoords && (
          <Marker position={dropoffCoords}>
            <Popup>Dropoff</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
