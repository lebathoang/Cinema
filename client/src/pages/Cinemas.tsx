import { Navbar } from "@/components/layout/Navbar";
import { movies } from "@/lib/data";
import { MapPin, Phone, Star, Clock, Info, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "wouter";

const cinemas = [
  {
    id: "1",
    name: "Cineplex Grand Mall",
    location: "Downtown, 3rd Floor, West Wing",
    rating: 4.8,
    features: ["IMAX", "4K Laser", "Dolby Atmos", "Recliners"],
    distance: "1.2 km",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "2",
    name: "Premiere Cinema Park",
    location: "North Side, Building B",
    rating: 4.5,
    features: ["4K Laser", "Dolby Atmos", "Luxury Lounge"],
    distance: "3.5 km",
    image: "https://images.unsplash.com/photo-1517604401870-d251a91ec4bf?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "3",
    name: "Urban Cineplex",
    location: "South Square, Level 2",
    rating: 4.2,
    features: ["Standard", "Snack Bar", "Digital Sound"],
    distance: "5.1 km",
    image: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&q=80&w=800"
  }
];

export function Cinemas() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <main className="pt-32 container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-display text-white uppercase tracking-tight">Cinemas</h1>
            <p className="text-muted-foreground text-lg">Find your perfect movie destination.</p>
          </div>
          
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Find a cinema near you..." 
              className="pl-12 h-14 bg-card/50 border-white/10 rounded-2xl focus:border-primary/50 transition-all text-white"
            />
          </div>
        </div>

        {/* Cinema List */}
        <div className="grid grid-cols-1 gap-6 mb-12">
          {cinemas.map((cinema, idx) => (
            <motion.div
              key={cinema.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-card border border-white/10 rounded-3xl overflow-hidden hover:border-primary/30 transition-all group"
            >
              <div className="flex flex-col md:flex-row h-full">
                {/* Image */}
                <div className="w-full md:w-80 h-48 md:h-auto overflow-hidden flex-shrink-0">
                  <img 
                    src={cinema.image} 
                    alt={cinema.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100"
                  />
                </div>
                
                {/* Content */}
                <div className="flex-1 p-8 flex flex-col md:flex-row justify-between gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-display text-white">{cinema.name}</h2>
                      <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded border border-primary/20 text-primary text-xs font-bold">
                        <Star className="h-3 w-3 fill-primary" />
                        {cinema.rating}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{cinema.location}</span>
                      <span className="text-xs px-2 py-0.5 bg-white/5 rounded-full">{cinema.distance} away</span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {cinema.features.map(f => (
                        <span key={f} className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-3 py-1 bg-white/5 rounded-md border border-white/5 group-hover:border-white/10 transition-all">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center gap-4 min-w-[200px]">
                    <Link href={`/cinema/${cinema.id}`}>
                      <Button size="lg" className="w-full rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all group/btn">
                        VIEW SCHEDULE
                        <ChevronRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <div className="flex items-center justify-between text-muted-foreground text-xs px-2">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        Contact
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Open Now
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" className="h-12 w-12 rounded-xl border-white/10 text-muted-foreground" disabled>
            <ChevronRight className="h-5 w-5 rotate-180" />
          </Button>
          <Button variant="default" className="h-12 w-12 rounded-xl bg-primary text-primary-foreground font-display text-lg">1</Button>
          <Button variant="outline" className="h-12 w-12 rounded-xl border-white/10 text-muted-foreground" disabled>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </main>
    </div>
  );
}
