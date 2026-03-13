import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Star, Clock } from "lucide-react";

export function MovieGrid({ title, movies }: any) {
  return (
    <section className="py-16 container mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl md:text-4xl font-display text-white">{title}</h2>
        <Link href="/movies" className="text-primary hover:text-primary/80 text-sm font-medium tracking-wide border-b border-primary/30 pb-0.5">
          VIEW ALL
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {movies.map((movie: any, idx: any) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link href={`/movie/${movie.id}`}>
              <Card className="group bg-transparent border-0 overflow-hidden cursor-pointer">
                <CardContent className="p-0 relative">
                  {/* Poster Image */}
                  <div className="aspect-[2/3] relative overflow-hidden rounded-xl bg-muted">
                    <img 
                      src={movie.poster_url} 
                      alt={movie.title}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4 p-4 text-center">
                      <Button className="w-full bg-primary text-primary-foreground font-bold hover:bg-primary/90">
                        Book Now
                      </Button>
                      <p className="text-white/80 text-sm">{movie.description.substring(0, 60)}...</p>
                    </div>
                    {/* Rating Badge */}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 text-xs font-bold text-white">
                      {movie.age_rating}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mt-4 space-y-1">
                    <h3 className="font-display text-xl text-white group-hover:text-primary transition-colors">
                      {movie.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{movie.duration}</span>
                      </div>
                      <span className="text-white/60">{movie.genres[0]}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
