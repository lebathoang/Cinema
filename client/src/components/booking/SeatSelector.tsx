import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Armchair, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSeatLayout, holdSeats, type SeatLayoutSeat } from "@/api/bookingApi";
import { DEFAULT_TICKET_PRICE, formatHoldCountdown, formatVndCurrency, MAX_SELECTABLE_SEATS } from "@/lib/seatLayout";

interface SeatSelectorProps {
  onBooking: (booking: { count: number; total: number; seats: string[]; seatIds: number[]; expiresAt: string | null }) => void;
  onProceedToCheckout: (selectedSeats: string[], seatIds: number[]) => void;
  showTimeId: number | null;
  pricePerSeat?: number;
}

const getSeatLabel = (seat: Pick<SeatLayoutSeat, "seat_row" | "seat_number">) =>
  `${seat.seat_row}${seat.seat_number}`;

export function SeatSelector({
  onBooking,
  onProceedToCheckout,
  showTimeId,
  pricePerSeat = DEFAULT_TICKET_PRICE,
}: SeatSelectorProps) {
  const [layout, setLayout] = useState<SeatLayoutSeat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<SeatLayoutSeat[]>([]);
  const [loadingLayout, setLoadingLayout] = useState(false);
  const [holdExpiresAt, setHoldExpiresAt] = useState<string | null>(null);
  const [pendingSeatIds, setPendingSeatIds] = useState<number[]>([]);
  const [conflictSeatIds, setConflictSeatIds] = useState<number[]>([]);
  const { toast } = useToast();
  const selectedSeatsRef = useRef<SeatLayoutSeat[]>([]);
  const holdQueueRef = useRef(Promise.resolve());

  useEffect(() => {
    selectedSeatsRef.current = selectedSeats;
  }, [selectedSeats]);

  const applyOptimisticSelection = (seatIds: number[], expiresAt: string | null) => {
    setLayout((currentLayout) =>
      currentLayout.map((seat) =>
        seatIds.includes(seat.id)
          ? {
              ...seat,
              status: "selected",
              isMine: true,
              expiresAt,
            }
          : seat
      )
    );
  };

  const markConflictSeats = (seatIds: number[]) => {
    if (seatIds.length === 0) {
      return;
    }

    setConflictSeatIds(seatIds);
    window.setTimeout(() => {
      setConflictSeatIds((currentIds) =>
        currentIds.filter((currentId) => !seatIds.includes(currentId))
      );
    }, 2200);
  };

  const syncBooking = (seats: SeatLayoutSeat[], expiresAt: string | null) => {
    onBooking({
      count: seats.length,
      total: seats.length * pricePerSeat,
      seats: seats.map(getSeatLabel),
      seatIds: seats.map((seat) => seat.id),
      expiresAt,
    });
  };

  const groupedRows = useMemo(() => {
    const grouped = layout.reduce<Record<string, SeatLayoutSeat[]>>((accumulator, seat) => {
      if (!accumulator[seat.seat_row]) {
        accumulator[seat.seat_row] = [];
      }

      accumulator[seat.seat_row].push(seat);
      return accumulator;
    }, {});

    return Object.entries(grouped)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([rowLabel, seats]) => ({
        rowLabel,
        seats: seats.sort((left, right) => left.seat_number - right.seat_number),
      }));
  }, [layout]);

  const maxSeatNumber = useMemo(
    () => layout.reduce((maxValue, seat) => Math.max(maxValue, seat.seat_number), 0),
    [layout]
  );

  const aisleAfterColumn = useMemo(() => {
    if (maxSeatNumber <= 1) {
      return null;
    }

    return Math.ceil(maxSeatNumber / 2);
  }, [maxSeatNumber]);

  const loadSeatLayout = async (
    preserveCurrentSelection = false,
    preservedSeatIds: number[] = []
  ) => {
    if (!showTimeId) {
      setLayout([]);
      setSelectedSeats([]);
      setHoldExpiresAt(null);
      syncBooking([], null);
      return;
    }

    setLoadingLayout(true);

    try {
      const response = await getSeatLayout(showTimeId);
      const seats = response.seats || [];
      const mySeats = seats.filter((seat) => seat.status === "selected" && seat.isMine);
      const locallySelectedSeatIds = preserveCurrentSelection && preservedSeatIds.length > 0
        ? preservedSeatIds
        : selectedSeats.map((selectedSeat) => selectedSeat.id);
      const nextSelectedSeats = preserveCurrentSelection
        ? seats.filter((seat) => {
            if (!locallySelectedSeatIds.includes(seat.id)) {
              return false;
            }

            if (seat.status === "booked") {
              return false;
            }

            if (seat.status === "selected" && seat.isMine === false) {
              return false;
            }

            return true;
          })
        : mySeats;

      const nextExpiresAt = mySeats
        .map((seat) => seat.expiresAt)
        .filter(Boolean)
        .sort()
        .at(-1) || holdExpiresAt || null;

      setLayout(seats);
      setSelectedSeats(nextSelectedSeats);
      setHoldExpiresAt(nextExpiresAt);
      syncBooking(nextSelectedSeats, nextExpiresAt);
    } catch (error) {
      toast({
        title: "Seat layout unavailable",
        description: error instanceof Error ? error.message : "Failed to load seat layout.",
        variant: "destructive",
      });
    } finally {
      setLoadingLayout(false);
    }
  };

  const refreshAndResolveConflicts = async (attemptedSeatIds: number[]) => {
    if (!showTimeId) {
      return [];
    }

    try {
      const response = await getSeatLayout(showTimeId);
      const seats = response.seats || [];
      const conflictingSeatIds = seats
        .filter(
          (seat) =>
            attemptedSeatIds.includes(seat.id) &&
            (seat.status === "booked" || (seat.status === "selected" && !seat.isMine))
        )
        .map((seat) => seat.id);
      const mySeats = seats.filter(
        (seat) =>
          attemptedSeatIds.includes(seat.id) &&
          !conflictingSeatIds.includes(seat.id) &&
          seat.status === "selected"
      );
      const nextExpiresAt = mySeats
        .map((seat) => seat.expiresAt)
        .filter(Boolean)
        .sort()
        .at(-1) || holdExpiresAt || null;

      setLayout(seats);
      setSelectedSeats(mySeats);
      setHoldExpiresAt(nextExpiresAt);
      syncBooking(mySeats, nextExpiresAt);
      markConflictSeats(conflictingSeatIds);

      return conflictingSeatIds;
    } catch {
      return [];
    }
  };

  useEffect(() => {
    loadSeatLayout();
  }, [showTimeId]);

  useEffect(() => {
    if (!showTimeId) {
      return;
    }

    const interval = window.setInterval(() => {
      loadSeatLayout(true, selectedSeats.map((seat) => seat.id));
    }, 15000);

    return () => window.clearInterval(interval);
  }, [showTimeId, selectedSeats]);

  const toggleSeat = (seat: SeatLayoutSeat) => {
    if (!showTimeId) {
      return;
    }

    if (!localStorage.getItem("token")) {
      toast({
        title: "Login required",
        description: "Please sign in before selecting seats.",
        variant: "destructive",
      });
      return;
    }

    if (seat.status === "booked" || (seat.status === "selected" && !seat.isMine)) {
      markConflictSeats([seat.id]);
      return;
    }

    if (seat.status === "selected" && seat.isMine) {
      toast({
        title: "Seat already held",
        description: "Held seats remain reserved until payment succeeds or the 15-minute hold expires.",
      });
      return;
    }

    if (
      selectedSeatsRef.current.some((selectedSeat) => selectedSeat.id === seat.id) ||
      pendingSeatIds.includes(seat.id)
    ) {
      toast({
        title: "Seat already in your hold",
        description: "This API flow only adds seats into the current hold.",
      });
      return;
    }

    if (selectedSeatsRef.current.length + pendingSeatIds.length >= MAX_SELECTABLE_SEATS) {
      toast({
        title: "Limit Reached",
        description: "You can only select up to 8 seats.",
        variant: "destructive",
      });
      return;
    }

    setPendingSeatIds((currentSeatIds) => [...currentSeatIds, seat.id]);

    holdQueueRef.current = holdQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        const nextSelectedSeats = [...selectedSeatsRef.current, seat].sort((left, right) => {
          if (left.seat_row === right.seat_row) {
            return left.seat_number - right.seat_number;
          }

          return left.seat_row.localeCompare(right.seat_row);
        });

        try {
          const result = await holdSeats({
            showTimeId,
            seatIds: nextSelectedSeats.map((selectedSeat) => selectedSeat.id),
          });
          const expiresAt = result.expiresAt || null;

          applyOptimisticSelection(
            nextSelectedSeats.map((selectedSeat) => selectedSeat.id),
            expiresAt
          );
          setSelectedSeats(nextSelectedSeats);
          selectedSeatsRef.current = nextSelectedSeats;
          setHoldExpiresAt(expiresAt);
          syncBooking(nextSelectedSeats, expiresAt);

          if (expiresAt) {
            sessionStorage.setItem("pending-booking-expires-at", expiresAt);
          }

          await loadSeatLayout(
            true,
            nextSelectedSeats.map((selectedSeat) => selectedSeat.id)
          );
        } catch (error) {
          const attemptedSeatIds = [...selectedSeatsRef.current, seat].map(
            (selectedSeat) => selectedSeat.id
          );

          refreshAndResolveConflicts(attemptedSeatIds).then((conflictingSeatIds) => {
            const conflictLabels = layout
              .filter((layoutSeat) => conflictingSeatIds.includes(layoutSeat.id))
              .map(getSeatLabel);

            toast({
              title: "Seat hold failed",
              description:
                conflictLabels.length > 0
                  ? `These seats were just taken: ${conflictLabels.join(", ")}.`
                  : error instanceof Error
                    ? error.message
                    : "Could not reserve those seats.",
              variant: "destructive",
            });
          });
        } finally {
          setPendingSeatIds((currentSeatIds) =>
            currentSeatIds.filter((currentSeatId) => currentSeatId !== seat.id)
          );
        }
      });
  };

  const holdCountdown = useMemo(() => formatHoldCountdown(holdExpiresAt), [holdExpiresAt]);
  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 overflow-y-auto max-h-[70vh] scrollbar-hide">
      <div className="mb-20 relative pt-10">
        <div className="h-1.5 w-full bg-linear-to-r from-transparent via-primary/40 to-transparent rounded-full shadow-[0_0_20px_rgba(255,165,0,0.3)]" />
        <div className="h-24 w-full bg-linear-to-b from-primary/10 to-transparent blur-3xl -mt-2 opacity-40" />
        <p className="text-center text-[10px] text-primary font-bold tracking-[0.5em] uppercase mt-4 animate-pulse">Cinematic Screen</p>
      </div>

      <div className="flex flex-col gap-3 items-center mb-12 overflow-x-auto pb-2">
        {groupedRows.map(({ rowLabel, seats }) => (
          <div key={rowLabel} className="flex items-center gap-3 min-w-max">
            <span className="w-5 text-[10px] font-bold text-muted-foreground text-right opacity-60">{rowLabel}</span>

            <div className="flex items-center gap-2">
              {Array.from({ length: maxSeatNumber }).map((_, index) => {
                const seatNumber = index + 1;
                const seat = seats.find((item) => item.seat_number === seatNumber);
                const isPending = seat ? pendingSeatIds.includes(seat.id) : false;
                const isOccupied = seat ? seat.status === "booked" || (seat.status === "selected" && !seat.isMine) : false;
                const isSelected = seat
                  ? selectedSeats.some((selectedSeat) => selectedSeat.id === seat.id) || (seat.status === "selected" && !!seat.isMine)
                  : false;
                const isConflict = seat ? conflictSeatIds.includes(seat.id) : false;
                const insertAisle = aisleAfterColumn !== null && seatNumber === aisleAfterColumn + 1;

                if (!seat) {
                  return (
                    <div
                      key={`${rowLabel}-${seatNumber}`}
                      className={cn("w-8 sm:w-10", insertAisle && "ml-4 sm:ml-6")}
                    />
                  );
                }

                return (
                  <div key={seat.id} className={cn(insertAisle && "ml-4 sm:ml-6")}>
                    <motion.button
                      whileHover={!isOccupied ? { scale: 1.2, y: -4 } : {}}
                      whileTap={!isOccupied ? { scale: 0.95 } : {}}
                      onClick={() => toggleSeat(seat)}
                      disabled={isOccupied || isPending}
                      className={cn(
                        "relative group p-0 w-8 h-9 sm:w-10 sm:h-11 transition-all duration-300 rounded-t-[10px] flex items-center justify-center shrink-0",
                        isConflict && "ring-2 ring-red-500/80 bg-red-500/15 text-red-100 animate-pulse",
                        isPending && "opacity-70 cursor-wait",
                        isOccupied
                          ? "bg-white/3 text-white/5 cursor-not-allowed"
                          : isSelected
                            ? "bg-primary text-primary-foreground shadow-[0_0_25px_rgba(255,165,0,0.6)] z-10"
                            : "bg-secondary/40 text-transparent hover:bg-secondary/80 hover:text-white/20 border border-white/5"
                      )}
                    >
                      <Armchair
                        className={cn(
                          "w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300",
                          isSelected ? "scale-110" : "scale-100"
                        )}
                      />

                      {!isOccupied && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 pointer-events-none whitespace-nowrap z-50">
                          {getSeatLabel(seat)}
                        </div>
                      )}

                      <div
                        className={cn(
                          "absolute bottom-0 w-full h-1 rounded-b-sm transition-colors",
                          isSelected ? "bg-primary-foreground/40" : "bg-black/30"
                        )}
                      />
                    </motion.button>
                  </div>
                );
              })}
            </div>

            <span className="w-5 text-[10px] font-bold text-muted-foreground opacity-60">{rowLabel}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end border-t border-white/5 pt-12">
        <div className="flex flex-wrap gap-6 p-6 rounded-2xl bg-white/2 border border-white/5 backdrop-blur-sm self-start">
          <div className="flex items-center gap-3">
            <div className="w-5 h-6 rounded-t-md bg-secondary/40 border border-white/5" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Available</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-6 rounded-t-md bg-primary shadow-[0_0_15px_rgba(255,165,0,0.4)]" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Selected</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-6 rounded-t-md bg-white/3 flex items-center justify-center">
              <Armchair className="w-3 h-3 text-white/5" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Reserved</span>
          </div>
        </div>

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
                  <div className="flex flex-wrap gap-1">
                    {selectedSeats.map((seat, index) => (
                      <span key={seat.id} className="text-xl font-display text-white">
                        {getSeatLabel(seat)}{index < selectedSeats.length - 1 ? "," : ""}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Subtotal</h4>
                  <p className="text-3xl font-display font-bold text-white">{formatVndCurrency(selectedSeats.length * pricePerSeat)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-6 bg-white/5 p-2 rounded-lg">
                <Info className="h-3 w-3 text-primary" />
                <span>
                  {holdCountdown ? `Seat hold expires in ${holdCountdown}.` : "Ticket price includes 10% VAT and service charge."}
                </span>
              </div>

              <Button
                className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-black text-lg hover:bg-primary/90 transition-all active:scale-[0.98] group"
                onClick={() => onProceedToCheckout(selectedSeats.map(getSeatLabel), selectedSeats.map((seat) => seat.id))}
                disabled={loadingLayout || pendingSeatIds.length > 0}
              >
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
