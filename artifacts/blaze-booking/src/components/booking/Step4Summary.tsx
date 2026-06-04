import { BookingFormData, AMENITIES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useEstimateFare } from "@workspace/api-client-react";
import { useEffect } from "react";
import { RouteMap } from "./RouteMap";
import { Calendar, Clock, MapPin, Car, User, Phone, Mail, Luggage, Users, Plane, RefreshCw, ArrowRight } from "lucide-react";

interface Props {
  formData: BookingFormData;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <Icon size={15} className="text-primary mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">{label}</p>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}

const SERVICE_LABELS: Record<string, string> = {
  airport_transfer: "Airport Transfer",
  point_to_point: "Point-to-Point",
  hourly: "Hourly / As Directed",
  corporate: "Corporate",
  special_event: "Special Event",
};

const VEHICLE_LABELS: Record<string, string> = {
  sedan: "Lincoln Continental (Luxury Sedan)",
  suv: "Lincoln Navigator (Luxury SUV)",
};

const TRIP_TYPE_LABELS: Record<string, string> = {
  one_way: "One Way",
  round_trip: "Round Trip",
  hourly: "Hourly / As Directed",
};

const TRIP_TYPE_ICONS: Record<string, React.ElementType> = {
  one_way: ArrowRight,
  round_trip: RefreshCw,
  hourly: Clock,
};

function formatDisplayDate(dateStr: string) {
  return dateStr
    ? new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";
}

function formatDisplayTime(timeStr: string) {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${String(m).padStart(2, "0")} ${period}`;
}

export function Step4Summary({ formData, onSubmit, onBack, isSubmitting }: Props) {
  const { mutate: estimateFare, data: fareEstimate } = useEstimateFare();

  useEffect(() => {
    estimateFare({
      data: {
        vehicleType: formData.vehicleType,
        serviceType: formData.serviceType,
        distanceMiles: 15,
        hours: formData.hours || 3,
      },
    });
  }, []);

  const isHourly = formData.tripType === "hourly";
  const isRoundTrip = formData.tripType === "round_trip";
  const dropoff = isHourly ? "As Directed" : formData.dropoffAddress || "—";
  const TripIcon = TRIP_TYPE_ICONS[formData.tripType] || ArrowRight;

  const selectedAmenities = AMENITIES.filter((a) => formData.amenities.includes(a.id));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-0.5">Review Your Reservation</p>
        <p className="text-sm text-muted-foreground">Please confirm all details before submitting.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column */}
        <div className="bg-muted rounded-lg px-5 py-2">
          <DetailRow icon={User} label="Passenger" value={`${formData.firstName} ${formData.lastName}`} />
          <DetailRow icon={Mail} label="Email" value={formData.email} />
          <DetailRow icon={Phone} label="Phone" value={formData.phone} />
          <DetailRow icon={TripIcon} label="Trip Type" value={TRIP_TYPE_LABELS[formData.tripType] || formData.tripType} />
          <DetailRow icon={Car} label="Service / Vehicle" value={`${SERVICE_LABELS[formData.serviceType] || formData.serviceType} — ${VEHICLE_LABELS[formData.vehicleType] || formData.vehicleType}`} />
          <DetailRow icon={Users} label="Passengers" value={`${formData.passengers} passenger${formData.passengers !== 1 ? "s" : ""}`} />
          <DetailRow icon={Luggage} label="Luggage" value={`${formData.luggage ?? 0} bag${(formData.luggage ?? 0) !== 1 ? "s" : ""}`} />
          {formData.flightNumber && (
            <DetailRow icon={Plane} label="Flight" value={formData.flightNumber.toUpperCase()} />
          )}
        </div>

        {/* Right column */}
        <div className="bg-muted rounded-lg px-5 py-2">
          <DetailRow icon={Calendar} label="Pickup Date" value={formatDisplayDate(formData.pickupDate)} />
          <DetailRow icon={Clock} label="Pickup Time" value={formatDisplayTime(formData.pickupTime)} />
          {isRoundTrip && formData.returnDate && (
            <DetailRow icon={Calendar} label="Return Date" value={formatDisplayDate(formData.returnDate)} />
          )}
          {isRoundTrip && formData.returnTime && (
            <DetailRow icon={Clock} label="Return Time" value={formatDisplayTime(formData.returnTime)} />
          )}
          {formData.hours && (
            <DetailRow icon={Clock} label="Duration" value={`${formData.hours} hours`} />
          )}
          <DetailRow icon={MapPin} label="Pickup" value={formData.pickupAddress || "—"} />
          {formData.stops.filter(Boolean).map((stop, i) => (
            <DetailRow key={i} icon={MapPin} label={`Stop ${i + 1}`} value={stop} />
          ))}
          <DetailRow icon={MapPin} label="Dropoff" value={dropoff} />
        </div>
      </div>

      {/* Amenities */}
      {selectedAmenities.length > 0 && (
        <div className="bg-muted rounded-lg px-5 py-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Amenities</p>
          <div className="flex flex-wrap gap-2">
            {selectedAmenities.map((a) => (
              <span
                key={a.id}
                className="inline-flex items-center gap-1.5 bg-background border border-border rounded-full px-3 py-1 text-xs font-medium text-foreground"
              >
                <span>{a.emoji}</span>
                {a.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Map */}
      <div className="rounded-lg overflow-hidden border border-border">
        <RouteMap pickupStr={formData.pickupAddress} dropoffStr={formData.dropoffAddress} />
      </div>

      {/* Special requests */}
      {formData.specialRequests && (
        <div className="bg-muted rounded-lg px-5 py-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Special Requests</p>
          <p className="text-sm text-foreground italic">{formData.specialRequests}</p>
        </div>
      )}

      {/* Fare */}
      <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-lg px-6 py-5">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Estimated Total</p>
          <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">
            {fareEstimate?.breakdown || "Includes base rate & 20% gratuity. Tolls not included."}
          </p>
        </div>
        <p className="text-4xl font-bold text-primary tabular-nums">
          {fareEstimate ? `$${fareEstimate.estimatedTotal.toFixed(2)}` : "—"}
        </p>
      </div>

      <div className="pt-2 flex justify-between">
        <Button onClick={onBack} variant="outline" size="lg" disabled={isSubmitting}>Back</Button>
        <Button onClick={onSubmit} size="lg" className="px-10 font-semibold" disabled={isSubmitting}>
          {isSubmitting ? "Processing…" : "Confirm Reservation"}
        </Button>
      </div>
    </div>
  );
}
