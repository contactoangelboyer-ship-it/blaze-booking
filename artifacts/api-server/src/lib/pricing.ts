export interface VehiclePricingData {
  vehicleType: string;
  displayName: string;
  capacity: number;
  airportBaseRate: number;
  perMileRate: number;
  hourlyRate: number;
  hourlyMinimum: number;
  corporateRate: number;
  specialEventRate: number;
}

export const PRICING: VehiclePricingData[] = [
  {
    vehicleType: "sedan",
    displayName: "Lincoln MKT",
    capacity: 3,
    airportBaseRate: 95,
    perMileRate: 3.0,
    hourlyRate: 85,
    hourlyMinimum: 3,
    corporateRate: 85,
    specialEventRate: 95,
  },
  {
    vehicleType: "suv",
    displayName: "Lincoln Navigator",
    capacity: 6,
    airportBaseRate: 120,
    perMileRate: 3.5,
    hourlyRate: 110,
    hourlyMinimum: 3,
    corporateRate: 110,
    specialEventRate: 125,
  },
];

export const GRATUITY_PERCENT = 20;
export const AIRPORT_SURCHARGE = 10; // Toll/surcharge estimate

export function calculateFare(
  vehicleType: string,
  serviceType: string,
  distanceMiles?: number,
  hours?: number
): { baseRate: number; estimatedTotal: number; gratuity: number; breakdown: string } {
  const vehicle = PRICING.find((v) => v.vehicleType === vehicleType);
  if (!vehicle) {
    return { baseRate: 0, estimatedTotal: 0, gratuity: 0, breakdown: "Unknown vehicle" };
  }

  let baseRate = 0;
  let breakdown = "";

  if (serviceType === "airport_transfer") {
    const miles = distanceMiles ?? 25;
    baseRate = vehicle.airportBaseRate + miles * vehicle.perMileRate + AIRPORT_SURCHARGE;
    breakdown = `Base: $${vehicle.airportBaseRate} + ${miles} mi × $${vehicle.perMileRate}/mi + $${AIRPORT_SURCHARGE} surcharge`;
  } else if (serviceType === "point_to_point") {
    const miles = distanceMiles ?? 20;
    const mileRate = miles * vehicle.perMileRate;
    baseRate = Math.max(mileRate, vehicleType === "suv" ? 95 : 75);
    breakdown = `${miles} mi × $${vehicle.perMileRate}/mi (min $${vehicleType === "suv" ? 95 : 75})`;
  } else if (serviceType === "hourly") {
    const h = Math.max(hours ?? vehicle.hourlyMinimum, vehicle.hourlyMinimum);
    baseRate = h * vehicle.hourlyRate;
    breakdown = `${h} hrs × $${vehicle.hourlyRate}/hr (${vehicle.hourlyMinimum} hr min)`;
  } else if (serviceType === "corporate") {
    const h = Math.max(hours ?? vehicle.hourlyMinimum, vehicle.hourlyMinimum);
    baseRate = h * vehicle.corporateRate;
    breakdown = `${h} hrs × $${vehicle.corporateRate}/hr (${vehicle.hourlyMinimum} hr min)`;
  } else if (serviceType === "special_event") {
    const h = Math.max(hours ?? vehicle.hourlyMinimum, vehicle.hourlyMinimum);
    baseRate = h * vehicle.specialEventRate;
    breakdown = `${h} hrs × $${vehicle.specialEventRate}/hr (${vehicle.hourlyMinimum} hr min)`;
  }

  const gratuity = baseRate * (GRATUITY_PERCENT / 100);
  const estimatedTotal = baseRate + gratuity;

  return {
    baseRate: Math.round(baseRate * 100) / 100,
    estimatedTotal: Math.round(estimatedTotal * 100) / 100,
    gratuity: Math.round(gratuity * 100) / 100,
    breakdown: `${breakdown} + ${GRATUITY_PERCENT}% gratuity`,
  };
}
