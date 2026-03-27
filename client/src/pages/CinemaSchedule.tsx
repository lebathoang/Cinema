import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Link, useParams } from "wouter";
import {
  Clock,
  MapPin,
  Star,
  Info,
  Maximize2,
  Volume2,
  CigaretteOff,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getCinemas, getCinemaShowDates, getMovieByDate } from "@/api/cinemaApi";

export function CinemaSchedule() {
  const { id } = useParams();
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [dates, setDates] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [cinemasLoading, setCinemasLoading] = useState(true);
  const [datesLoading, setDatesLoading] = useState(true);
  const [moviesLoading, setMoviesLoading] = useState(true);

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const data = await getCinemas();
        setCinemas(data);
      } catch (error) {
        console.error(error);
      } finally {
        setCinemasLoading(false);
      }
    };

    fetchCinemas();
  }, []);

  useEffect(() => {
    const normalizeDateItem = (value: any) => {
      const rawDate =
        value?.date ||
        value?.show_date ||
        value?.showDate ||
        value?.start_date ||
        value;

      const parsedDate = new Date(rawDate);
      const safeDate = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

      return {
        apiDate: safeDate.toISOString().split("T")[0],
        fullDate: safeDate.toDateString(),
        day: safeDate.toLocaleDateString("en-US", { weekday: "short" }),
        date: safeDate.getDate(),
      };
    };

    const fetchShowDates = async () => {
      if (!id) {
        setDates([]);
        setSelectedDate("");
        setDatesLoading(false);
        return;
      }

      try {
        setDatesLoading(true);
        const data = await getCinemaShowDates(id);
        const normalizedDates = Array.isArray(data) ? data.map(normalizeDateItem) : [];

        setDates(normalizedDates);
        setSelectedDate((currentSelectedDate) => {
          if (!normalizedDates.length) return "";

          const stillExists = normalizedDates.some((item) => item.apiDate === currentSelectedDate);
          return stillExists ? currentSelectedDate : normalizedDates[0].apiDate;
        });
      } catch (error) {
        console.error(error);
        setDates([]);
        setSelectedDate("");
      } finally {
        setDatesLoading(false);
      }
    };

    fetchShowDates();
  }, [id]);

  useEffect(() => {
    const fetchMovies = async () => {
      if (!id || !selectedDate) {
        setMovies([]);
        setMoviesLoading(false);
        return;
      }

      try {
        setMoviesLoading(true);
        const data = await getMovieByDate(id, selectedDate);
        setMovies(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setMovies([]);
      } finally {
        setMoviesLoading(false);
      }
    };

    fetchMovies();
  }, [id, selectedDate]);

  const cinema = cinemas.find((c) => c.id == id) || cinemas[0];

  const selectedDateInfo = dates.find((date) => date.apiDate === selectedDate) || dates[0];

  const loading = cinemasLoading || datesLoading || (moviesLoading && Boolean(selectedDate));

  const getRawShowtime = (showtime: any) =>
    showtime?.start_time || showtime?.startTime || showtime?.time || showtime || null;

  const formatShowtime = (showtime: any) => {
    const rawTime = getRawShowtime(showtime);

    if (!rawTime) return "";

    const parsedTime = new Date(rawTime);
    if (Number.isNaN(parsedTime.getTime())) {
      return rawTime;
    }

    return parsedTime.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const moviesBySelectedDate = movies
    .map((movie) => {
      const showtimes = Array.isArray(movie.showtimes)
        ? movie.showtimes.filter((showtime: any) => {
          const rawTime = getRawShowtime(showtime);

          if (!rawTime || !selectedDateInfo?.fullDate) return true;

          const parsedTime = new Date(rawTime);
          if (Number.isNaN(parsedTime.getTime())) {
            return true;
          }

          return parsedTime.toDateString() === selectedDateInfo.fullDate;
        })
        : [];

      return {
        ...movie,
        showtimes,
      };
    })
    .filter((movie) => !Array.isArray(movie.showtimes) || movie.showtimes.length > 0)
    .sort((movieA, movieB) => {
      const firstShowtimeA = getRawShowtime(movieA.showtimes?.[0]);
      const firstShowtimeB = getRawShowtime(movieB.showtimes?.[0]);

      if (!firstShowtimeA && !firstShowtimeB) return 0;
      if (!firstShowtimeA) return 1;
      if (!firstShowtimeB) return -1;

      return new Date(firstShowtimeA).getTime() - new Date(firstShowtimeB).getTime();
    });

  if (loading || !cinema) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <div className="relative h-[40vh] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url(${cinema.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-12 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded text-[10px] font-bold uppercase tracking-wider">
              <Star className="h-3 w-3 fill-primary-foreground" />
              {cinema.rating}
            </div>
            <span className="text-white/60 text-xs font-medium uppercase tracking-[0.2em]">
              Premiere Venue
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-2 leading-tight uppercase tracking-tight">
            {cinema.name}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{cinema.location}</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide border-b border-white/5">
              {dates.map((date) => (
                <button
                  key={date.apiDate}
                  onClick={() => setSelectedDate(date.apiDate)}
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[80px] h-[100px] rounded-2xl border transition-all duration-300",
                    selectedDate === date.apiDate
                      ? "bg-primary border-primary text-primary-foreground scale-105 shadow-xl shadow-primary/20"
                      : "bg-card border-white/5 hover:bg-white/10 text-muted-foreground"
                  )}
                >
                  <span className="text-[10px] uppercase font-bold tracking-widest mb-1 opacity-70">
                    {date.day}
                  </span>
                  <span className="text-3xl font-bold font-display leading-none">{date.date}</span>
                </button>
              ))}
            </div>

            <div className="space-y-8">
              <h3 className="text-3xl font-display text-white uppercase tracking-tight">
                {selectedDateInfo
                  ? `Movies on ${selectedDateInfo.day} ${selectedDateInfo.date}`
                  : "No show dates available"}
              </h3>

              {selectedDateInfo && moviesBySelectedDate.length > 0 ? (
                moviesBySelectedDate.map((movie, mIdx) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: mIdx * 0.1 }}
                    className="bg-card/30 border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 hover:bg-card/50 transition-all group"
                  >
                    <div className="w-full md:w-40 aspect-[2/3] rounded-2xl overflow-hidden flex-shrink-0 border border-white/5">
                      <img
                        src={movie.poster_url}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                            {movie.rating || movie.age_rating || "Now Showing"}
                          </span>
                          <span className="text-muted-foreground text-xs uppercase tracking-widest">
                            {Array.isArray(movie.genres) ? movie.genres.join(" • ") : "Now Showing"}
                          </span>
                        </div>
                        <h4 className="text-3xl font-display text-white mb-4 group-hover:text-primary transition-colors">
                          {movie.title}
                        </h4>
                        {Array.isArray(movie.showtimes) && movie.showtimes.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {movie.showtimes.map((time: any, index: number) => (
                              <Link key={time.id || getRawShowtime(time) || index} href={`/movie/${movie.id}`}>
                                <button className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-white hover:text-black hover:border-white transition-all">
                                  {formatShowtime(time)}
                                </button>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-6 text-xs text-muted-foreground uppercase tracking-widest font-bold">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          {movie.duration}
                        </div>
                        <div className="flex items-center gap-2">
                          <Info className="h-3.5 w-3.5 text-primary" />
                          Hall 04
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20 text-center space-y-4"
                >
                  <div className="inline-flex h-20 w-20 rounded-full bg-white/5 items-center justify-center mb-4">
                    <Clock className="h-10 w-10 text-muted-foreground opacity-20" />
                  </div>
                  <h3 className="text-2xl font-display text-white">
                    {selectedDateInfo ? "No movies scheduled" : "No show dates available"}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedDateInfo
                      ? `There are no movies showing on ${selectedDateInfo.day} ${selectedDateInfo.date} at this cinema.`
                      : "This cinema does not have any available show dates right now."}
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card border border-white/10 rounded-3xl p-8 sticky top-24">
              <h3 className="text-2xl font-display text-white mb-6 uppercase tracking-tight">Cinema Amenities</h3>
              <div className="space-y-6">
                {[
                  { icon: Maximize2, title: "IMAX Experience", desc: "Our largest screen with dual laser projection" },
                  { icon: Volume2, title: "Dolby Atmos", desc: "Immersive 3D audio for every seat" },
                  { icon: CigaretteOff, title: "No Smoking", desc: "Environmentally controlled clean air" },
                ].map((amenity, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <amenity.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-bold mb-1">{amenity.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{amenity.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-10 border-t border-white/5">
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4 text-center">Location Info</p>
                <div className="aspect-video rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground text-xs font-medium">
                  Interactive Map Placeholder
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
