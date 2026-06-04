import { BookingFormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  formData: BookingFormData;
  updateFormData: (data: Partial<BookingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3Contact({ formData, updateFormData, onNext, onBack }: Props) {
  const isValid = formData.firstName && formData.lastName && formData.email && formData.phone;

  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Passenger Information</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">First Name</Label>
            <Input
              value={formData.firstName}
              onChange={(e) => updateFormData({ firstName: e.target.value })}
              placeholder="John"
              className="bg-muted border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Last Name</Label>
            <Input
              value={formData.lastName}
              onChange={(e) => updateFormData({ lastName: e.target.value })}
              placeholder="Doe"
              className="bg-muted border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Email Address</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              placeholder="john@example.com"
              className="bg-muted border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Phone Number</Label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              placeholder="(631) 555-0100"
              className="bg-muted border-border"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
          Special Requests <span className="normal-case tracking-normal font-normal">(optional)</span>
        </Label>
        <Textarea
          value={formData.specialRequests || ""}
          onChange={(e) => updateFormData({ specialRequests: e.target.value })}
          placeholder="Child seat, extra stops, meet & greet sign, accessibility needs…"
          className="bg-muted border-border min-h-[90px] resize-none"
        />
      </div>

      <div className="pt-2 flex justify-between">
        <Button onClick={onBack} variant="outline" size="lg">Back</Button>
        <Button onClick={onNext} disabled={!isValid} size="lg" className="px-10 font-semibold">
          Review Booking
        </Button>
      </div>
    </div>
  );
}
