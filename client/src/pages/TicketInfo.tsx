import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Ticket, 
  Download, 
  Share2, 
  ChevronLeft,
  Info,
  QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "wouter";
import { Card } from "@/components/ui/card";

export function TicketInfo() {
  const { id } = useParams();
  
  // Mock ticket data
  const ticket = {
    id: id || "BK-9021",
    movie: "Nebula",
    cinema: "Cineplex Grand Mall",
    hall: "IMAX Hall 04",
    date: "Oct 24, 2025",
    time: "19:30",
    seats: "F12, F13",
    price: "$32.48",
    status: "Valid",
    orderDate: "Oct 20, 2025"
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <main className="pt-32 container mx-auto px-4 max-w-4xl">
        <Link href="/profile">
          <Button variant="ghost" className="text-muted-foreground hover:text-white mb-8 group">
            <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            BACK TO PROFILE
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Ticket Card */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative"
            >
              {/* Top Section - Brand */}
              <div className="bg-primary p-8 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Ticket className="h-6 w-6 text-primary-foreground" />
                  <span className="font-display text-2xl text-primary-foreground tracking-tighter uppercase">Cineplex Premiere</span>
                </div>
                <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                  {ticket.status}
                </div>
              </div>

              {/* Movie Info */}
              <div className="p-8 space-y-8">
                <div>
                  <h1 className="text-5xl font-display text-white uppercase tracking-tight mb-2">{ticket.movie}</h1>
                  <p className="text-primary font-bold text-sm uppercase tracking-[0.2em]">{ticket.hall}</p>
                </div>

                <div className="grid grid-cols-2 gap-8 border-y border-white/5 py-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="h-3 w-3" /> Date
                    </p>
                    <p className="text-white font-bold">{ticket.date}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Clock className="h-3 w-3" /> Time
                    </p>
                    <p className="text-white font-bold">{ticket.time}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <MapPin className="h-3 w-3" /> Cinema
                    </p>
                    <p className="text-white font-bold">{ticket.cinema}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <User className="h-3 w-3" /> Seats
                    </p>
                    <p className="text-white font-bold">{ticket.seats}</p>
                  </div>
                </div>

                {/* QR Code Area */}
                <div className="flex flex-col items-center justify-center py-8 gap-4">
                  <div className="p-6 bg-white rounded-3xl">
                    <QrCode className="h-40 w-40 text-black" />
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">#{ticket.id}</p>
                </div>
              </div>

              {/* Perforation Effect */}
              <div className="absolute left-0 bottom-0 right-0 h-4 flex gap-2 overflow-hidden px-4 translate-y-2">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="h-4 w-4 rounded-full bg-background flex-shrink-0" />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Ticket Details & Actions */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="bg-card border-white/10 rounded-[2rem] p-8 space-y-6">
              <h3 className="text-xl font-display text-white uppercase tracking-tight">Booking Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Booking ID</span>
                  <span className="text-white font-medium">#{ticket.id}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Ordered On</span>
                  <span className="text-white font-medium">{ticket.orderDate}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total Paid</span>
                  <span className="text-primary font-bold text-lg">{ticket.price}</span>
                </div>
              </div>
              <div className="pt-6 border-t border-white/5 space-y-3">
                <Button className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-xl shadow-primary/20 gap-2">
                  <Download className="h-5 w-5" /> DOWNLOAD PDF
                </Button>
                <Button variant="outline" className="w-full h-14 rounded-2xl border-white/10 hover:bg-white/5 text-white font-bold gap-2">
                  <Share2 className="h-5 w-5" /> SHARE TICKET
                </Button>
              </div>
            </Card>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex gap-4">
              <Info className="h-6 w-6 text-primary flex-shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Please arrive at the cinema at least 15 minutes before the show starts. Present this digital ticket at the entrance for scanning.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
