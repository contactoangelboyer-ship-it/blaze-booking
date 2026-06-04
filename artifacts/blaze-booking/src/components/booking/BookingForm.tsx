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
  const [formData, setFormData] = useState<BookingFormData>(defaultFormData);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const createReservation = useCreateReservation();

  const handleNext = () => setStep((s) => Math.min(s + 1, 4));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

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
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      done
                        ? "bg-primary text-primary-foreground"
                        : active
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {done ? <CheckIcon size={13} strokeWidth={3} /> : num}
                  </div>
                  <span
                    className={`hidden sm:block text-xs font-medium whitespace-nowrap ${
                      active ? "text-foreground" : done ? "text-muted-foreground" : "text-muted-foreground/50"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 ${done ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="p-6 md:p-8 relative min-h-[420px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
