import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { Ticket, Calendar, Clock, MapPin, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { formatVndCurrency } from "@/lib/seatLayout";
import { getStoredBookings } from "@/lib/bookingStore";
import { useMemo, useState } from "react";

const formatDate = (dateString: string | null) => {
  if (!dateString) {
    return "TBA";
  }

  const date = new Date(dateString);
  return Number.isNaN(date.getTime())
    ? dateString
    : date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

const formatTime = (dateString: string | null) => {
  if (!dateString) {
    return "TBA";
  }

  const date = new Date(dateString);
  return Number.isNaN(date.getTime())
    ? dateString
    : date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};

export function BookingHistory() {
  const [keyword, setKeyword] = useState("");
  const bookings = getStoredBookings();
  const filteredBookings = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) {
      return bookings;
    }

    return bookings.filter((booking) =>
      [booking.movieTitle, booking.cinema, booking.hall, booking.seats.join(", "), booking.id]
        .join(" ")
        .toLowerCase()
        .includes(normalizedKeyword)
    );
  }, [bookings, keyword]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <main className="pt-32 container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-2">
            <h1 className="text-5xl font-display text-white uppercase tracking-tight">Booking History</h1>
            <p className="text-muted-foreground text-lg">Danh sach booking da sync tu flow thanh toan VietQR.</p>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search bookings..."
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="pl-12 h-12 bg-card/50 border-white/10 rounded-xl focus:border-primary/50 transition-all text-white"
              />
            </div>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-white/10 hover:bg-white/5">
              <Filter className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {filteredBookings.map((booking, idx) => (
            <motion.div key={booking.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}>
              <Card className="bg-card border-white/10 rounded-[2rem] overflow-hidden hover:border-primary/30 transition-all group">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-stretch">
                    <div className="w-full md:w-48 h-48 md:h-auto relative overflow-hidden flex-shrink-0 bg-white/5">
                      {booking.posterUrl ? (
                        <img src={booking.posterUrl} alt={booking.movieTitle} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Ticket className="h-16 w-16 text-white/30" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 p-8 flex flex-col md:flex-row justify-between gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <h2 className="text-3xl font-display text-white uppercase tracking-tight">{booking.movieTitle}</h2>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            booking.status === "paid" ? "bg-green-500/20 text-green-400 border border-green-500/20" : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/20"
                          }`}>
                            {booking.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                              <Calendar className="h-3 w-3" /> Date
                            </p>
                            <p className="text-white text-sm font-medium">{formatDate(booking.showtime)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                              <Clock className="h-3 w-3" /> Time
                            </p>
                            <p className="text-white text-sm font-medium">{formatTime(booking.showtime)}</p>
                          </div>
                          <div className="space-y-1 col-span-2 md:col-span-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                              <MapPin className="h-3 w-3" /> Cinema
                            </p>
                            <p className="text-white text-sm font-medium">{booking.cinema}</p>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {booking.hall} • Seats {booking.seats.join(", ")}
                        </p>
                      </div>

                      <div className="flex flex-col justify-center gap-4 min-w-[180px]">
                        <div className="text-right mb-2">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Paid</p>
                          <p className="text-2xl font-display text-primary">{formatVndCurrency(booking.price)}</p>
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

          {filteredBookings.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-card/60 p-10 text-center text-muted-foreground">
              Chua co booking nao duoc luu tu flow thanh toan.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
