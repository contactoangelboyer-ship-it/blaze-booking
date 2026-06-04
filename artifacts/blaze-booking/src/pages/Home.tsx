import { BookingForm } from "@/components/booking/BookingForm";
import { useEffect } from "react";

const TICKER_ITEMS = [
  "🚗  Long Island's Premier Luxury Car Service",
  "✈️  Airport Transfers — JFK · LGA · EWR · ISP",
  "📞  Available 24/7 — Call 631-374-6154",
  "🏢  Corporate & Executive Travel",
  "🎉  Special Events · Weddings · Proms",
  "⭐  Professional Chauffeurs — On Time, Every Time",
  "💼  Hourly Service & As-Directed Trips",
];

const TICKER_TEXT = TICKER_ITEMS.join("     •     ");

export default function Home() {
  useEffect(() => {
    document.title = "Book a Ride — Blaze Long Island Car Services";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Marquee top bar */}
      <div className="w-full bg-primary overflow-hidden py-2 select-none">
        <style>{`
          @keyframes ticker-scroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .ticker-track {
            display: flex;
            width: max-content;
            animation: ticker-scroll 32s linear infinite;
          }
          .ticker-track:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div className="ticker-track">
          {[0, 1].map((copy) => (
            <span
              key={copy}
              className="text-primary-foreground text-xs font-semibold tracking-widest uppercase whitespace-nowrap px-8"
            >
              {TICKER_TEXT}
            </span>
          ))}
        </div>
      </div>

      {/* Main booking area */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 text-center md:text-left">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">
            Secure Online Reservation
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Book Your Ride
          </h1>
        </div>

        <BookingForm />

        <div className="mt-6 text-center text-xs text-muted-foreground space-x-4">
          <span>Need help?</span>
          <a href="tel:631-374-6154" className="text-primary hover:underline">Call 631-374-6154</a>
          <span>&mdash;</span>
          <a href="mailto:blazelicarservice@gmail.com" className="hover:text-foreground transition-colors">
            blazelicarservice@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
