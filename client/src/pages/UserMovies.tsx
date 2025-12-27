import { Navbar } from "@/components/layout/Navbar";
import { movies } from "@/lib/data";
import { motion } from "framer-motion";
import { Ticket, Search, Filter } from "lucide-react";
import { MovieGrid } from "@/components/movies/MovieGrid";

export function UserMovies() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <main className="pt-32 container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-2">
            <h1 className="text-5xl font-display text-white uppercase tracking-tight">My Movies</h1>
            <p className="text-muted-foreground text-lg">Every story you've experienced at Cineplex Premiere.</p>
          </div>
        </div>

        <MovieGrid title="Watched Movies" movies={movies.slice(0, 3)} />
      </main>
    </div>
  );
}
