import { useParams } from "wouter";
import { movies } from "@/lib/data";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Star, Share2, Ticket, Info, Play, ChevronRight } from "lucide-react";
import { useState } from "react";
import { SeatSelector } from "@/components/booking/SeatSelector";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import NotFound from "@/pages/not-found";

export function MovieDetail() {
  const params = useParams();
  const movie = movies.find((m) => m.id === params.id);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [bookingSummary, setBookingSummary] = useState({ count: 0, total: 0 });

  if (!movie) return <NotFound />;

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
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url(${movie.backdrop})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
        
        <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-12 relative z-10">
           <div className="flex flex-wrap items-center gap-3 mb-6">
            {movie.genre.map((g) => (
              <span key={g} className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                {g}
              </span>
            ))}
            <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">
              {movie.rating}
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-bold text-white mb-6 leading-tight drop-shadow-2xl">
            {movie.title}
          </h1>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" variant="outline" className="rounded-full border-white/20 hover:bg-white/10 text-white gap-2 backdrop-blur-md">
              <Play className="h-4 w-4 fill-white" />
              Watch Trailer
            </Button>
            <Button size="lg" variant="ghost" className="rounded-full text-white/70 hover:text-white gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Tabs for Info */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="bg-transparent border-b border-white/10 w-full justify-start rounded-none h-auto p-0 gap-8">
                <TabsTrigger value="about" className="data-[state=active]:bg-transparent data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 py-4 text-lg font-display text-muted-foreground data-[state=active]:text-white transition-all">ABOUT MOVIE</TabsTrigger>
                <TabsTrigger value="cast" className="data-[state=active]:bg-transparent data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 py-4 text-lg font-display text-muted-foreground data-[state=active]:text-white transition-all">CAST & CREW</TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-transparent data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 py-4 text-lg font-display text-muted-foreground data-[state=active]:text-white transition-all">REVIEWS</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="pt-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2">
                    <h3 className="text-2xl font-display text-white mb-4">Synopsis</h3>
                    <p className="text-gray-400 text-lg leading-relaxed">
                      {movie.description}
                    </p>
                  </div>
                  <div className="space-y-6">
                     <div>
                      <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Duration</h4>
                      <p className="text-white flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {movie.duration}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Release Date</h4>
                      <p className="text-white flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        Dec 15, 2025
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card/30 rounded-2xl p-8 border border-white/5">
                  <h3 className="text-2xl font-display text-white mb-6">Cinema Experience</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { label: "Dolby Atmos", icon: "Surround Sound" },
                      { label: "4K Laser", icon: "Crystal Clear" },
                      { label: "Recliner Seats", icon: "Premium Comfort" },
                      { label: "IMAX", icon: "Massive Screen" }
                    ].map(feat => (
                      <div key={feat.label} className="text-center p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-primary font-bold mb-1">{feat.label}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-tighter">{feat.icon}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="cast" className="pt-8 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {["Christopher Nolan", "Cillian Murphy", "Emily Blunt", "Matt Damon"].map((name, i) => (
                    <div key={name} className="group cursor-pointer">
                      <div className="aspect-square rounded-full overflow-hidden bg-muted mb-4 border-2 border-transparent group-hover:border-primary transition-all grayscale group-hover:grayscale-0">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt={name} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="text-white font-medium text-center">{name}</h4>
                      <p className="text-xs text-muted-foreground text-center">{i === 0 ? "Director" : "Actor"}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Booking Panel */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-card border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16" />
                
                <h3 className="text-3xl font-display text-white mb-8">Book Tickets</h3>
                
                {/* Date Selector */}
                <div className="space-y-4 mb-8">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Select Date</label>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {dates.map((d, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(idx)}
                        className={cn(
                          "flex flex-col items-center justify-center min-w-[64px] h-[84px] rounded-2xl border transition-all duration-300",
                          selectedDate === idx 
                            ? "bg-primary border-primary text-primary-foreground scale-105 shadow-lg shadow-primary/20" 
                            : "bg-secondary/30 border-white/5 hover:bg-white/10 text-muted-foreground"
                        )}
                      >
                        <span className="text-[10px] uppercase font-bold tracking-widest mb-1 opacity-70">{d.day}</span>
                        <span className="text-2xl font-bold font-display leading-none">{d.date}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Showtime Selector */}
                <div className="space-y-4 mb-10">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Select Showtime</label>
                  <div className="grid grid-cols-2 gap-3">
                    {movie.showtimes.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "py-3 rounded-xl border text-sm font-bold transition-all duration-300",
                          selectedTime === time
                            ? "bg-white text-black border-white shadow-xl shadow-white/10"
                            : "bg-transparent border-white/10 text-white hover:border-white/30"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Booking Trigger */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      size="lg" 
                      className="w-full h-16 text-lg font-bold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-30 disabled:grayscale group"
                      disabled={!selectedTime}
                    >
                      Continue to Seats
                      <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl bg-[#09090b] border-white/10 text-white p-0 overflow-hidden rounded-3xl">
                    <div className="p-8 md:p-12">
                      <DialogHeader className="mb-12">
                        <div className="flex items-center gap-4 mb-2">
                           <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-[10px] font-bold uppercase tracking-wider border border-primary/20">{movie.rating}</span>
                           <h2 className="text-muted-foreground text-sm font-medium">{movie.title}</h2>
                        </div>
                        <DialogTitle className="font-display text-5xl md:text-6xl text-white uppercase tracking-tight leading-none">Choose Seating</DialogTitle>
                      </DialogHeader>
                      
                      <div className="relative">
                        <SeatSelector onBooking={(count, total) => setBookingSummary({ count, total })} />
                      </div>

                      <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-t border-white/5 pt-12 mt-12 bg-white/[0.02] -mx-12 -mb-12 p-12">
                        <div className="flex gap-12">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Selected Date</p>
                            <p className="text-xl font-display text-white">{dates[selectedDate].day}, {dates[selectedDate].date}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Showtime</p>
                            <p className="text-xl font-display text-white">{selectedTime}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-8 w-full md:w-auto">
                           <div className="text-right">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Amount</p>
                            <p className="text-4xl font-display font-bold text-white">${bookingSummary.total.toFixed(2)}</p>
                          </div>
                          <Button size="lg" className="rounded-2xl h-16 px-12 font-bold text-lg bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 flex-1 md:flex-none" disabled={bookingSummary.count === 0}>
                            PAY NOW
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <p className="text-center text-[10px] text-muted-foreground mt-4 uppercase tracking-[0.1em]">
                  No additional booking fees applied
                </p>
              </div>

              {/* Location Mini Map Mock */}
              <div className="bg-card/30 border border-white/5 rounded-3xl p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <MapPin className="text-primary h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold">Cineplex Grand Mall</h4>
                  <p className="text-xs text-muted-foreground">3rd Floor, West Wing</p>
                </div>
                <ChevronRight className="ml-auto text-muted-foreground h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
