import { useEffect } from "react";
import { BookingFormData } from "@/lib/types";
import { ReservationInputVehicleType, useEstimateFare } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Users, Briefcase, CheckCircle2, AlertCircle } from "lucide-react";
import { DateTimePicker } from "./DateTimePicker";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  formData: BookingFormData;
  updateFormData: (data: Partial<BookingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const vehicles = [
  {
    id: ReservationInputVehicleType.sedan,
    name: "Lincoln MKT",
    type: "2019 · Luxury SUV Crossover",
    capacity: 6,
    luggage: 4,
    image: "/mkt.png",
    desc: "Classic black car for executive transfers & corporate travel.",
  },
  {
    id: ReservationInputVehicleType.suv,
    name: "Lincoln Navigator L",
    type: "Extended Wheelbase · Full-Size SUV",
    capacity: 7,
    luggage: 7,
    image: "/suv.png",
    desc: "Extended wheelbase with maximum cargo space for groups & families.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

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
      {/* Vehicle selection */}
      <div className="space-y-3">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Select Vehicle</Label>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {vehicles.map((v) => {
            const isSelected = formData.vehicleType === v.id;
            return (
              <motion.div
                key={v.id}
                variants={cardVariants}
                onClick={() => updateFormData({ vehicleType: v.id })}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={`relative rounded-lg border-2 cursor-pointer overflow-hidden transition-colors duration-200 ${
                  isSelected
                    ? "border-primary shadow-lg shadow-primary/10"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {isSelected && (
                  <motion.div
                    className="absolute top-3 right-3 z-10"
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  >
                    <CheckCircle2 size={20} fill="hsl(0 72% 51%)" className="text-primary-foreground" />
                  </motion.div>
                )}
                <div className="bg-black/60 flex items-center justify-center h-40 p-4 overflow-hidden">
                  <motion.img
                    src={v.image}
                    alt={v.name}
                    className="h-full w-full object-contain drop-shadow-xl"
                    animate={isSelected ? { scale: 1.04 } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className={`p-4 transition-colors duration-200 ${isSelected ? "bg-primary/10" : "bg-muted"}`}>
                  <p className="font-bold text-foreground">{v.name}</p>
                  <p className="text-xs text-muted-foreground mb-3">{v.type} — {v.desc}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users size={12} /> Up to {v.capacity}</span>
                    <span className="flex items-center gap-1"><Briefcase size={12} /> {v.luggage} bags</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Pickup Date & Time */}
      <DateTimePicker
        label="Pickup Date & Time"
        dateValue={formData.pickupDate}
        timeValue={formData.pickupTime}
        onDateChange={(val) => updateFormData({ pickupDate: val })}
        onTimeChange={(val) => updateFormData({ pickupTime: val })}
        minDate={today}
      />

      {/* Return Date & Time (round trip only) */}
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

      {/* Hours (hourly only) */}
      {isHourly && (
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Duration</Label>
          <div className="flex items-center gap-3">
            <motion.button
              type="button"
              onClick={() => updateFormData({ hours: Math.max(3, (formData.hours || 3) - 1) })}
              disabled={(formData.hours || 3) <= 3}
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 rounded border border-border bg-muted hover:bg-accent hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-lg font-bold transition-colors"
            >
              −
            </motion.button>
            <AnimatePresence mode="wait">
              <motion.span
                key={formData.hours || 3}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="text-xl font-bold tabular-nums w-24 text-center"
              >
                {formData.hours || 3} hr{(formData.hours || 3) !== 1 ? "s" : ""}
              </motion.span>
            </AnimatePresence>
            <motion.button
              type="button"
              onClick={() => updateFormData({ hours: Math.min(24, (formData.hours || 3) + 1) })}
              disabled={(formData.hours || 3) >= 24}
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 rounded border border-border bg-muted hover:bg-accent hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-lg font-bold transition-colors"
            >
              +
            </motion.button>
            <span className="text-xs text-muted-foreground">Minimum 3 hours</span>
          </div>
        </div>
      )}

      {/* Fare estimate */}
      <motion.div
        className="flex items-center justify-between bg-muted border border-border rounded-lg px-5 py-4"
        layout
      >
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Estimated Fare</p>
          <p className="text-xs text-muted-foreground mt-0.5">{fareEstimate?.breakdown || "Based on typical distance"}</p>
        </div>
        <div className="text-3xl font-bold text-primary tabular-nums">
          <AnimatePresence mode="wait">
            {estimating ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="animate-pulse text-muted-foreground text-xl"
              >
                ···
              </motion.span>
            ) : fareEstimate ? (
              <motion.span
                key={fareEstimate.estimatedTotal}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                ${fareEstimate.estimatedTotal.toFixed(2)}
              </motion.span>
            ) : (
              <motion.span key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>—</motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Validation warning */}
      <AnimatePresence>
        {!isValid && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-2 overflow-hidden"
          >
            <AlertCircle size={13} className="shrink-0" />
            {!isPickupValid
              ? "Please select a pickup date and time to continue."
              : "Please select a return date and time for your round trip."}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-2 flex justify-between">
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button onClick={onBack} variant="outline" size="lg">Back</Button>
        </motion.div>
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button onClick={onNext} disabled={!isValid} size="lg" className="px-10 font-semibold">Continue</Button>
        </motion.div>
      </div>
    </div>
  );
}
