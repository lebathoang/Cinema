import { Navbar } from "@/components/layout/Navbar";
import { MovieGrid } from "@/components/movies/MovieGrid";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { getMovies, suggestMovies, searchMovies } from "../api/movieApi";

export function MoviesList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([10, 20]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [allMovies, setAllMovies] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const itemsPerPage = 8;

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getMovies();
        setAllMovies(data);
        setMovies(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const data = await suggestMovies(searchQuery);
        setSuggestions(data);
        setIsSearchOpen(true);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    if (isSearching) return;

    let filtered = [...allMovies];
    
    if (selectedGenres.length > 0) {
      filtered = filtered.filter(movie =>
        movie.genres.some((g: string) => selectedGenres.includes(g))
      );
    }
    setMovies(filtered);
    setCurrentPage(1);
  }, [selectedGenres, priceRange, allMovies]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMovies = movies.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const totalPages = Math.ceil(movies.length / itemsPerPage);
  const allGenres = Array.from(new Set(movies.flatMap(m => m.genres)));

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setMovies(allMovies);
      setIsSearching(false);
      return;
    }
    try {
      const res = await searchMovies(searchQuery);
      setMovies(res.data);
      setIsSearching(true);
      setCurrentPage(1);
      setIsSearchOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
      </div>
    );
  }

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
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
              {isSearchOpen && suggestions.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-card border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                  {suggestions.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSearchQuery(item.title);
                        handleSearch();
                      }}
                      className="p-3 text-white hover:bg-white/10 cursor-pointer transition"
                    >
                      {item.title}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Modal */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-white/10 hover:bg-white/5 relative">
                  <SlidersHorizontal className="h-6 w-6 text-white" />
                  {(selectedGenres.length > 0 || priceRange[0] !== 10 || priceRange[1] !== 20) && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full border-2 border-background" />
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-white/10 text-white max-w-md rounded-3xl">
                <DialogHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
                  <DialogTitle className="font-display text-3xl uppercase tracking-tight">Filters</DialogTitle>
                </DialogHeader>

                <div className="py-6 space-y-8">
                  {/* Genre Section */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Genres</h4>
                    <div className="flex flex-wrap gap-2">
                      {allGenres.map(genre => (
                        <button
                          key={genre}
                          onClick={() => toggleGenre(genre)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                            selectedGenres.includes(genre)
                              ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                              : "bg-white/5 border-white/5 text-muted-foreground hover:border-white/20 hover:text-white"
                          )}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range Section */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Price Range</h4>
                      <span className="text-sm font-medium text-white">${priceRange[0]} - ${priceRange[1]}</span>
                    </div>
                    <Slider
                      defaultValue={[10, 20]}
                      max={30}
                      step={1}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="py-4"
                    />
                  </div>

                  {/* Ratings Mockup */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Age Rating</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {["G", "PG", "PG-13", "R", "NC-17"].map(rating => (
                        <div key={rating} className="flex items-center space-x-2 bg-white/5 p-3 rounded-xl border border-white/5">
                          <Checkbox id={rating} className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                          <label htmlFor={rating} className="text-xs font-bold text-white cursor-pointer">{rating}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <Button
                    variant="ghost"
                    className="flex-1 rounded-2xl text-muted-foreground hover:text-white"
                    onClick={() => {
                      setSelectedGenres([]);
                      setPriceRange([10, 20]);
                    }}
                  >
                    Reset
                  </Button>
                  <DialogClose asChild>
                    <Button className="flex-1 rounded-2xl bg-primary text-primary-foreground font-bold h-12 shadow-xl shadow-primary/10">
                      Apply Filters
                    </Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Categories / Quick Filters (Existing) */}
        <div className="flex gap-3 overflow-x-auto pb-8 mb-4 scrollbar-hide">
          {["All", ...allGenres].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                if (cat === "All") setSelectedGenres([]);
                else toggleGenre(cat);
              }}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap border",
                (cat === "All" && selectedGenres.length === 0) || selectedGenres.includes(cat)
                  ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 border-white/5"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        {movies.length > 0 ? (
          <>
            <MovieGrid title={searchQuery ? `Results for "${searchQuery}"` : "All Movies"} movies={paginatedMovies} />

            {/* Pagination */}
            <div className="mt-20 flex items-center justify-center gap-2">
              <Button variant="outline" className="h-12 w-12 rounded-xl border-white/10 text-muted-foreground" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
                <ChevronRight className="h-5 w-5 rotate-180" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  variant={page === currentPage ? "default" : "outline"}
                  className={cn(
                    "h-12 w-12 rounded-xl font-display text-lg",
                    page === currentPage ? "bg-primary text-primary-foreground" : "border-white/10 text-muted-foreground hover:text-white"
                  )}
                >
                  {page}
                </Button>
              ))}
              <Button variant="outline" className="h-12 w-12 rounded-xl border-white/10 text-muted-foreground" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </>
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
            <Button variant="link" onClick={() => {
              setSearchQuery("");
              setSelectedGenres([]);
              setPriceRange([10, 20]);
            }} className="text-primary font-bold">
              Clear all filters
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
