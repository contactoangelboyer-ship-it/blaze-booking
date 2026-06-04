import { useEffect } from "react";
import { BookingFormData } from "@/lib/types";
import { ReservationInputVehicleType, useEstimateFare } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Users, Briefcase, CheckCircle2, AlertCircle } from "lucide-react";
import { DateTimePicker } from "./DateTimePicker";

interface Props {
  formData: BookingFormData;
  updateFormData: (data: Partial<BookingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const vehicles = [
  {
    id: ReservationInputVehicleType.sedan,
    name: "Lincoln Continental",
    type: "Luxury Sedan",
    capacity: 3,
    luggage: 3,
    image: "/sedan.png",
    desc: "Executive comfort for airport runs & corporate travel.",
  },
  {
    id: ReservationInputVehicleType.suv,
    name: "Lincoln Navigator",
    type: "Luxury SUV",
    capacity: 6,
    luggage: 6,
    image: "/suv.png",
    desc: "Maximum space for groups, families & extra luggage.",
  },
];

export function Step2Vehicle({ formData, updateFormData, onNext, onBack }: Props) {
  const isHourly = formData.tripType === "hourly";
  const isRoundTrip = formData.tripType === "round_trip";

  const { mutate: estimateFare, data: fareEstimate, isPending: estimating } = useEstimateFare();

  useEffect(() => {
    const timer = setTimeout(() => {
      estimateFare({
        data: {
          vehicleType: formData.vehicleType,
          serviceType: formData.serviceType,
          distanceMiles: 15,
          hours: formData.hours || 3,
        },
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [formData.vehicleType, formData.serviceType, formData.hours, estimateFare]);

  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const returnMinDate = formData.pickupDate
    ? new Date(formData.pickupDate + "T12:00:00")
    : today;

  const isPickupValid = !!formData.pickupDate && !!formData.pickupTime;
  const isReturnValid = !isRoundTrip || (!!formData.returnDate && !!formData.returnTime);
  const isValid = isPickupValid && isReturnValid;

  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Select Vehicle</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((v) => {
            const isSelected = formData.vehicleType === v.id;
            return (
              <div
                key={v.id}
                onClick={() => updateFormData({ vehicleType: v.id })}
                className={`relative rounded-lg border-2 cursor-pointer transition-all overflow-hidden ${
                  isSelected ? "border-primary" : "border-border hover:border-primary/40"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 text-primary z-10">
                    <CheckCircle2 size={20} fill="hsl(0 72% 51%)" className="text-primary-foreground" />
                  </div>
                )}
                <div className="bg-black/60 flex items-center justify-center h-40 p-4">
                  <img src={v.image} alt={v.name} className="h-full w-full object-contain drop-shadow-xl" />
                </div>
                <div className={`p-4 ${isSelected ? "bg-primary/10" : "bg-muted"}`}>
                  <p className="font-bold text-foreground">{v.name}</p>
                  <p className="text-xs text-muted-foreground mb-3">{v.type} — {v.desc}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users size={12} /> Up to {v.capacity}</span>
                    <span className="flex items-center gap-1"><Briefcase size={12} /> {v.luggage} bags</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <DateTimePicker
        label="Pickup Date & Time"
        dateValue={formData.pickupDate}
        timeValue={formData.pickupTime}
        onDateChange={(val) => updateFormData({ pickupDate: val })}
        onTimeChange={(val) => updateFormData({ pickupTime: val })}
        minDate={today}
      />

      {isRoundTrip && (
        <DateTimePicker
          label="Return Date & Time"
          dateValue={formData.returnDate || ""}
          timeValue={formData.returnTime || "12:00"}
          onDateChange={(val) => updateFormData({ returnDate: val })}
          onTimeChange={(val) => updateFormData({ returnTime: val })}
          minDate={returnMinDate}
        />
      )}

      {isHourly && (
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Duration</Label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => updateFormData({ hours: Math.max(3, (formData.hours || 3) - 1) })}
              disabled={(formData.hours || 3) <= 3}
              className="w-9 h-9 rounded border border-border bg-muted hover:bg-accent hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-lg font-bold transition-colors"
            >
              −
            </button>
            <span className="text-xl font-bold tabular-nums w-24 text-center">
              {formData.hours || 3} hr{(formData.hours || 3) !== 1 ? "s" : ""}
            </span>
            <button
              type="button"
              onClick={() => updateFormData({ hours: Math.min(24, (formData.hours || 3) + 1) })}
              disabled={(formData.hours || 3) >= 24}
              className="w-9 h-9 rounded border border-border bg-muted hover:bg-accent hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-lg font-bold transition-colors"
            >
              +
            </button>
            <span className="text-xs text-muted-foreground">Minimum 3 hours</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between bg-muted border border-border rounded-lg px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Estimated Fare</p>
          <p className="text-xs text-muted-foreground mt-0.5">{fareEstimate?.breakdown || "Based on typical distance"}</p>
        </div>
        <div className="text-3xl font-bold text-primary tabular-nums">
          {estimating ? (
            <span className="animate-pulse text-muted-foreground text-xl">···</span>
          ) : fareEstimate ? (
            `$${fareEstimate.estimatedTotal.toFixed(2)}`
          ) : (
            "—"
          )}
        </div>
      </div>

      {!isValid && (
        <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-2">
          <AlertCircle size={13} className="shrink-0" />
          {!isPickupValid
            ? "Please select a pickup date and time to continue."
            : "Please select a return date and time for your round trip."}
        </div>
      )}

      <div className="pt-2 flex justify-between">
        <Button onClick={onBack} variant="outline" size="lg">Back</Button>
        <Button onClick={onNext} disabled={!isValid} size="lg" className="px-10 font-semibold">Continue</Button>
      </div>
    </div>
  );
}
