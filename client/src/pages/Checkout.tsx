import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Ticket,
  ShieldCheck,
  MapPin,
  Clock,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Tag,
  Info,
  CreditCard,
  Landmark,
  BadgeCheck,
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { getMovieDetail } from "@/api/movieApi";
import { getOffers } from "@/api/cinemaApi";
import { createOnePayCheckout, createPendingBooking } from "@/api/bookingApi";
import { DEFAULT_TICKET_PRICE, formatHoldCountdown, formatVndCurrency } from "@/lib/seatLayout";
import { useToast } from "@/hooks/use-toast";
import { upsertStoredBooking } from "@/lib/bookingStore";

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

const hasPercentageHint = (offer: any) => {
  const candidateTexts = [
    offer?.discount,
    offer?.discount_text,
    offer?.description,
    offer?.title,
    offer?.terms,
    offer?.condition,
    offer?.type,
    offer?.discount_type,
    offer?.promotion_type,
    offer?.value_type,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return /%|percent|percentage|phan tram/.test(candidateTexts);
};

const getPercentageDiscount = (percentValue: number, subtotal: number) => {
  if (!Number.isFinite(percentValue) || percentValue <= 0) {
    return 0;
  }

  return (subtotal * percentValue) / 100;
};

const getOfferDiscountAmount = (offer: any, subtotal: number) => {
  if (!offer || subtotal <= 0) {
    return 0;
  }

  const percentSources = [offer.discount_percent, offer.discountPercentage, offer.percentage, offer.percent];

  for (const source of percentSources) {
    const percentValue = extractNumericValue(source);

    if (percentValue && percentValue > 0) {
      return getPercentageDiscount(percentValue, subtotal);
    }
  }

  const discountValue = extractNumericValue(offer.discount_value);
  const percentageHint = hasPercentageHint(offer);

  if (discountValue && discountValue > 0 && percentageHint && discountValue <= 100) {
    return getPercentageDiscount(discountValue, subtotal);
  }

  const amountSources = [offer.discount_amount, offer.discountAmount, offer.amount, offer.value];

  for (const source of amountSources) {
    const amountValue = extractNumericValue(source);

    if (amountValue && amountValue > 0) {
      return amountValue;
    }
  }

  const textSources = [offer.discount, offer.discount_text, offer.description, offer.title].filter(Boolean).join(" ");
  const percentMatch = textSources.match(/(\d+(?:\.\d+)?)\s*%/);
  if (percentMatch) {
    return getPercentageDiscount(Number(percentMatch[1]), subtotal);
  }

  return discountValue && discountValue > 0 ? discountValue : 0;
};

const formatShortDate = (dateString: string | null | undefined) => {
  if (!dateString) {
    return "TBA";
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
  });
};

const formatShortTime = (dateString: string | null | undefined) => {
  if (!dateString) {
    return "TBA";
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function Checkout() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [movie, setMovie] = useState<any>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState(true);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setMovie(await getMovieDetail(params.id!));
      } catch (error) {
        console.error(error);
        setMovie(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [params.id]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const data = await getOffers();
        const checkoutOffers = Array.isArray(data) ? data.filter((offer: any) => offer.code && String(offer.code).trim()) : [];

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

  useEffect(() => {
    const rawBooking = sessionStorage.getItem("pending-booking");

    if (!rawBooking) {
      setBookingData(null);
      return;
    }

    try {
      const parsedBooking = JSON.parse(rawBooking);
      setBookingData(String(parsedBooking.movieId) === String(params.id) ? parsedBooking : null);
    } catch (error) {
      console.error(error);
      setBookingData(null);
    }
  }, [params.id]);

  const selectedSeats = bookingData?.selectedSeats ?? [];
  const apiSeatIds = bookingData?.apiSeatIds ?? [];
  const pricePerSeat = bookingData?.pricePerSeat ?? DEFAULT_TICKET_PRICE;
  const subtotal = selectedSeats.length * pricePerSeat;
  const bookingFee = selectedSeats.length > 0 ? 2.5 : 0;
  const discount = Math.min(getOfferDiscountAmount(selectedOffer, subtotal), subtotal + bookingFee);
  const total = Math.max(subtotal + bookingFee - discount, 0);
  const amountDue = Math.round(total);
  const holdCountdown = useMemo(() => formatHoldCountdown(bookingData?.expiresAt), [bookingData?.expiresAt]);
  const formattedDate = formatShortDate(bookingData?.selectedTime || bookingData?.selectedDate);
  const formattedTime = formatShortTime(bookingData?.selectedTime);

  const handleCheckoutWithOnePay = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast({
        title: "Login required",
        description: "Sign in before continuing to OnePay.",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    if (!acceptedTerms) {
      toast({
        title: "Please confirm payment terms",
        description: "Bạn cần đồng ý điều khoản thanh toán trước khi chuyển sang OnePay.",
        variant: "destructive",
      });
      return;
    }

    if (!bookingData?.showtimeId || apiSeatIds.length !== selectedSeats.length || selectedSeats.length === 0) {
      toast({
        title: "Booking data incomplete",
        description: "Showtime hoặc seat mapping hiện chưa đầy đủ cho giao dịch này.",
        variant: "destructive",
      });
      return;
    }

    setPaymentSubmitting(true);

    try {
      const booking = await createPendingBooking({
        showTimeId: bookingData.showtimeId,
        seatIds: apiSeatIds,
        offerId: selectedOffer?.id,
      });

      const onePayCheckout = await createOnePayCheckout({
        orderId: booking.orderId,
        bookingId: booking.bookingId,
        amount: amountDue,
        orderInfo: `${bookingData?.movieTitle || movie?.title || "Cinema Ticket"} - ORDER_${booking.orderId}`,
        locale: "vn",
        cardList: "DOMESTIC",
        returnBaseUrl: window.location.origin,
      });

      const payment = onePayCheckout.payment
        ? {
            ...onePayCheckout.payment,
            provider: "onepay",
            paymentUrl: onePayCheckout.paymentUrl,
            merchTxnRef: onePayCheckout.merchTxnRef,
            amount: onePayCheckout.payment.amount || amountDue,
          }
        : null;

      upsertStoredBooking({
        id: String(booking.bookingId || booking.orderId),
        bookingId: booking.bookingId,
        orderId: booking.orderId,
        paymentId: payment?.paymentId ?? null,
        movieId: String(bookingData?.movieId ?? params.id ?? ""),
        movieTitle: bookingData?.movieTitle ?? movie?.title ?? "Movie Ticket",
        posterUrl: bookingData?.posterUrl ?? movie?.poster_url ?? null,
        cinema: bookingData?.selectedCinema?.name || bookingData?.hall || "Cinema",
        hall: bookingData?.hall || "Hall 04",
        seats: selectedSeats,
        showtime: bookingData?.selectedTime ?? null,
        price: amountDue,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "pending",
        payment,
        ticket: booking.ticket ?? null,
        customerName: booking.ticket?.customerName ?? null,
        customerEmail: booking.ticket?.customerEmail ?? null,
        customerAge: booking.ticket?.customerAge ?? null,
      });

      if (!onePayCheckout.paymentUrl) {
        throw new Error("OnePay payment URL was not created");
      }
      alert(onePayCheckout.paymentUrl);
      console.log("OnePay URL:", onePayCheckout.paymentUrl);
      window.location.assign(onePayCheckout.paymentUrl);
    } catch (error) {
      toast({
        title: "Không thể chuyển sang OnePay",
        description: error instanceof Error ? error.message : "Could not start payment.",
        variant: "destructive",
      });
      setPaymentSubmitting(false);
    }
  };

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
            <p className="text-muted-foreground">We could not load the movie information for this checkout page.</p>
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
                <div className="aspect-2/3 w-full shrink-0 overflow-hidden rounded-xl md:w-32">
                  <img src={movie.poster_url} alt={movie.title} className="h-full w-full object-cover" />
                </div>

                <div className="flex-1 space-y-6">
                  <div>
                    <h2 className="mb-2 text-3xl font-display text-white">{movie.title}</h2>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {Array.isArray(movie.genres) &&
                        movie.genres.map((genre: string) => (
                          <span key={genre} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
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
                        <span className="font-medium">{bookingData?.selectedCinema?.name || bookingData?.hall || "Hall 04"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Seats</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.length > 0 ? selectedSeats.map((seat: string) => (
                        <span key={seat} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-white">
                          {seat}
                        </span>
                      )) : <span className="text-sm text-muted-foreground">No seats selected yet</span>}
                    </div>
                  </div>
                </div>
              </motion.div>

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
                          selectedOffer?.id === offer.id ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" : "border-white/5 bg-white/2 hover:border-white/20"
                        )}
                      >
                        {selectedOffer?.id === offer.id && (
                          <div className="absolute right-0 top-0 p-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          </div>
                        )}

                        <div className="flex items-start gap-4">
                          <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", selectedOffer?.id === offer.id ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground")}>
                            <Tag className="h-5 w-5" />
                          </div>

                          <div>
                            <p className="mb-1 font-bold text-white">{offer.title}</p>
                            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{offer.description}</p>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded bg-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-tighter text-white">{offer.code}</span>
                              {previewDiscount > 0 && (
                                <span className="rounded bg-primary/10 px-2 py-1 text-[10px] font-black uppercase tracking-tighter text-primary">
                                  -{formatVndCurrency(previewDiscount)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-6 rounded-3xl border border-white/10 bg-card/60 p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-display uppercase tracking-tight text-white">OnePay Secure Checkout</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Bạn sẽ được chuyển sang cổng thanh toán OnePay để hoàn tất thanh toán bằng thẻ nội địa, thẻ quốc tế hoặc phương thức ngân hàng được OnePay hỗ trợ.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    {
                      icon: ShieldCheck,
                      title: "Redirect Gateway",
                      description: "Nhập thông tin thanh toán trực tiếp trên trang OnePay, không xử lý card trên frontend.",
                    },
                    {
                      icon: BadgeCheck,
                      title: "Verified Return",
                      description: "Backend xác thực `vpc_SecureHash` khi OnePay trả kết quả về hệ thống.",
                    },
                    {
                      icon: Landmark,
                      title: "IPN Callback",
                      description: "Hệ thống backend nhận callback độc lập để đối soát trạng thái giao dịch.",
                    },
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl border border-white/10 bg-background/40 p-5">
                      <item.icon className="mb-3 h-5 w-5 text-primary" />
                      <p className="mb-2 text-sm font-bold uppercase tracking-wider text-white">{item.title}</p>
                      <p className="text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(event) => setAcceptedTerms(event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent accent-primary"
                    />
                    <span className="text-sm leading-relaxed text-muted-foreground">
                      Tôi xác nhận thông tin vé là chính xác và đồng ý tiếp tục sang cổng OnePay để thanh toán. Giao dịch chỉ được xác nhận khi backend nhận được kết quả thành công hợp lệ từ OnePay.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-card p-8 shadow-2xl">
                  <h3 className="mb-8 text-2xl font-display uppercase tracking-tight text-white">Order Summary</h3>

                  <div className="mb-8 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 py-2">
                      <span className="text-muted-foreground">Tickets ({selectedSeats.length}x)</span>
                      <span className="font-medium text-white">{formatVndCurrency(subtotal)}</span>
                    </div>

                    <AnimatePresence mode="wait">
                      {selectedOffer && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="mb-2 flex items-center justify-between rounded-xl border-b border-white/5 bg-primary/10 px-4 py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Offer Applied</span>
                              <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-black text-primary-foreground">{selectedOffer.code}</span>
                            </div>
                            <span className="font-bold text-primary">-{discount > 0 ? formatVndCurrency(discount) : "0 VND"}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between border-b border-white/5 py-2">
                      <span className="text-muted-foreground">Booking Fee</span>
                      <span className="font-medium text-white">{formatVndCurrency(bookingFee)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <span className="text-xl font-display text-white">Total Amount</span>
                      <span className="text-3xl font-display font-bold text-primary">{formatVndCurrency(amountDue)}</span>
                    </div>
                  </div>

                  <div className="mb-8 flex items-start gap-3 rounded-2xl border border-white/5 bg-white/2 p-4">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-green-500" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-white">OnePay Redirect Payment</p>
                      <p className="text-[10px] leading-relaxed text-muted-foreground">
                        {holdCountdown
                          ? `Your selected seats are held for ${holdCountdown}.`
                          : "Your transaction will be verified after OnePay redirects back to the system."}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="group h-16 w-full rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-2xl shadow-primary/20 hover:bg-primary/90"
                    onClick={handleCheckoutWithOnePay}
                    disabled={selectedSeats.length === 0 || paymentSubmitting}
                  >
                    {paymentSubmitting ? "REDIRECTING TO ONEPAY..." : "PAY WITH ONEPAY"}
                    <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                  
                  <div className="mt-6 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <Info className="h-3 w-3" />
                    <span>OnePay sandbox/production URL is signed from backend before redirect</span>
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
