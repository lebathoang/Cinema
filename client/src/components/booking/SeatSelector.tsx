import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const ROWS = 8;
const COLS = 10;
const PRICE = 14.99;

// Mock occupied seats
const OCCUPIED = ["3-4", "3-5", "4-4", "4-5", "4-6", "6-2", "6-3"];

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
    <div className="w-full max-w-3xl mx-auto">
      {/* Screen */}
      <div className="mb-12 relative">
        <div className="h-2 w-3/4 mx-auto bg-white/20 rounded-full shadow-[0_10px_30px_rgba(255,255,255,0.1)] mb-4" />
        <p className="text-center text-xs text-muted-foreground tracking-[0.2em] uppercase">Screen</p>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-gradient-to-b from-white/5 to-transparent blur-xl -z-10" />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mb-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-secondary" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted-foreground/20" />
          <span>Occupied</span>
        </div>
      </div>

      {/* Seats Grid */}
      <div className="grid gap-y-3 gap-x-1.5 justify-center mb-8">
        {Array.from({ length: ROWS }).map((_, row) => (
          <div key={row} className="flex gap-1.5 items-center">
            <span className="w-6 text-xs text-muted-foreground text-right mr-2">{String.fromCharCode(65 + row)}</span>
            {Array.from({ length: COLS }).map((_, col) => {
              const seatId = `${row}-${col}`;
              const isOccupied = OCCUPIED.includes(seatId);
              const isSelected = selectedSeats.includes(seatId);
              
              // Add a gap for the aisle
              const isAisle = col === 2 || col === 7;

              return (
                <div key={`${seatId}-wrapper`} className={cn(isAisle && "mr-8")}>
                  <button
                    onClick={() => toggleSeat(seatId)}
                    disabled={isOccupied}
                    aria-label={`Seat ${String.fromCharCode(65 + row)}${col + 1}`}
                    className={cn(
                      "seat w-7 h-7 sm:w-8 sm:h-8 rounded-t-lg rounded-b-sm text-[10px] flex items-center justify-center transition-all duration-200 transform hover:scale-105",
                      isOccupied 
                        ? "bg-white/10 text-transparent cursor-not-allowed" 
                        : "bg-secondary hover:bg-white/20 text-transparent",
                      isSelected && "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(255,165,0,0.4)] scale-105 font-bold"
                    )}
                  >
                    {col + 1}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
