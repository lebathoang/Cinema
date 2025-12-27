import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { 
  Ticket, 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronRight,
  Search,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";

export function BookingHistory() {
  const bookings = [
    {
      id: "BK-9021",
      movie: "Nebula",
      cinema: "Cineplex Grand Mall",
      date: "Oct 24, 2025",
      time: "19:30",
      seats: "F12, F13",
      status: "Upcoming",
      price: "$32.48",
      poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=300"
    },
    {
      id: "BK-8842",
      movie: "Velocity",
      cinema: "Premiere Cinema Park",
      date: "Oct 18, 2025",
      time: "21:00",
      seats: "D4, D5",
      status: "Completed",
      price: "$28.50",
      poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=300"
    },
    {
      id: "BK-7521",
      movie: "Whispers",
      cinema: "Urban Cineplex",
      date: "Sep 12, 2025",
      time: "18:15",
      seats: "G10",
      status: "Completed",
      price: "$14.99",
      poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=300"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <main className="pt-32 container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-2">
            <h1 className="text-5xl font-display text-white uppercase tracking-tight">Booking History</h1>
            <p className="text-muted-foreground text-lg">Your cinematic journey at a glance.</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search bookings..." 
                className="pl-12 h-12 bg-card/50 border-white/10 rounded-xl focus:border-primary/50 transition-all text-white"
              />
            </div>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-white/10 hover:bg-white/5">
              <Filter className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {bookings.map((booking, idx) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-card border-white/10 rounded-[2rem] overflow-hidden hover:border-primary/30 transition-all group">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-stretch">
                    {/* Poster Section */}
                    <div className="w-full md:w-48 h-48 md:h-auto relative overflow-hidden flex-shrink-0">
                      <img 
                        src={booking.poster} 
                        alt={booking.movie} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-card via-transparent to-transparent hidden md:block" />
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-8 flex flex-col md:flex-row justify-between gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <h2 className="text-3xl font-display text-white uppercase tracking-tight">{booking.movie}</h2>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            booking.status === "Upcoming" ? "bg-green-500/20 text-green-500 border border-green-500/20" : "bg-white/10 text-muted-foreground border border-white/10"
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                              <Calendar className="h-3 w-3" /> Date
                            </p>
                            <p className="text-white text-sm font-medium">{booking.date}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                              <Clock className="h-3 w-3" /> Time
                            </p>
                            <p className="text-white text-sm font-medium">{booking.time}</p>
                          </div>
                          <div className="space-y-1 col-span-2 md:col-span-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                              <MapPin className="h-3 w-3" /> Cinema
                            </p>
                            <p className="text-white text-sm font-medium">{booking.cinema}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-center gap-4 min-w-[160px]">
                        <div className="text-right mb-2">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Price</p>
                          <p className="text-2xl font-display text-primary">{booking.price}</p>
                        </div>
                        <Link href={`/ticket/${booking.id}`}>
                          <Button className="w-full rounded-xl bg-white text-black font-bold hover:bg-white/90 gap-2 h-12">
                            VIEW TICKET <Ticket className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
