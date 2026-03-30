import { useParams, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Star, Share2, Play, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { SeatSelector } from "@/components/booking/SeatSelector";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import NotFound from "@/pages/not-found";
import { motion } from "framer-motion";
import { getMovieDetail } from "@/api/movieApi";
import { getMovieCast } from "@/api/castApi";
import { getCinemas } from "@/api/cinemaApi";

export function MovieDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [bookingSummary, setBookingSummary] = useState({ count: 0, total: 0, seats: [] as string[] });
  const [movie, setMovie] = useState<any>(null);
  const [cast, setCast] = useState([]);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [selectedCinema, setSelectedCinema] = useState<any>(null);
  const [isCinemaDialogOpen, setIsCinemaDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const data = await getMovieDetail(params.id!);
        setMovie(data);
      } catch (err) {
        console.error(err);
        setMovie(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [params.id]);

  useEffect(() => {
    const fetchCast = async () => {
      try {
        const data = await getMovieCast(params.id!);
        setCast(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCast();
  }, [params.id]);

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const data = await getCinemas();
        setCinemas(data);
        setSelectedCinema((currentCinema: any) => currentCinema ?? data?.[0] ?? null);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCinemas();
  }, []);

  if (loading) {
    return <div className="text-white text-center mt-20">Loading...</div>;
  }

  if (!movie) return <NotFound />;

  const dates = Object.values(
    movie.showtimes.reduce((acc: any, showtime: any) => {
      const date = new Date(showtime.start_time);
      const key = date.toDateString();

      if (!acc[key]) {
        acc[key] = {
          fullDate: key,
          day: date.toLocaleDateString("en-US", { weekday: "short" }),
          date: date.getDate().toString().padStart(2, "0"),
          timestamp: date.getTime(),
        };
      }

      return acc;
    }, {})
  ).sort((a: any, b: any) => a.timestamp - b.timestamp);

  const filteredShowtimes = movie.showtimes.filter((showtime: any) => {
    if (!selectedDate) return true;
    return new Date(showtime.start_time).toDateString() === selectedDate;
  });

  const persistBookingSelection = (selectedSeats: string[]) => {
    const bookingPayload = {
      movieId: String(movie.id),
      movieTitle: movie.title,
      posterUrl: movie.poster_url,
      selectedSeats,
      seatCount: selectedSeats.length,
      subtotal: selectedSeats.length * 14.99,
      total: selectedSeats.length * 14.99,
      selectedDate,
      selectedTime,
      selectedCinema,
      hall: "Hall 04",
      pricePerSeat: 14.99,
    };

    sessionStorage.setItem("pending-booking", JSON.stringify(bookingPayload));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <div className="relative h-[70vh] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url(${movie.banner_url})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />

        <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-12 relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {movie.genres.map((genre: string) => (
              <span key={genre} className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                {genre}
              </span>
            ))}
            <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">
              {movie.age_rating}
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-bold text-white mb-6 leading-tight drop-shadow-2xl">
            {movie.title}
          </h1>
          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-white/20 hover:bg-white/10 text-white gap-2 backdrop-blur-md"
              onClick={() => {
                window.open(movie.trailer_url, "_blank");
              }}
            >
              <Play className="h-4 w-4 fill-white" />
              Watch Trailer
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="rounded-full text-white/70 hover:text-white gap-2"
              onClick={() => {
                if (navigator.share) {
                  navigator
                    .share({
                      title: movie.title,
                      text: `Check out ${movie.title} at Cineplex Premiere!`,
                      url: window.location.href,
                    })
                    .catch(console.error);
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }
              }}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
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
                        {movie.duration} minutes
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
                      { label: "IMAX", icon: "Massive Screen" },
                    ].map((feature) => (
                      <div key={feature.label} className="text-center p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-primary font-bold mb-1">{feature.label}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-tighter">{feature.icon}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="cast" className="pt-8 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {cast.map((item: any) => (
                    <div key={item.id} className="group cursor-pointer">
                      <div className="aspect-square rounded-full overflow-hidden bg-muted mb-4 border-2 border-transparent group-hover:border-primary transition-all grayscale group-hover:grayscale-0">
                        <img
                          src={item.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}`}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="text-white font-medium text-center">{item.name}</h4>
                      <p className="text-xs text-muted-foreground text-center">{item.character_name}</p>

                      {item.role_type === "VOICE" && (
                        <p className="text-[10px] text-yellow-400 text-center">Voice Actor</p>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="pt-8 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-3xl font-display text-white uppercase tracking-tight">User Reviews</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-4 w-4 text-primary fill-primary" />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground font-bold uppercase tracking-widest ml-2">4.9 / 5.0</span>
                      </div>
                    </div>
                    <Button className="rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8">WRITE A REVIEW</Button>
                  </div>

                  {[
                    { name: "Sarah J.", date: "2 days ago", rating: 5, comment: "Absolutely breathtaking. The cinematography and sound design are on another level. A must-watch in IMAX!", color: "bg-blue-500/10" },
                    { name: "Michael R.", date: "1 week ago", rating: 4, comment: "Intense and gripping from start to finish. Some plot points felt a bit rushed, but overall a masterpiece.", color: "bg-green-500/10" },
                    { name: "David L.", date: "Oct 15", rating: 5, comment: "I've seen it three times now and it gets better every time. Nolan has done it again.", color: "bg-purple-500/10" },
                    { name: "Elena P.", date: "Oct 12", rating: 5, comment: "The soundtrack is hauntingly beautiful. I haven't been this moved by a movie in years.", color: "bg-red-500/10" },
                  ].map((review, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="p-8 rounded-[2.5rem] bg-card border border-white/5 space-y-4 hover:border-primary/20 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-primary font-bold font-display text-xl border border-primary/20 ${review.color}`}>
                            {review.name[0]}
                          </div>
                          <div>
                            <h4 className="text-white font-bold">{review.name}</h4>
                            <div className="flex mt-1">
                              {Array.from({ length: 5 }).map((_, starIndex) => (
                                <Star key={starIndex} className={starIndex < review.rating ? "h-3 w-3 text-primary fill-primary" : "h-3 w-3 text-white/10"} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">{review.date}</span>
                      </div>
                      <p className="text-gray-400 leading-relaxed italic text-lg">"{review.comment}"</p>
                    </motion.div>
                  ))}

                  <Button variant="ghost" className="w-full py-12 text-muted-foreground hover:text-white uppercase tracking-[0.4em] text-[10px] font-bold group">
                    LOAD MORE REVIEWS <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-card border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16" />

                <h3 className="text-3xl font-display text-white mb-8">Book Tickets</h3>

                <div className="space-y-4 mb-8">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Select Date</label>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {dates.map((date: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(date.fullDate)}
                        className={cn(
                          "flex flex-col items-center justify-center min-w-[64px] h-[84px] rounded-2xl border transition-all duration-300",
                          selectedDate === date.fullDate
                            ? "bg-primary border-primary text-primary-foreground scale-105 shadow-lg shadow-primary/20"
                            : "bg-secondary/30 border-white/5 hover:bg-white/10 text-muted-foreground"
                        )}
                      >
                        <span className="text-[10px] uppercase font-bold tracking-widest mb-1 opacity-70">{date.day}</span>
                        <span className="text-2xl font-bold font-display leading-none">{date.date}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Select Showtime</label>
                  <div className="grid grid-cols-2 gap-3">
                    {filteredShowtimes.map((time: any) => {
                      const formattedTime = new Date(time.start_time).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <button
                          key={time.start_time}
                          onClick={() => setSelectedTime(time.start_time)}
                          className={cn(
                            "py-3 rounded-xl border text-sm font-bold transition-all duration-300",
                            selectedTime === time.start_time
                              ? "bg-white text-black border-white shadow-xl shadow-white/10"
                              : "bg-transparent border-white/10 text-white hover:border-white/30"
                          )}
                        >
                          {formattedTime}
                        </button>
                      );
                    })}
                  </div>
                </div>

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
                  <DialogContent className="max-w-4xl bg-[#09090b] border-white/10 text-white p-0 overflow-hidden rounded-3xl max-h-[90vh]">
                    <div className="p-8 md:p-12 overflow-y-auto scroll-overlay max-h-[90vh]">
                      <DialogHeader className="mb-12">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-[10px] font-bold uppercase tracking-wider border border-primary/20">{movie.rating}</span>
                          <h2 className="text-muted-foreground text-sm font-medium">{movie.title}</h2>
                        </div>
                        <DialogTitle className="font-display text-5xl md:text-6xl text-white uppercase tracking-tight leading-none">Choose Seating</DialogTitle>
                      </DialogHeader>

                      <div className="relative">
                        <SeatSelector
                          onBooking={(booking) => setBookingSummary(booking)}
                          onProceedToCheckout={(selectedSeats) => {
                            persistBookingSelection(selectedSeats);
                            setLocation(`/checkout/${movie.id}`);
                          }}
                        />
                      </div>

                      <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-t border-white/5 pt-12 mt-12 bg-white/[0.02] -mx-12 -mb-12 p-12">
                        <div className="flex gap-12">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Selected Date</p>
                            <p className="text-xl font-display text-white">{selectedDate}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Showtime</p>
                            <p className="text-xl font-display text-white">{selectedTime}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Cinema</p>
                            <p className="text-xl font-display text-white">{selectedCinema?.name || "Not selected"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-8 w-full md:w-auto">
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Amount</p>
                            <p className="text-4xl font-display font-bold text-white">${bookingSummary.total.toFixed(2)}</p>
                          </div>
                          <Button
                            size="lg"
                            className="rounded-2xl h-16 px-12 font-bold text-lg bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 flex-1 md:flex-none"
                            disabled={bookingSummary.count === 0}
                            onClick={() => {
                              persistBookingSelection(bookingSummary.seats);
                              setLocation(`/checkout/${movie.id}`);
                            }}
                          >
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

              <Dialog open={isCinemaDialogOpen} onOpenChange={setIsCinemaDialogOpen}>
                <DialogTrigger asChild>
                  <button className="w-full bg-card/30 border border-white/5 rounded-3xl p-6 flex items-center gap-4 text-left hover:border-primary/20 transition-all">
                    <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <MapPin className="text-primary h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-bold">{selectedCinema?.name || "Choose a cinema"}</h4>
                      <p className="text-xs text-muted-foreground">
                        {selectedCinema?.location || "Select the cinema where you want to watch this movie."}
                      </p>
                    </div>
                    <ChevronRight className="ml-auto text-muted-foreground h-4 w-4" />
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-card border-white/10 text-white max-w-2xl rounded-3xl">
                  <DialogHeader className="mb-4">
                    <DialogTitle className="font-display text-3xl uppercase tracking-tight">Select Cinema</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    {cinemas.map((cinema: any) => (
                      <button
                        key={cinema.id}
                        onClick={() => {
                          setSelectedCinema(cinema);
                          setIsCinemaDialogOpen(false);
                        }}
                        className={cn(
                          "w-full rounded-2xl border p-5 text-left transition-all",
                          selectedCinema?.id === cinema.id
                            ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                            : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                        )}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h4 className="text-white text-base font-bold">{cinema.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{cinema.location}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                              {cinema.distance || "Available"}
                            </p>
                            {cinema.rating && <p className="text-xs text-white mt-1">Rating {cinema.rating}</p>}
                          </div>
                        </div>
                      </button>
                    ))}
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
