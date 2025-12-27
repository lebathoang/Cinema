import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Armchair, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const ROWS = 8;
const COLS = 12;
const PRICE = 14.99;

const OCCUPIED = ["1-4", "1-5", "2-4", "2-5", "2-6", "5-2", "5-3", "6-8", "6-9"];

interface SeatSelectorProps {
  onBooking: (count: number, total: number) => void;
}

export function SeatSelector({ onBooking }: SeatSelectorProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const { toast } = useToast();

  const toggleSeat = (seatId: string) => {
    if (OCCUPIED.includes(seatId)) return;

    setSelectedSeats((prev) => {
      let newSelection;
      if (prev.includes(seatId)) {
        newSelection = prev.filter((id) => id !== seatId);
      } else {
        if (prev.length >= 8) {
          toast({
            title: "Limit Reached",
            description: "You can only select up to 8 seats.",
            variant: "destructive",
          });
          return prev;
        }
        newSelection = [...prev, seatId];
      }
      
      onBooking(newSelection.length, newSelection.length * PRICE);
      return newSelection;
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      {/* Screen Visualization */}
      <div className="mb-20 relative">
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-full shadow-[0_0_20px_rgba(255,165,0,0.3)]" />
        <div className="h-24 w-full bg-gradient-to-b from-primary/10 to-transparent blur-3xl -mt-2 opacity-40" />
        <p className="text-center text-[10px] text-primary font-bold tracking-[0.5em] uppercase mt-4 animate-pulse">Cinematic Screen</p>
      </div>

      {/* Seats Grid */}
      <div className="flex flex-col gap-4 items-center mb-12">
        {Array.from({ length: ROWS }).map((_, row) => (
          <div key={row} className="flex gap-2 items-center">
            <span className="w-6 text-[10px] font-bold text-muted-foreground mr-4 text-right opacity-50">{String.fromCharCode(65 + row)}</span>
            
            <div className="flex gap-2">
              {Array.from({ length: COLS }).map((_, col) => {
                const seatId = `${row}-${col}`;
                const isOccupied = OCCUPIED.includes(seatId);
                const isSelected = selectedSeats.includes(seatId);
                const isAisle = col === 2 || col === 9;

                return (
                  <div key={seatId} className={cn("flex", isAisle && (col === 2 ? "mr-8" : "ml-8"))}>
                    <motion.button
                      whileHover={!isOccupied ? { scale: 1.25, y: -4 } : {}}
                      whileTap={!isOccupied ? { scale: 0.95 } : {}}
                      onClick={() => toggleSeat(seatId)}
                      disabled={isOccupied}
                      className={cn(
                        "relative group p-0 w-6 h-7 sm:w-8 sm:h-9 transition-all duration-300 rounded-t-lg flex items-center justify-center",
                        isOccupied 
                          ? "bg-white/[0.03] text-white/5 cursor-not-allowed" 
                          : isSelected
                            ? "bg-primary text-primary-foreground shadow-[0_0_25px_rgba(255,165,0,0.6)] z-10"
                            : "bg-secondary/40 text-transparent hover:bg-secondary/80 hover:text-white/20 border border-white/5"
                      )}
                    >
                      <Armchair className={cn(
                        "w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300",
                        isSelected ? "scale-110 rotate-0" : "scale-100"
                      )} />
                      
                      {!isOccupied && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 pointer-events-none whitespace-nowrap z-50">
                          {String.fromCharCode(65 + row)}{col + 1}
                        </div>
                      )}

                      <div className={cn(
                        "absolute bottom-0 w-full h-1 rounded-b-sm transition-colors",
                        isSelected ? "bg-primary-foreground/40" : "bg-black/30"
                      )} />
                    </motion.button>
                  </div>
                );
              })}
            </div>

            <span className="w-6 text-[10px] font-bold text-muted-foreground ml-4 opacity-50">{String.fromCharCode(65 + row)}</span>
          </div>
        ))}
      </div>

      {/* Info & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end border-t border-white/5 pt-12">
        {/* Legend */}
        <div className="flex flex-wrap gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm self-start">
          <div className="flex items-center gap-3">
            <div className="w-5 h-6 rounded-t-md bg-secondary/40 border border-white/5" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Available</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-6 rounded-t-md bg-primary shadow-[0_0_15px_rgba(255,165,0,0.4)]" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Selected</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-6 rounded-t-md bg-white/[0.03] flex items-center justify-center">
              <Armchair className="w-3 h-3 text-white/5" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Reserved</span>
          </div>
        </div>

        {/* Selected Summary Card */}
        <AnimatePresence>
          {selectedSeats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-card border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-primary/20 transition-colors" />
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1">Selected Seats</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSeats.map(id => {
                      const [r, c] = id.split('-').map(Number);
                      return (
                        <span key={id} className="text-xl font-display text-white">
                          {String.fromCharCode(65 + r)}{c + 1}
                        </span>
                      );
                    }).reduce((prev: any, curr: any) => [prev, <span key={`sep-${curr.key}`} className="text-white/20">, </span>, curr])}
                  </div>
                </div>
                <div className="text-right">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Subtotal</h4>
                  <p className="text-3xl font-display font-bold text-white">${(selectedSeats.length * PRICE).toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-6 bg-white/5 p-2 rounded-lg">
                <Info className="h-3 w-3 text-primary" />
                <span>Ticket price includes 10% VAT and service charge.</span>
              </div>

              <Button className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-black text-lg hover:bg-primary/90 transition-all active:scale-[0.98] group">
                PROCEED TO CHECKOUT
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
