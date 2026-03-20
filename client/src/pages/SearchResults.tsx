import { Navbar } from "@/components/layout/Navbar";
import { useEffect, useState } from "react";
import { searchMovies } from "@/api/movieApi";
// import { useLocation } from "wouter";
import { MovieGrid } from "@/components/movies/MovieGrid";
import { Search } from "lucide-react";

export function SearchResults() {

  // const [location] = useLocation();
  // const searchPart = typeof location === 'string' && location.includes('?') ? location.split('?')[1] : "";
  const queryParams = new URLSearchParams(window.location.search);
  const query = queryParams.get("q") || "";

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     console.log("Query hiện tại:", query);
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const data = await searchMovies(query);
        console.log("API result:", data);
        setMovies(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (query) fetchMovies();
  }, [query]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <main className="pt-32 container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-2">
            <h1 className="text-5xl font-display text-white uppercase tracking-tight">Search Results</h1>
            <p className="text-muted-foreground text-lg">
              Showing results for "<span className="text-primary font-bold">{query}</span>"
            </p>
          </div>
        </div>
        {movies.length > 0 ? (
          <MovieGrid title="" movies={movies} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-display text-white uppercase">No movies found</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We couldn't find any movies matching your search. Try different keywords or browse our full catalog.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
