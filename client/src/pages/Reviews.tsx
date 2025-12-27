import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { Star, MessageSquare, Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function Reviews() {
  const reviews = [
    {
      id: 1,
      movie: "Nebula",
      rating: 5,
      date: "Oct 25, 2025",
      content: "An absolute masterpiece of visual storytelling. The IMAX experience was mind-blowing!"
    },
    {
      id: 2,
      movie: "Velocity",
      rating: 4,
      date: "Oct 20, 2025",
      content: "Great action sequences, though the plot was a bit predictable. Still highly recommended."
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <main className="pt-32 container mx-auto px-4 max-w-4xl">
        <div className="space-y-2 mb-12">
          <h1 className="text-5xl font-display text-white uppercase tracking-tight">My Reviews</h1>
          <p className="text-muted-foreground text-lg">Your thoughts on the silver screen.</p>
        </div>

        <div className="space-y-6">
          {reviews.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-card border-white/10 rounded-3xl overflow-hidden hover:border-primary/30 transition-all">
                <CardContent className="p-8 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-display text-white uppercase tracking-tight">{review.movie}</h3>
                      <div className="flex gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? "text-primary fill-primary" : "text-white/10"}`} />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="h-3 w-3" /> {review.date}
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed italic">"{review.content}"</p>
                  <Button variant="link" className="p-0 h-auto text-primary font-bold text-xs uppercase tracking-widest">
                    EDIT REVIEW <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
