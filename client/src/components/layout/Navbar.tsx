import { Link, useLocation } from "wouter";
import { Search, Menu, User, Ticket, Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center gap-2 group">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-300">
              <span className="text-primary-foreground font-black text-xl">C</span>
            </div>
            <span className="font-display text-2xl text-white tracking-tighter uppercase">
              Cineplex<span className="text-primary"> Premiere</span>
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
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-white"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>
          <Link href="/notifications">
            <Button variant="ghost" size="icon" className={`hover:text-white relative ${location === '/notifications' ? 'text-primary' : 'text-muted-foreground'}`}>
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full" />
            </Button>
          </Link>
          <Link href="/profile">
            <Button variant="ghost" size="icon" className={`hover:text-white ${location === '/profile' ? 'text-primary' : 'text-muted-foreground'}`}>
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => setIsSearchOpen(true)}>
            <Search className="h-5 w-5" />
          </Button>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-card border-l border-white/10 w-[80%] backdrop-blur-2xl">
              <div className="flex flex-col gap-6 mt-10">
                <Link href="/"><a className="text-lg font-medium" onClick={() => setIsOpen(false)}>Home</a></Link>
                <Link href="/movies"><a className="text-lg font-medium" onClick={() => setIsOpen(false)}>Movies</a></Link>
                <Link href="/cinemas"><a className="text-lg font-medium" onClick={() => setIsOpen(false)}>Cinemas</a></Link>
                <Link href="/offers"><a className="text-lg font-medium" onClick={() => setIsOpen(false)}>Offers</a></Link>
                <div className="h-px bg-white/10 my-2" />
                <Link href="/profile"><a className="text-lg font-medium" onClick={() => setIsOpen(false)}>Profile</a></Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Search Modal */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card/95 backdrop-blur-2xl border-white/10 p-8 rounded-[2rem]">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-display text-white uppercase tracking-tight">Quick Search</DialogTitle>
          </DialogHeader>
          <div className="flex gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search movies, cinemas, or genres..." 
                className="pl-14 h-16 bg-white/5 border-white/10 rounded-2xl focus:border-primary/50 transition-all text-lg text-white placeholder:text-white/20"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              size="lg" 
              className="h-16 px-8 rounded-2xl bg-primary text-primary-foreground font-bold hover:bg-primary/90"
              onClick={handleSearch}
            >
              SEARCH
            </Button>
          </div>
          <div className="mt-8 space-y-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Popular Searches</p>
            <div className="flex flex-wrap gap-2">
              {['Nebula', 'Velocity', 'IMAX', 'Sci-Fi', 'Action'].map(tag => (
                <button key={tag} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all">
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
