import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useGetReservation, getGetReservationQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, MapPin, Car, User, Phone, Luggage, Users, Clock, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <Icon size={15} className="text-primary mt-0.5 shrink-0" />
      <div>
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

export default function Confirmation() {
  const { id } = useParams();
  const { data: reservation, isLoading } = useGetReservation(Number(id), {
    query: { enabled: !!id, queryKey: getGetReservationQueryKey(Number(id)) },
  });

  useEffect(() => {
    document.title = "Booking Confirmed — Blaze Car Services";
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 max-w-3xl mx-auto px-4 py-16 w-full">
        <Skeleton className="h-96 w-full rounded-lg bg-card border border-border" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="flex-1 max-w-3xl mx-auto px-4 py-16 text-center w-full">
        <h2 className="text-xl font-bold text-destructive">Reservation Not Found</h2>
        <p className="text-muted-foreground mt-2 mb-6 text-sm">We couldn't locate this reservation.</p>
        <Link href="/">
          <Button variant="outline">Return to Booking</Button>
        </Link>
      </div>
    );
  }

  const formattedDate = reservation.pickupDate
    ? new Date(reservation.pickupDate + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const dropoff =
    reservation.serviceType === "hourly" ? "As Directed" : reservation.dropoffAddress || "—";

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-10 md:py-16">
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-xl">
        {/* Success header */}
        <div className="bg-primary px-8 py-8 text-center">
          <div className="flex justify-center mb-3">
            <CheckCircle2 size={44} className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground">Reservation Confirmed</h1>
          <p className="text-primary-foreground/80 text-sm mt-1">
            A confirmation email has been sent to{" "}
            <span className="font-semibold text-primary-foreground">{reservation.email}</span>
          </p>
          <div className="mt-5 inline-block bg-black/20 px-5 py-2 rounded">
            <p className="text-[10px] uppercase tracking-widest text-primary-foreground/70 font-semibold">Confirmation #</p>
            <p className="text-xl font-mono font-bold text-primary-foreground">
              #{reservation.id.toString().padStart(6, "0")}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted rounded-lg px-5 py-2">
              <Row icon={User} label="Passenger" value={`${reservation.firstName} ${reservation.lastName}`} />
              <Row icon={Phone} label="Phone" value={reservation.phone} />
              <Row icon={Car} label="Service" value={SERVICE_LABELS[reservation.serviceType] || reservation.serviceType} />
              <Row icon={Car} label="Vehicle" value={VEHICLE_LABELS[reservation.vehicleType] || reservation.vehicleType} />
              <Row icon={Users} label="Passengers" value={`${reservation.passengers}`} />
              <Row icon={Luggage} label="Luggage" value={`${reservation.luggage ?? 0} bags`} />
            </div>

            <div className="bg-muted rounded-lg px-5 py-2">
              <Row icon={Calendar} label="Date" value={formattedDate} />
              <Row icon={Clock} label="Pickup Time" value={reservation.pickupTime || "—"} />
              {reservation.hours && (
                <Row icon={Clock} label="Duration" value={`${reservation.hours} hours`} />
              )}
              <Row icon={MapPin} label="Pickup" value={reservation.pickupAddress || "—"} />
              <Row icon={MapPin} label="Dropoff" value={dropoff} />
              {reservation.flightNumber && (
                <Row icon={Car} label="Flight" value={reservation.flightNumber.toUpperCase()} />
              )}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-lg px-6 py-5">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Estimated Total</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Includes base rate & 20% gratuity. Tolls not included.
              </p>
            </div>
            <p className="text-4xl font-bold text-primary tabular-nums">
              ${Number(reservation.estimatedFare).toFixed(2)}
            </p>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground mb-4">
              Questions? Call us at{" "}
              <a href="tel:631-374-6154" className="text-primary hover:underline">631-374-6154</a>
            </p>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                Book Another Ride <ChevronRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
