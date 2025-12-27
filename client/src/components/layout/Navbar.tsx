import { Link, useLocation } from "wouter";
import { Search, Menu, User, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center gap-2 group">
            <Ticket className="h-6 w-6 text-primary transition-transform group-hover:rotate-12" />
            <span className="font-display text-2xl tracking-wider text-white">
              CINEPLEX<span className="text-primary">PREMIERE</span>
            </span>
          </a>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/"><a className={`text-sm font-medium transition-colors hover:text-primary ${location === '/' ? 'text-primary' : 'text-muted-foreground'}`}>Home</a></Link>
          <Link href="/movies"><a className={`text-sm font-medium transition-colors hover:text-primary ${location.startsWith('/movies') ? 'text-primary' : 'text-muted-foreground'}`}>Movies</a></Link>
          <Link href="/cinemas"><a className={`text-sm font-medium transition-colors hover:text-primary ${location === '/cinemas' ? 'text-primary' : 'text-muted-foreground'}`}>Cinemas</a></Link>
          <Link href="/offers"><a className={`text-sm font-medium transition-colors hover:text-primary ${location === '/offers' ? 'text-primary' : 'text-muted-foreground'}`}>Offers</a></Link>
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
            <User className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Search className="h-5 w-5" />
          </Button>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-card border-l border-white/10 w-[80%]">
              <div className="flex flex-col gap-6 mt-10">
                <Link href="/"><a className="text-lg font-medium" onClick={() => setIsOpen(false)}>Home</a></Link>
                <Link href="/movies"><a className="text-lg font-medium" onClick={() => setIsOpen(false)}>Movies</a></Link>
                <a href="#" className="text-lg font-medium">Cinemas</a>
                <a href="#" className="text-lg font-medium">Offers</a>
                <div className="h-px bg-white/10 my-2" />
                <a href="#" className="text-lg font-medium">Sign In</a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
