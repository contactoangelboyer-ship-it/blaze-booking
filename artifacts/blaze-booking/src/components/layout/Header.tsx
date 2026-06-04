import { Link } from "wouter";
import { Phone } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
      <div className="max-w-5xl mx-auto flex h-16 items-center justify-center px-4">
        <a
          href="tel:631-374-6154"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Phone size={14} className="text-primary" />
          631-374-6154
        </a>
      </div>
    </header>
  );
}
