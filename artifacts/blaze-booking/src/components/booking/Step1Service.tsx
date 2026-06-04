import { useState } from "react";
import { BookingFormData, TripType, AMENITIES } from "@/lib/types";
import { ReservationInputServiceType } from "@workspace/api-client-react";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Plane,
  MapPin,
  Clock,
  Briefcase,
  GlassWater,
  Users,
  Luggage,
  Plus,
  X,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  formData: BookingFormData;
  updateFormData: (data: Partial<BookingFormData>) => void;
  onNext: () => void;
}

const tripTypes: { id: TripType; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "one_way", label: "One Way", icon: ArrowRight, desc: "Single trip" },
  { id: "round_trip", label: "Round Trip", icon: RefreshCw, desc: "With return" },
  { id: "hourly", label: "Hourly", icon: Clock, desc: "As directed" },
];

const serviceTypes = [
  { id: ReservationInputServiceType.airport_transfer, label: "Airport Transfer", icon: Plane },
  { id: ReservationInputServiceType.point_to_point, label: "Point-to-Point", icon: MapPin },
  { id: ReservationInputServiceType.corporate, label: "Corporate", icon: Briefcase },
  { id: ReservationInputServiceType.special_event, label: "Special Event", icon: GlassWater },
];

function CounterInput({
  label,
  icon: Icon,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  icon: React.ElementType;
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
        <Icon size={13} />
        {label}
      </Label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded border border-border bg-muted hover:bg-accent hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-lg font-bold text-foreground transition-colors"
        >
          −
        </button>
        <span className="w-8 text-center font-semibold text-lg">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-8 h-8 rounded border border-border bg-muted hover:bg-accent hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-lg font-bold text-foreground transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function Step1Service({ formData, updateFormData, onNext }: Props) {
  const isHourly = formData.tripType === "hourly";
  const isAirport = formData.serviceType === ReservationInputServiceType.airport_transfer;

  const isValid =
    formData.pickupAddress && (isHourly || formData.dropoffAddress);

  const addStop = () => {
    updateFormData({ stops: [...formData.stops, ""] });
  };

  const updateStop = (index: number, value: string) => {
    const updated = [...formData.stops];
    updated[index] = value;
    updateFormData({ stops: updated });
  };

  const removeStop = (index: number) => {
    updateFormData({ stops: formData.stops.filter((_, i) => i !== index) });
  };

  const toggleAmenity = (id: string) => {
    const current = formData.amenities;
    if (current.includes(id)) {
      updateFormData({ amenities: current.filter((a) => a !== id) });
    } else {
      updateFormData({ amenities: [...current, id] });
    }
  };

  return (
    <div className="space-y-7">
      {/* Trip Type */}
      <div className="space-y-3">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
          Trip Type
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {tripTypes.map((t) => {
            const Icon = t.icon;
            const isSelected = formData.tripType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  updateFormData({
                    tripType: t.id,
                    serviceType:
                      t.id === "hourly"
                        ? ReservationInputServiceType.hourly
                        : formData.serviceType === ReservationInputServiceType.hourly
                        ? ReservationInputServiceType.airport_transfer
                        : formData.serviceType,
                  });
                }}
                className={cn(
                  "p-3.5 rounded-lg border-2 flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground shadow-sm"
                    : "bg-muted border-border hover:border-primary/50 hover:bg-accent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon size={18} />
                <span className="text-sm font-semibold">{t.label}</span>
                <span className={cn("text-[10px]", isSelected ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  {t.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Service Type (hidden for hourly) */}
      {!isHourly && (
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Service Type
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {serviceTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = formData.serviceType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => updateFormData({ serviceType: type.id })}
                  className={cn(
                    "p-3 rounded border flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer",
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground shadow-sm"
                      : "bg-muted border-border hover:border-primary/40 hover:bg-accent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon size={17} />
                  <span className="text-[11px] font-medium leading-tight">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Addresses */}
      <div className="space-y-3">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
          Trip Details
        </Label>
        <div className="space-y-3">
          <AddressAutocomplete
            label="Pickup Location"
            value={formData.pickupAddress}
            onChange={(val) => updateFormData({ pickupAddress: val })}
            placeholder="Address, airport, or landmark"
          />

          {/* Intermediate stops */}
          {formData.stops.map((stop, i) => (
            <div key={i} className="relative">
              <AddressAutocomplete
                label={`Stop ${i + 1}`}
                value={stop}
                onChange={(val) => updateStop(i, val)}
                placeholder="Intermediate stop address"
              />
              <button
                type="button"
                onClick={() => removeStop(i)}
                className="absolute right-2 top-7 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          ))}

          {/* Add Stop button */}
          {!isHourly && (
            <button
              type="button"
              onClick={addStop}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-medium py-1"
            >
              <Plus size={13} />
              Add a stop
            </button>
          )}

          <AddressAutocomplete
            label="Dropoff Location"
            value={isHourly ? "As Directed" : formData.dropoffAddress}
            onChange={(val) => updateFormData({ dropoffAddress: val })}
            placeholder="Address, airport, or landmark"
            disabled={isHourly}
          />
        </div>
      </div>

      {/* Flight Number (Airport Transfer only) */}
      {isAirport && !isHourly && (
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Flight Details
          </Label>
          <div className="max-w-xs space-y-1.5">
            <Label className="text-xs text-muted-foreground">Flight Number (optional)</Label>
            <div className="relative">
              <Plane size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="e.g. DL 1234"
                value={formData.flightNumber || ""}
                onChange={(e) => updateFormData({ flightNumber: e.target.value.toUpperCase() })}
                className="bg-muted border-border uppercase pl-8"
              />
            </div>
          </div>
        </div>
      )}

      {/* Passengers & Luggage */}
      <div className="space-y-3">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
          Passengers & Luggage
        </Label>
        <div className="flex flex-wrap gap-8">
          <CounterInput
            label="Passengers"
            icon={Users}
            value={formData.passengers}
            min={1}
            max={6}
            onChange={(val) => updateFormData({ passengers: val })}
          />
          <CounterInput
            label="Luggage"
            icon={Luggage}
            value={formData.luggage ?? 0}
            min={0}
            max={10}
            onChange={(val) => updateFormData({ luggage: val })}
          />
          {isHourly && (
            <CounterInput
              label="Hours (min. 3)"
              icon={Clock}
              value={formData.hours || 3}
              min={3}
              max={24}
              onChange={(val) => updateFormData({ hours: val })}
            />
          )}
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-3">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
          Amenities <span className="normal-case font-normal text-muted-foreground">(optional)</span>
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {AMENITIES.map((a) => {
            const isSelected = formData.amenities.includes(a.id);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => toggleAmenity(a.id)}
                className={cn(
                  "p-2.5 rounded border flex items-center gap-2 text-left transition-all cursor-pointer",
                  isSelected
                    ? "bg-primary/10 border-primary/60 text-foreground"
                    : "bg-muted border-border hover:border-primary/30 hover:bg-accent text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="text-base">{a.emoji}</span>
                <span className="text-[11px] font-medium leading-tight">{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <Button onClick={onNext} disabled={!isValid} size="lg" className="px-10 font-semibold">
          Continue
        </Button>
      </div>
    </div>
  );
}
