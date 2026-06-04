import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = ["00", "15", "30", "45"];

interface DateTimePickerProps {
  label: string;
  dateValue: string;
  timeValue: string;
  onDateChange: (val: string) => void;
  onTimeChange: (val: string) => void;
  minDate?: Date;
}

export function DateTimePicker({
  label,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  minDate,
}: DateTimePickerProps) {
  const [calOpen, setCalOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);

  const selectedDate = dateValue ? new Date(dateValue + "T12:00:00") : undefined;

  const [timeHour, timeMinute] = timeValue
    ? timeValue.split(":").map(Number)
    : [12, 0];

  const formatTime = (h: number, m: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${String(m).padStart(2, "0")} ${period}`;
  };

  const handleTimeSelect = (h: number, m: number) => {
    onTimeChange(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    setTimeOpen(false);
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
        {label}
      </Label>
      <div className="flex gap-2">
        {/* Date picker */}
        <Popover open={calOpen} onOpenChange={setCalOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "flex-1 justify-start text-left font-normal bg-muted border-border hover:bg-accent",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon size={15} className="mr-2 shrink-0" />
              {selectedDate
                ? format(selectedDate, "EEE, MMM d, yyyy")
                : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(day) => {
                if (day) {
                  onDateChange(format(day, "yyyy-MM-dd"));
                  setCalOpen(false);
                }
              }}
              disabled={(date) =>
                minDate ? date < minDate : date < new Date(new Date().setHours(0, 0, 0, 0))
              }
              captionLayout="dropdown"
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Time picker */}
        <Popover open={timeOpen} onOpenChange={setTimeOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-36 justify-start font-normal bg-muted border-border hover:bg-accent"
            >
              <Clock size={15} className="mr-2 shrink-0 text-muted-foreground" />
              {timeValue ? formatTime(timeHour, timeMinute) : "Select time"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" align="start">
            <div className="flex border-b border-border">
              <div className="flex-1 border-r border-border">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-3 py-2">
                  Hour
                </p>
                <div className="overflow-y-auto max-h-52">
                  {HOURS.map((h) => {
                    const isSelected = h === timeHour;
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => handleTimeSelect(h, timeMinute)}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-sm transition-colors",
                          isSelected
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "hover:bg-accent text-foreground"
                        )}
                      >
                        {h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-3 py-2">
                  Min
                </p>
                {MINUTES.map((m) => {
                  const mNum = parseInt(m);
                  const isSelected = mNum === timeMinute;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleTimeSelect(timeHour, mNum)}
                      className={cn(
                        "w-full text-left px-3 py-1.5 text-sm transition-colors",
                        isSelected
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "hover:bg-accent text-foreground"
                      )}
                    >
                      :{m}
                    </button>
                  );
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
