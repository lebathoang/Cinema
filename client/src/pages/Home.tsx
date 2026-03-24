import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { MovieGrid } from "@/components/movies/MovieGrid";
import cinemaBg from "@assets/generated_images/cinematic_dark_movie_theater_background.png";
import { getRandomMovies } from "../api/movieApi";

export function Home() {

  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchMovies = async () => {
      const data = await getRandomMovies()
      setMovies(data);
    };

    fetchMovies();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20">
        {movies.length > 0 && <HeroCarousel movies={movies} />}

        <div className="relative">
          {/* Subtle background texture */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

          <MovieGrid title="Now Showing" movies={movies} />

          {/* Coming Soon Section */}
          <section className="py-16 bg-secondary/30 border-t border-white/5 relative overflow-hidden">
            <div className="absolute inset-0">
              <img src={cinemaBg} className="w-full h-full object-cover opacity-10 blur-sm" />
            </div>
            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-4xl font-display text-white mb-4">The Ultimate Experience</h2>
                <p className="text-muted-foreground">
                  Immerse yourself in state-of-the-art Dolby Atmos sound and crystal clear 4K laser projection.
                  Join our loyalty program for exclusive premieres.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-black py-12 border-t border-white/10">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>&copy; 2025 Cineplex Premiere. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
