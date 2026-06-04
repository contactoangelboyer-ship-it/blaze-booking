import { BookingFormData, TripType, AMENITIES } from "@/lib/types";
import { ReservationInputServiceType } from "@workspace/api-client-react";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { RouteMap } from "./RouteMap";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Plane, MapPin, Clock, Briefcase, GlassWater,
  Users, Luggage, Plus, X, ArrowRight, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
};

function CounterInput({
  label, icon: Icon, value, min, max, onChange,
}: {
  label: string; icon: React.ElementType; value: number; min: number; max: number;
  onChange: (val: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
        <Icon size={13} />{label}
      </Label>
      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          whileTap={{ scale: 0.88 }}
          className="w-8 h-8 rounded border border-border bg-muted hover:bg-accent hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-lg font-bold text-foreground transition-colors"
        >−</motion.button>
        <AnimatePresence mode="wait">
          <motion.span
            key={value}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.12 }}
            className="w-8 text-center font-semibold text-lg"
          >{value}</motion.span>
        </AnimatePresence>
        <motion.button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          whileTap={{ scale: 0.88 }}
          className="w-8 h-8 rounded border border-border bg-muted hover:bg-accent hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-lg font-bold text-foreground transition-colors"
        >+</motion.button>
      </div>
    </div>
  );
}

export function Step1Service({ formData, updateFormData, onNext }: Props) {
  const isHourly = formData.tripType === "hourly";
  const isAirport = formData.serviceType === ReservationInputServiceType.airport_transfer;
  const isValid = formData.pickupAddress && (isHourly || formData.dropoffAddress);
  const showMap = !!formData.pickupAddress;

  const addStop = () => updateFormData({ stops: [...formData.stops, ""] });
  const updateStop = (i: number, v: string) => {
    const u = [...formData.stops]; u[i] = v; updateFormData({ stops: u });
  };
  const removeStop = (i: number) => updateFormData({ stops: formData.stops.filter((_, j) => j !== i) });
  const toggleAmenity = (id: string) => {
    const cur = formData.amenities;
    updateFormData({ amenities: cur.includes(id) ? cur.filter(a => a !== id) : [...cur, id] });
  };

  return (
    <div className="space-y-7">
      {/* Trip Type */}
      <div className="space-y-3">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Trip Type</Label>
        <motion.div className="grid grid-cols-3 gap-2" variants={stagger} initial="hidden" animate="visible">
          {tripTypes.map((t) => {
            const Icon = t.icon;
            const isSelected = formData.tripType === t.id;
            return (
              <motion.button
                key={t.id}
                variants={fadeUp}
                type="button"
                onClick={() => updateFormData({
                  tripType: t.id,
                  serviceType: t.id === "hourly"
                    ? ReservationInputServiceType.hourly
                    : formData.serviceType === ReservationInputServiceType.hourly
                    ? ReservationInputServiceType.airport_transfer
                    : formData.serviceType,
                })}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={cn(
                  "p-3.5 rounded-lg border-2 flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-muted border-border hover:border-primary/50 hover:bg-accent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon size={18} />
                <span className="text-sm font-semibold">{t.label}</span>
                <span className={cn("text-[10px]", isSelected ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  {t.desc}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Service Type */}
      <AnimatePresence>
        {!isHourly && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden space-y-3"
          >
            <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Service Type</Label>
            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-2" variants={stagger} initial="hidden" animate="visible">
              {serviceTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.serviceType === type.id;
                return (
                  <motion.button
                    key={type.id}
                    variants={fadeUp}
                    type="button"
                    onClick={() => updateFormData({ serviceType: type.id })}
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className={cn(
                      "p-3 rounded border flex flex-col items-center justify-center gap-2 text-center cursor-pointer",
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "bg-muted border-border hover:border-primary/40 hover:bg-accent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon size={17} />
                    <span className="text-[11px] font-medium leading-tight">{type.label}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Addresses */}
      <div className="space-y-3">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Trip Details</Label>
        <div className="space-y-3">
          <AddressAutocomplete
            label="Pickup Location"
            value={formData.pickupAddress}
            onChange={(val) => updateFormData({ pickupAddress: val })}
            placeholder="Address, airport, or landmark"
          />
          {formData.stops.map((stop, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="relative"
            >
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
            </motion.div>
          ))}
          {!isHourly && (
            <motion.button
              type="button"
              onClick={addStop}
              whileHover={{ x: 2 }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-medium py-1"
            >
              <Plus size={13} />Add a stop
            </motion.button>
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

      {/* Live Route Map */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin size={12} className="text-primary" />
                <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Route Preview</Label>
              </div>
              <RouteMap
                pickupStr={formData.pickupAddress}
                dropoffStr={isHourly ? undefined : formData.dropoffAddress}
                height="h-64"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flight Number */}
      <AnimatePresence>
        {isAirport && !isHourly && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden space-y-3"
          >
            <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Flight Details</Label>
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Passengers & Luggage */}
      <div className="space-y-3">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Passengers & Luggage</Label>
        <div className="flex flex-wrap gap-8">
          <CounterInput label="Passengers" icon={Users} value={formData.passengers} min={1} max={6}
            onChange={(val) => updateFormData({ passengers: val })} />
          <CounterInput label="Luggage" icon={Luggage} value={formData.luggage ?? 0} min={0} max={10}
            onChange={(val) => updateFormData({ luggage: val })} />
          {isHourly && (
            <CounterInput label="Hours (min. 3)" icon={Clock} value={formData.hours || 3} min={3} max={24}
              onChange={(val) => updateFormData({ hours: val })} />
          )}
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-3">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
          Amenities <span className="normal-case font-normal text-muted-foreground">(optional)</span>
        </Label>
        <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-2" variants={stagger} initial="hidden" animate="visible">
          {AMENITIES.map((a) => {
            const isSelected = formData.amenities.includes(a.id);
            return (
              <motion.button
                key={a.id}
                variants={fadeUp}
                type="button"
                onClick={() => toggleAmenity(a.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={cn(
                  "p-2.5 rounded border flex items-center gap-2 text-left cursor-pointer",
                  isSelected
                    ? "bg-primary/10 border-primary/60 text-foreground"
                    : "bg-muted border-border hover:border-primary/30 hover:bg-accent text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="text-base">{a.emoji}</span>
                <span className="text-[11px] font-medium leading-tight">{a.label}</span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      <div className="pt-2 flex justify-end">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Button onClick={onNext} disabled={!isValid} size="lg" className="px-10 font-semibold">
            Continue
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
