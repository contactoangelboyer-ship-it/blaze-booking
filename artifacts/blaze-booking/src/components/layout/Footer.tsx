export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Blaze Long Island Car Services LLC. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="tel:631-374-6154" className="hover:text-foreground transition-colors">631-374-6154</a>
          <a href="mailto:blazelicarservice@gmail.com" className="hover:text-foreground transition-colors">
            blazelicarservice@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
