import { useState } from "react";
import { BookingFormData, defaultFormData } from "@/lib/types";
import { Step1Service } from "./Step1Service";
import { Step2Vehicle } from "./Step2Vehicle";
import { Step3Contact } from "./Step3Contact";
import { Step4Summary } from "./Step4Summary";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateReservation } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { CheckIcon } from "lucide-react";

const STEPS = [
  { label: "Service" },
  { label: "Vehicle & Time" },
  { label: "Passenger" },
  { label: "Review" },
];

export function BookingForm() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>(defaultFormData);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const createReservation = useCreateReservation();

  const handleNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 4));
  };
  const handleBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = () => {
    createReservation.mutate(
      { data: formData },
      {
        onSuccess: (res) => {
          setLocation(`/booking/confirmation/${res.id}`);
        },
        onError: () => {
          toast({
            title: "Booking Failed",
            description: "There was an error processing your reservation. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const updateFormData = (data: Partial<BookingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1Service formData={formData} updateFormData={updateFormData} onNext={handleNext} />;
      case 2:
        return <Step2Vehicle formData={formData} updateFormData={updateFormData} onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <Step3Contact formData={formData} updateFormData={updateFormData} onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <Step4Summary formData={formData} onSubmit={handleSubmit} onBack={handleBack} isSubmitting={createReservation.isPending} />;
      default:
        return null;
    }
  };

  const slideVariants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 24 : -24 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -24 : 24 }),
  };

  return (
    <div className="w-full bg-card border border-border rounded-lg overflow-hidden shadow-xl">
      {/* Step header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between gap-2">
          {STEPS.map((s, i) => {
            const num = i + 1;
            const done = num < step;
            const active = num === step;
            return (
              <div key={i} className="flex items-center gap-2 flex-1 last:flex-none">
                <div className="flex items-center gap-2 shrink-0">
                  {/* Step circle */}
                  <div className="relative">
                    <motion.div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
                        done
                          ? "bg-primary text-primary-foreground"
                          : active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                      animate={active ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      <AnimatePresence mode="wait">
                        {done ? (
                          <motion.span
                            key="check"
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 18 }}
                          >
                            <CheckIcon size={13} strokeWidth={3} />
                          </motion.span>
                        ) : (
                          <motion.span
                            key="num"
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            {num}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    {/* Pulse ring on active */}
                    {active && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary"
                        initial={{ scale: 1, opacity: 0.6 }}
                        animate={{ scale: 1.6, opacity: 0 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
                      />
                    )}
                  </div>
                  <span
                    className={`hidden sm:block text-xs font-medium whitespace-nowrap transition-colors duration-300 ${
                      active ? "text-foreground" : done ? "text-muted-foreground" : "text-muted-foreground/40"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-px mx-2 bg-border relative overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-primary"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: done ? 1 : 0 }}
                      style={{ originX: 0 }}
                      transition={{ duration: 0.45, ease: "easeInOut" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="p-6 md:p-8 relative min-h-[420px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.26, ease: "easeInOut" }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
