import { BookingFormData } from "@/lib/types";
import { ReservationInputVehicleType } from "@workspace/api-client-react";
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
                <div
                  className="relative flex items-center justify-center overflow-hidden"
                  style={{
                    height: "200px",
                    background: "linear-gradient(160deg, #1a1a1a 0%, #0d0d0d 50%, #1c1c1c 100%)",
                  }}
                >
                  <motion.img
                    src={v.image}
                    alt={v.name}
                    className="w-full object-contain drop-shadow-2xl"
                    style={{ height: "176px", padding: "12px 16px" }}
                    animate={isSelected ? { scale: 1.06, filter: "drop-shadow(0 8px 24px rgba(220,38,38,0.25))" } : { scale: 1, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.8))" }}
                    transition={{ duration: 0.35 }}
                  />
                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 rounded-t-lg pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ boxShadow: "inset 0 0 40px rgba(220,38,38,0.12)" }}
                    />
                  )}
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
