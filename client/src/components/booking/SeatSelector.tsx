import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Armchair } from "lucide-react";

const ROWS = 8;
const COLS = 12; // Increased for a more cinematic feel
const PRICE = 14.99;

// Mock occupied seats
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
    <div className="w-full max-w-4xl mx-auto py-8">
      {/* Screen Visualization */}
      <div className="mb-20 relative px-10">
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-full" />
        <div className="h-20 w-full bg-gradient-to-b from-primary/10 to-transparent blur-2xl -mt-2 opacity-50" />
        <p className="text-center text-[10px] text-primary font-bold tracking-[0.4em] uppercase mt-4">Cinematic Screen</p>
      </div>

      {/* Seats Grid */}
      <div className="flex flex-col gap-4 items-center">
        {Array.from({ length: ROWS }).map((_, row) => (
          <div key={row} className="flex gap-2 items-center">
            {/* Row Label Left */}
            <span className="w-6 text-[10px] font-bold text-muted-foreground mr-4">{String.fromCharCode(65 + row)}</span>
            
            <div className="flex gap-2">
              {Array.from({ length: COLS }).map((_, col) => {
                const seatId = `${row}-${col}`;
                const isOccupied = OCCUPIED.includes(seatId);
                const isSelected = selectedSeats.includes(seatId);
                
                // Cinematic Aisle Logic
                const isAisle = col === 2 || col === 9;

                return (
                  <div key={seatId} className={cn("flex", isAisle && (col === 2 ? "mr-8" : "ml-8"))}>
                    <motion.button
                      whileHover={!isOccupied ? { scale: 1.2, y: -2 } : {}}
                      whileTap={!isOccupied ? { scale: 0.9 } : {}}
                      onClick={() => toggleSeat(seatId)}
                      disabled={isOccupied}
                      className={cn(
                        "relative group p-0 w-6 h-7 sm:w-8 sm:h-9 transition-all duration-300 rounded-t-lg flex items-center justify-center",
                        isOccupied 
                          ? "bg-white/[0.03] text-white/5 cursor-not-allowed" 
                          : isSelected
                            ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(255,165,0,0.5)] z-10"
                            : "bg-secondary/40 text-transparent hover:bg-secondary/80 hover:text-white/20"
                      )}
                    >
                      <Armchair className={cn(
                        "w-4 h-4 sm:w-5 sm:h-5 transition-transform",
                        isSelected ? "scale-110" : "scale-100"
                      )} />
                      
                      {/* Seat ID Tooltip on Hover */}
                      {!isOccupied && (
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          {String.fromCharCode(65 + row)}{col + 1}
                        </span>
                      )}

                      {/* Seat Detail: Base of Chair */}
                      <div className={cn(
                        "absolute bottom-0 w-full h-1 rounded-b-sm",
                        isSelected ? "bg-primary-foreground/30" : "bg-black/20"
                      )} />
                    </motion.button>
                  </div>
                );
              })}
            </div>

            {/* Row Label Right */}
            <span className="w-6 text-[10px] font-bold text-muted-foreground ml-4">{String.fromCharCode(65 + row)}</span>
          </div>
        ))}
      </div>

      {/* Legend Container */}
      <div className="mt-16 flex flex-wrap items-center justify-center gap-10 p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-6 rounded-t-md bg-secondary/40 border border-white/5" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Available</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-6 rounded-t-md bg-primary shadow-[0_0_10px_rgba(255,165,0,0.3)]" />
          <span className="text-xs font-medium text-white uppercase tracking-widest">Your Choice</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-6 rounded-t-md bg-white/[0.03] flex items-center justify-center">
            <Armchair className="w-3 h-3 text-white/5" />
          </div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Reserved</span>
        </div>
      </div>
    </div>
  );
}
