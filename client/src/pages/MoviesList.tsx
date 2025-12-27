import { Navbar } from "@/components/layout/Navbar";
import { MovieGrid } from "@/components/movies/MovieGrid";
import { movies } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function MoviesList() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movie.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <main className="pt-32 container mx-auto px-4">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-display text-white uppercase tracking-tight">Movies</h1>
            <p className="text-muted-foreground text-lg">Discover the latest blockbusters and indie gems.</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search movies, genres..." 
                className="pl-12 h-14 bg-card/50 border-white/10 rounded-2xl focus:border-primary/50 transition-all text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-white/10 hover:bg-white/5">
              <SlidersHorizontal className="h-6 w-6 text-white" />
            </Button>
          </div>
        </div>

        {/* Categories / Filters */}
        <div className="flex gap-3 overflow-x-auto pb-8 mb-4 scrollbar-hide">
          {["All", "Action", "Sci-Fi", "Drama", "Thriller", "Horror", "Comedy"].map((cat) => (
            <button 
              key={cat}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                cat === "All" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 border border-white/5"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        {filteredMovies.length > 0 ? (
          <MovieGrid title={searchQuery ? `Search Results for "${searchQuery}"` : "Explore All Movies"} movies={filteredMovies} />
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center space-y-4"
          >
            <div className="inline-flex h-20 w-20 rounded-full bg-white/5 items-center justify-center mb-4">
              <Search className="h-10 w-10 text-muted-foreground opacity-20" />
            </div>
            <h3 className="text-2xl font-display text-white">No movies found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
            <Button variant="link" onClick={() => setSearchQuery("")} className="text-primary font-bold">
              Clear all filters
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}

// Helper local cn if needed or import
import { cn } from "@/lib/utils";
