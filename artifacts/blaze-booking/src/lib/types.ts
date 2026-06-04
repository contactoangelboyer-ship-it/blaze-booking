import { ReservationInputServiceType, ReservationInputVehicleType } from "@workspace/api-client-react";

export type TripType = "one_way" | "round_trip" | "hourly";

export const AMENITIES = [
  { id: "water", label: "Bottled Water", emoji: "💧" },
  { id: "wifi", label: "Wi-Fi Hotspot", emoji: "📶" },
  { id: "charger", label: "Phone Charger", emoji: "🔌" },
  { id: "meet_greet", label: "Meet & Greet", emoji: "🪧" },
  { id: "car_seat", label: "Child Seat", emoji: "👶" },
  { id: "umbrella", label: "Umbrella Service", emoji: "☂️" },
];

export interface BookingFormData {
  tripType: TripType;
  serviceType: ReservationInputServiceType;
  pickupAddress: string;
  dropoffAddress: string;
  stops: string[];
  passengers: number;
  luggage: number;
  amenities: string[];

  vehicleType: ReservationInputVehicleType;
  pickupDate: string;
  pickupTime: string;
  returnDate?: string;
  returnTime?: string;
  hours?: number;
  flightNumber?: string;

  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

export const defaultFormData: BookingFormData = {
  tripType: "one_way",
  serviceType: ReservationInputServiceType.airport_transfer,
  pickupAddress: "",
  dropoffAddress: "",
  stops: [],
  passengers: 1,
  luggage: 0,
  amenities: [],
  vehicleType: ReservationInputVehicleType.sedan,
  pickupDate: new Date().toISOString().split("T")[0],
  pickupTime: "12:00",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};
