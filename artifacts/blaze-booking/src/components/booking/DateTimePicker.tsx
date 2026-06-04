import { useState, useRef, useEffect } from "react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday,
  addMonths, subMonths, isBefore,
} from "date-fns";
import { CalendarIcon, Clock, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─── constants ────────────────────────────────────────────────── */
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// 30-min slots 12:00 AM → 11:30 PM
const ALL_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? 0 : 30;
  return { h, m };
});

function fmtSlot(h: number, m: number) {
  const period = h >= 12 ? "PM" : "AM";
  const dh = h % 12 === 0 ? 12 : h % 12;
  return `${dh}:${String(m).padStart(2, "0")} ${period}`;
}

/* ─── props ─────────────────────────────────────────────────────── */
interface DateTimePickerProps {
  label: string;
  dateValue: string;        // "yyyy-MM-dd" or ""
  timeValue: string;        // "HH:mm" or ""
  onDateChange: (v: string) => void;
  onTimeChange: (v: string) => void;
  minDate?: Date;
}

/* ─── main component ─────────────────────────────────────────────── */
export function DateTimePicker({
  label, dateValue, timeValue, onDateChange, onTimeChange, minDate,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"AM" | "PM">("AM");
  const [viewMonth, setViewMonth] = useState<Date>(() => {
    if (dateValue) return new Date(dateValue + "T12:00:00");
    return new Date();
  });
  const ref = useRef<HTMLDivElement>(null);

  /* close on outside click */
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  const selectedDate = dateValue ? new Date(dateValue + "T12:00:00") : undefined;
  const [selH, selM] = timeValue ? timeValue.split(":").map(Number) : [null, null];

  const isDayDisabled = (d: Date) => {
    const base = minDate ?? new Date(new Date().setHours(0, 0, 0, 0));
    return isBefore(d, base);
  };

  const pickDate = (d: Date) => {
    onDateChange(format(d, "yyyy-MM-dd"));
    // auto-switch to time tab after picking date
  };

  const pickTime = (h: number, m: number) => {
    onTimeChange(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    if (selectedDate) setOpen(false);
  };

  /* calendar grid days */
  const calDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewMonth)),
    end: endOfWeek(endOfMonth(viewMonth)),
  });

  /* time slots for current AM/PM tab */
  const slots = ALL_SLOTS.filter((s) => (tab === "AM" ? s.h < 12 : s.h >= 12));

  /* summary display */
  const dateLabel = selectedDate ? format(selectedDate, "EEE, MMM d") : null;
  const timeLabel = selH !== null ? fmtSlot(selH, selM ?? 0) : null;
  const hasValue = dateLabel || timeLabel;

  return (
    <div className="space-y-2 relative" ref={ref}>
      <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{label}</p>

      {/* ── trigger ── */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all",
          open
            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
            : hasValue
            ? "border-border bg-muted hover:border-primary/40"
            : "border-border border-dashed bg-muted hover:border-primary/40",
        )}
      >
        <CalendarIcon size={16} className={cn("shrink-0", hasValue ? "text-primary" : "text-muted-foreground")} />

        {hasValue ? (
          <span className="flex items-center gap-2 flex-wrap text-sm font-medium text-foreground">
            {dateLabel && <span>{dateLabel}</span>}
            {dateLabel && timeLabel && <span className="text-muted-foreground">·</span>}
            {timeLabel && (
              <span className="flex items-center gap-1 text-primary">
                <Clock size={12} />{timeLabel}
              </span>
            )}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Select date & time</span>
        )}

        <span className="ml-auto text-muted-foreground">
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronLeft size={15} style={{ transform: "rotate(-90deg)" }} />
          </motion.div>
        </span>
      </button>

      {/* ── panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2">

              {/* ── LEFT: Calendar ── */}
              <div className="border-b sm:border-b-0 sm:border-r border-border p-4">
                {/* Month nav */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={() => setViewMonth(subMonths(viewMonth, 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <span className="text-sm font-semibold text-foreground">
                    {format(viewMonth, "MMMM yyyy")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 mb-1">
                  {DAYS.map((d) => (
                    <div key={d} className="text-center text-[10px] text-muted-foreground font-semibold py-1 uppercase tracking-wide">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 gap-y-0.5">
                  {calDays.map((day) => {
                    const inMonth = isSameMonth(day, viewMonth);
                    const selected = selectedDate && isSameDay(day, selectedDate);
                    const today = isToday(day);
                    const disabled = isDayDisabled(day);

                    return (
                      <motion.button
                        key={day.toISOString()}
                        type="button"
                        disabled={disabled || !inMonth}
                        onClick={() => pickDate(day)}
                        whileHover={!disabled && inMonth ? { scale: 1.1 } : {}}
                        whileTap={!disabled && inMonth ? { scale: 0.93 } : {}}
                        transition={{ type: "spring", stiffness: 400, damping: 22 }}
                        className={cn(
                          "h-8 w-full rounded-md text-sm flex items-center justify-center transition-colors",
                          !inMonth && "opacity-0 pointer-events-none",
                          disabled && inMonth && "opacity-25 cursor-not-allowed",
                          selected
                            ? "bg-primary text-primary-foreground font-bold shadow-sm"
                            : today
                            ? "border border-primary/40 text-primary font-semibold hover:bg-primary/10"
                            : !disabled && inMonth
                            ? "hover:bg-accent text-foreground"
                            : "",
                        )}
                      >
                        {format(day, "d")}
                        {selected && (
                          <motion.div
                            layoutId="cal-selected"
                            className="absolute inset-0 rounded-md bg-primary -z-10"
                            transition={{ type: "spring", stiffness: 400, damping: 26 }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* ── RIGHT: Time ── */}
              <div className="p-4 flex flex-col">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">
                  Pickup Time
                </p>

                {/* AM / PM tabs */}
                <div className="flex rounded-lg bg-muted p-0.5 mb-3 gap-0.5">
                  {(["AM", "PM"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTab(p)}
                      className={cn(
                        "flex-1 py-1.5 rounded-md text-xs font-semibold transition-all",
                        tab === p
                          ? "bg-primary text-primary-foreground shadow"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Time slot grid */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, x: tab === "PM" ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: tab === "PM" ? -10 : 10 }}
                    transition={{ duration: 0.18 }}
                    className="grid grid-cols-2 gap-1.5 overflow-y-auto max-h-[220px] pr-0.5 scrollbar-thin"
                  >
                    {slots.map(({ h, m }) => {
                      const isSelected = selH === h && selM === m;
                      return (
                        <motion.button
                          key={`${h}-${m}`}
                          type="button"
                          onClick={() => pickTime(h, m)}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 22 }}
                          className={cn(
                            "relative py-2 px-2 rounded-md text-xs font-medium text-center transition-colors",
                            isSelected
                              ? "bg-primary text-primary-foreground font-semibold shadow"
                              : "bg-muted hover:bg-accent text-foreground",
                          )}
                        >
                          {isSelected && (
                            <motion.div
                              layoutId="time-selected"
                              className="absolute inset-0 rounded-md bg-primary -z-10"
                              transition={{ type: "spring", stiffness: 400, damping: 26 }}
                            />
                          )}
                          {fmtSlot(h, m)}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>

                {/* Status hint */}
                <div className="mt-3 pt-3 border-t border-border">
                  {!selectedDate && !timeLabel && (
                    <p className="text-[11px] text-muted-foreground text-center">
                      Pick a date, then a time
                    </p>
                  )}
                  {selectedDate && !timeLabel && (
                    <p className="text-[11px] text-primary text-center animate-pulse">
                      Now select a pickup time →
                    </p>
                  )}
                  {selectedDate && timeLabel && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center gap-2 text-[11px] text-emerald-400 font-medium"
                    >
                      <Check size={12} strokeWidth={3} />
                      {dateLabel} at {timeLabel}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
