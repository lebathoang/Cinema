import { useParams } from "wouter";
import { movies } from "@/lib/data";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Star, Share2, Ticket } from "lucide-react";
import { useState } from "react";
import { SeatSelector } from "@/components/booking/SeatSelector";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import NotFound from "@/pages/not-found";

export function MovieDetail() {
  const params = useParams();
  const movie = movies.find((m) => m.id === params.id);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [bookingSummary, setBookingSummary] = useState({ count: 0, total: 0 });

  if (!movie) return <NotFound />;

  // Generate next 5 days
  const dates = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate(),
      full: d
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Backdrop */}
      <div className="h-[60vh] relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${movie.backdrop})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
      </div>

      <main className="container mx-auto px-4 -mt-32 relative z-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          
          {/* Left Column: Poster & Details */}
          <div className="md:col-span-1">
            <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10 aspect-[2/3] relative mb-6">
              <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
            </div>
            
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span>Director</span>
                <span className="text-white">Christopher Nolan</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span>Cast</span>
                <span className="text-white text-right w-1/2">Cillian Murphy, Emily Blunt</span>
              </div>
            </div>
          </div>

          {/* Right Column: Info & Booking */}
          <div className="md:col-span-2 lg:col-span-3">
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-4">{movie.title}</h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Star className="text-primary h-4 w-4 fill-primary" />
                  <span className="text-white font-bold text-lg">9.2</span>/10
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {movie.duration}
                </div>
                <div className="px-2 py-0.5 border border-white/20 rounded text-xs font-bold text-white">
                  {movie.rating}
                </div>
                <div className="flex gap-2">
                  {movie.genre.map(g => (
                    <span key={g} className="text-primary">{g}</span>
                  ))}
                </div>
              </div>

              <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">
                {movie.description}
              </p>
            </div>

            {/* Booking Section */}
            <div className="bg-card/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8">
              <h3 className="text-2xl font-display text-white mb-6">Select Show time</h3>

              {/* Date Selector */}
              <div className="flex gap-4 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                {dates.map((d, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(idx)}
                    className={cn(
                      "flex flex-col items-center justify-center min-w-[70px] h-[80px] rounded-xl border transition-all",
                      selectedDate === idx 
                        ? "bg-primary border-primary text-primary-foreground" 
                        : "bg-secondary/50 border-white/5 hover:bg-white/10 text-muted-foreground"
                    )}
                  >
                    <span className="text-xs uppercase font-bold tracking-wider mb-1">{d.day}</span>
                    <span className="text-2xl font-bold font-display">{d.date}</span>
                  </button>
                ))}
              </div>

              {/* Time Selector */}
              <div className="mb-8">
                <div className="flex flex-wrap gap-3">
                  {movie.showtimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={cn(
                        "px-6 py-3 rounded-lg border text-sm font-medium transition-all",
                        selectedTime === time
                          ? "bg-white text-black border-white"
                          : "bg-transparent border-white/10 text-white hover:border-white/30"
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="w-full md:w-auto px-12 h-14 text-lg font-bold rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    disabled={!selectedTime}
                  >
                    <Ticket className="mr-2 h-5 w-5" />
                    Select Seats
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl bg-card border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle className="font-display text-3xl">Select Your Seats</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <div className="text-center text-muted-foreground mb-4">
                      {dates[selectedDate].day}, {dates[selectedDate].date} • {selectedTime} • {movie.title}
                    </div>
                    
                    <SeatSelector onBooking={(count, total) => setBookingSummary({ count, total })} />

                    <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Price</p>
                        <p className="text-3xl font-display font-bold text-primary">${bookingSummary.total.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{bookingSummary.count} seat(s) selected</p>
                      </div>
                      <Button size="lg" className="rounded-full px-8 font-bold" disabled={bookingSummary.count === 0}>
                        Confirm Booking
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
