import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  CreditCard,
  Ticket,
  ShieldCheck,
  MapPin,
  Clock,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Tag,
  Info,
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { getMovieDetail } from "@/api/movieApi";
import { getOffers } from "@/api/cinemaApi";

const extractNumericValue = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const match = value.match(/-?\d+(\.\d+)?/);
    return match ? Number(match[0]) : null;
  }

  return null;
};

const getOfferDiscountAmount = (offer: any, subtotal: number) => {
  if (!offer || subtotal <= 0) {
    return 0;
  }

  const percentSources = [
    offer.discount_percent,
    offer.discountPercentage,
    offer.percentage,
    offer.percent,
  ];

  for (const source of percentSources) {
    const percentValue = extractNumericValue(source);

    if (percentValue && percentValue > 0) {
      return (subtotal * percentValue) / 100;
    }
  }

  const amountSources = [
    offer.discount_amount,
    offer.discountAmount,
    offer.amount,
    offer.value,
    offer.discount_value,
  ];

  for (const source of amountSources) {
    const amountValue = extractNumericValue(source);

    if (amountValue && amountValue > 0) {
      return amountValue;
    }
  }

  const textSources = [
    offer.discount,
    offer.discount_text,
    offer.description,
    offer.title,
  ]
    .filter(Boolean)
    .join(" ");

  const percentMatch = textSources.match(/(\d+(?:\.\d+)?)\s*%/);
  if (percentMatch) {
    return (subtotal * Number(percentMatch[1])) / 100;
  }

  const amountMatch = textSources.match(/\$?\s*(\d+(?:\.\d+)?)\s*(?:off|discount)/i);
  if (amountMatch) {
    return Number(amountMatch[1]);
  }

  return 0;
};

export function Checkout() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [movie, setMovie] = useState<any>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState(true);
  // get movie detail by id to movie detail page
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const data = await getMovieDetail(params.id!);
        setMovie(data);
      } catch (error) {
        console.error(error);
        setMovie(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [params.id]);
  // get list offers
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const data = await getOffers();
        const checkoutOffers = Array.isArray(data)
          ? data.filter((offer: any) => offer.code && String(offer.code).trim())
          : [];

        setOffers(checkoutOffers);
        setSelectedOffer(checkoutOffers[0] ?? null);
      } catch (error) {
        console.error(error);
        setOffers([]);
        setSelectedOffer(null);
      } finally {
        setOffersLoading(false);
      }
    };

    fetchOffers();
  }, []);
  // get seat booking to local storage
  useEffect(() => {
    const rawBooking = sessionStorage.getItem("pending-booking");

    if (!rawBooking) {
      setBookingData(null);
      return;
    }

    try {
      const parsedBooking = JSON.parse(rawBooking);

      if (String(parsedBooking.movieId) === String(params.id)) {
        setBookingData(parsedBooking);
      } else {
        setBookingData(null);
      }
    } catch (error) {
      console.error(error);
      setBookingData(null);
    }
  }, [params.id]);

  const selectedSeats = bookingData?.selectedSeats ?? [];
  const pricePerSeat = bookingData?.pricePerSeat ?? 14.99;
  const subtotal = selectedSeats.length * pricePerSeat;
  const bookingFee = selectedSeats.length > 0 ? 2.5 : 0;
  const discount = Math.min(getOfferDiscountAmount(selectedOffer, subtotal), subtotal + bookingFee);
  const total = Math.max(subtotal + bookingFee - discount, 0);

  const selectedShowtime = bookingData?.selectedTime ? new Date(bookingData.selectedTime) : null;
  const formattedDate = selectedShowtime
    ? selectedShowtime.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "2-digit",
      })
    : bookingData?.selectedDate || "TBA";
  const formattedTime = selectedShowtime
    ? selectedShowtime.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "TBA";

  if (loading || offersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-white"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Navbar />

        <main className="container mx-auto px-4 pt-32">
          <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-card p-8 text-center space-y-4">
            <h1 className="text-4xl font-display uppercase tracking-tight text-white">Checkout</h1>
            <p className="text-muted-foreground">
              We could not load the movie information for this checkout page.
            </p>
            <Button onClick={() => setLocation("/movies")} className="rounded-xl font-semibold">
              Back to Movies
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <main className="container mx-auto px-4 pt-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
              <Ticket className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-4xl font-display uppercase tracking-tight text-white">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-8 rounded-3xl border border-white/10 bg-card p-8 md:flex-row"
              >
                <div className="aspect-[2/3] w-full flex-shrink-0 overflow-hidden rounded-xl md:w-32">
                  <img src={movie.poster_url} alt={movie.title} className="h-full w-full object-cover" />
                </div>

                <div className="flex-1 space-y-6">
                  <div>
                    <h2 className="mb-2 text-3xl font-display text-white">{movie.title}</h2>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {Array.isArray(movie.genres) &&
                        movie.genres.map((genre: string) => (
                          <span
                            key={genre}
                            className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md"
                          >
                            {genre}
                          </span>
                        ))}
                      <span>{movie.duration} min</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Date</p>
                      <div className="flex items-center gap-2 text-white">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{formattedDate}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Time</p>
                      <div className="flex items-center gap-2 text-white">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{formattedTime}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Cinema</p>
                      <div className="flex items-center gap-2 text-white">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {bookingData?.selectedCinema?.name || bookingData?.hall || "Hall 04"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Seats</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.length > 0 ? (
                        selectedSeats.map((seat: string) => (
                          <span
                            key={seat}
                            className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-white"
                          >
                            {seat}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No seats selected yet</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="space-y-6">
                <h3 className="text-2xl font-display uppercase tracking-tight text-white">Payment Method</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <button className="flex items-center justify-between rounded-2xl border-2 border-primary bg-white/[0.03] p-6 shadow-xl shadow-primary/5 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-white">Credit / Debit Card</p>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          Visa, Mastercard, Amex
                        </p>
                      </div>
                    </div>
                    <div className="h-5 w-5 rounded-full border-4 border-primary bg-primary-foreground" />
                  </button>

                  <button className="cursor-not-allowed flex items-center justify-between rounded-2xl border border-white/10 bg-transparent p-6 opacity-50 grayscale transition-all hover:border-white/20">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-muted-foreground">
                        <Ticket className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-white">Digital Wallet</p>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          Apple Pay, Google Pay
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-6 rounded-3xl border border-white/5 bg-card/50 p-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Card Number
                  </label>
                  <div className="flex h-14 items-center rounded-xl border border-white/10 bg-white/[0.03] px-4 text-white/40">
                    **** **** **** 4242
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Expiry Date
                    </label>
                    <div className="flex h-14 items-center rounded-xl border border-white/10 bg-white/[0.03] px-4 text-white/40">
                      MM / YY
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      CVV
                    </label>
                    <div className="flex h-14 items-center rounded-xl border border-white/10 bg-white/[0.03] px-4 text-white/40">
                      ***
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-display uppercase tracking-tight text-white">Available Offers</h3>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                    {offers.length} Offers Found
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {offers.map((offer) => {
                    const previewDiscount = getOfferDiscountAmount(offer, subtotal);

                    return (
                      <button
                        key={offer.id}
                        onClick={() => setSelectedOffer(offer)}
                        className={cn(
                          "group relative overflow-hidden rounded-2xl border p-5 text-left transition-all",
                          selectedOffer?.id === offer.id
                            ? "border-primary bg-primary/5 shadow-lg shadow-primary/5"
                            : "border-white/5 bg-white/[0.02] hover:border-white/20"
                        )}
                      >
                        {selectedOffer?.id === offer.id && (
                          <div className="absolute right-0 top-0 p-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          </div>
                        )}

                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-colors",
                              selectedOffer?.id === offer.id
                                ? "bg-primary/20 text-primary"
                                : "bg-white/5 text-muted-foreground"
                            )}
                          >
                            <Tag className="h-5 w-5" />
                          </div>

                          <div>
                            <p className="mb-1 font-bold text-white">{offer.title}</p>
                            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{offer.description}</p>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded bg-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-tighter text-white">
                                {offer.code}
                              </span>
                              {previewDiscount > 0 && (
                                <span className="rounded bg-primary/10 px-2 py-1 text-[10px] font-black uppercase tracking-tighter text-primary">
                                  -${previewDiscount.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {offers.length === 0 && (
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center text-muted-foreground">
                    No promo code offers are available right now.
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-card p-8 shadow-2xl">
                  <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />

                  <h3 className="mb-8 text-2xl font-display uppercase tracking-tight text-white">Order Summary</h3>

                  <div className="mb-8 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 py-2">
                      <span className="text-muted-foreground">Tickets ({selectedSeats.length}x)</span>
                      <span className="font-medium text-white">${subtotal.toFixed(2)}</span>
                    </div>

                    <AnimatePresence mode="wait">
                      {selectedOffer && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mb-2 flex items-center justify-between rounded-xl border-b border-white/5 bg-primary/10 px-4 py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                                Offer Applied
                              </span>
                              <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-black text-primary-foreground">
                                {selectedOffer.code}
                              </span>
                            </div>
                            <span className="font-bold text-primary">
                              -{discount > 0 ? `$${discount.toFixed(2)}` : "FREE"}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between border-b border-white/5 py-2">
                      <span className="text-muted-foreground">Booking Fee</span>
                      <span className="font-medium text-white">${bookingFee.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <span className="text-xl font-display text-white">Total Amount</span>
                      <span className="text-3xl font-display font-bold text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mb-8 flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                    <ShieldCheck className="h-5 w-5 flex-shrink-0 text-green-500" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-white">Secure Payment</p>
                      <p className="text-[10px] leading-relaxed text-muted-foreground">
                        Your transaction is protected by 256-bit SSL encryption.
                      </p>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="group h-16 w-full rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-2xl shadow-primary/20 hover:bg-primary/90"
                    onClick={() => {
                      alert("Booking confirmed! Redirecting to ticket...");
                      sessionStorage.removeItem("pending-booking");
                      setLocation("/");
                    }}
                    disabled={selectedSeats.length === 0}
                  >
                    PAY NOW
                    <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>

                  <div className="mt-6 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    <Info className="h-3 w-3" />
                    <span>Refunds available up to 2 hours before show</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
