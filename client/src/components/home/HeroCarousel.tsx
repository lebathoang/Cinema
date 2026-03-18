import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Ticket } from "lucide-react";
import { Link } from "wouter";

export function HeroCarousel( { movies }: any ) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!movies || movies.length === 0) {
    return null;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) =>
        movies.length ? (prev + 1) % movies.length : 0
      );
    }, 6000);
    return () => clearInterval(timer);
  }, [movies.length]);

  const currentMovie = movies[currentIndex];
  
  return (
    <div className="relative h-[85vh] w-full overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          {/* Background Image with Blur & Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${currentMovie.banner_url})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="container mx-auto px-4 h-full flex items-end pb-24 relative z-10">
        <motion.div
          key={`content-${currentIndex}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="max-w-2xl"
        >
          <div className="flex flex-wrap gap-2 mb-4">
            {currentMovie.genres.map((gen: string) => (
              <span key={gen} className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-xs font-medium uppercase tracking-wider">
                {gen}
              </span>
            ))}
            <span className="px-3 py-1 bg-primary/20 border border-primary/30 text-primary rounded-full text-xs font-bold">
              {currentMovie.age_rating}
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-display font-bold mb-4 leading-[0.9] text-white">
            {currentMovie.title}
          </h1>

          <p className="text-lg text-gray-300 mb-8 line-clamp-2 md:line-clamp-none max-w-xl">
            {currentMovie.description}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href={`/movie/${currentMovie.id}`}>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 h-12 text-md rounded-full">
                <Ticket className="mr-2 h-5 w-5" />
                Book Tickets
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 hover:bg-white/10 text-white rounded-full h-12 px-8"
              onClick={() => {
                const trailerUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // Placeholder trailer
                window.open(trailerUrl, "_blank");
              }}
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Trailer
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-8 right-8 flex gap-2 z-20">
        {movies.map((idx: any) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-8 bg-primary" : "w-2 bg-white/30 hover:bg-white/50"
              }`}
          />
        ))}
      </div>
    </div>
  );
}
