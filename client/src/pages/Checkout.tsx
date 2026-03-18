import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { movies } from "@/lib/data";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  CreditCard, 
  Ticket, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Calendar, 
  ChevronRight,
  Info,
  Tag,
  CheckCircle2
} from "lucide-react";
import { useLocation } from "wouter";

const OFFERS = [
  { id: 'FIRST10', title: 'New User Discount', description: 'Get $5 off on your first booking', discount: 5, code: 'FIRST10' },
  { id: 'WEEKEND', title: 'Weekend Special', description: '15% discount on weekend shows', discount: 3.5, code: 'WEEKEND15' },
  { id: 'POPCORN', title: 'Combo Deal', description: 'Free small popcorn with this booking', discount: 0, code: 'FREEPOP' },
];

export function Checkout() {
  const [, setLocation] = useLocation();
  const [selectedOffer, setSelectedOffer] = useState(OFFERS[0]);
  
  // Mock data for checkout since we don't have a global state manager yet
  const movie = movies[0]; 
  const selectedSeats = ["H4", "H5"];
  const subtotal = selectedSeats.length * 14.99;
  const bookingFee = 2.50;
  const discount = selectedOffer ? selectedOffer.discount : 0;
  const total = subtotal + bookingFee - discount;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <main className="container mx-auto px-4 pt-32">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Ticket className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-4xl font-display text-white uppercase tracking-tight">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Payment & Details */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Movie Summary Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row gap-8"
              >
                <div className="w-full md:w-32 aspect-[2/3] rounded-xl overflow-hidden flex-shrink-0">
                  <img src={movie.banner_url} alt={movie.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <h2 className="text-3xl font-display text-white mb-2">{movie.title}</h2>
                    <p className="text-muted-foreground text-sm">Action • Sci-Fi • {movie.duration}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Date</p>
                      <div className="flex items-center gap-2 text-white">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Fri, Dec 27</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Time</p>
                      <div className="flex items-center gap-2 text-white">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">07:15 PM</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Cinema</p>
                      <div className="flex items-center gap-2 text-white">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Hall 04</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Payment Method */}
              <div className="space-y-6">
                <h3 className="text-2xl font-display text-white uppercase tracking-tight">Payment Method</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.03] border-2 border-primary shadow-xl shadow-primary/5 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <p className="text-white font-bold">Credit / Debit Card</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Visa, Mastercard, Amex</p>
                      </div>
                    </div>
                    <div className="h-5 w-5 rounded-full border-4 border-primary bg-primary-foreground" />
                  </button>
                  <button className="flex items-center justify-between p-6 rounded-2xl bg-transparent border border-white/10 hover:border-white/20 transition-all opacity-50 grayscale cursor-not-allowed">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground">
                        <Ticket className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <p className="text-white font-bold">Digital Wallet</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Apple Pay, Google Pay</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Card Form Mockup */}
              <div className="bg-card/50 border border-white/5 rounded-3xl p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Card Number</label>
                  <div className="h-14 bg-white/[0.03] border border-white/10 rounded-xl flex items-center px-4 text-white/40">
                    ••••  ••••  ••••  4242
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Expiry Date</label>
                    <div className="h-14 bg-white/[0.03] border border-white/10 rounded-xl flex items-center px-4 text-white/40">
                      MM / YY
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">CVV</label>
                    <div className="h-14 bg-white/[0.03] border border-white/10 rounded-xl flex items-center px-4 text-white/40">
                      •••
                    </div>
                  </div>
                </div>
              </div>

              {/* Select Offers Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-display text-white uppercase tracking-tight">Available Offers</h3>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">3 Offers Found</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {OFFERS.map((offer) => (
                    <button 
                      key={offer.id}
                      onClick={() => setSelectedOffer(offer)}
                      className={cn(
                        "flex items-start gap-4 p-5 rounded-2xl transition-all border text-left relative overflow-hidden group",
                        selectedOffer?.id === offer.id 
                          ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" 
                          : "bg-white/[0.02] border-white/5 hover:border-white/20"
                      )}
                    >
                      {selectedOffer?.id === offer.id && (
                        <div className="absolute top-0 right-0 p-2">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                        selectedOffer?.id === offer.id ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground"
                      )}>
                        <Tag className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-white font-bold mb-1">{offer.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{offer.description}</p>
                        <span className="text-[10px] font-black bg-white/10 text-white px-2 py-1 rounded tracking-tighter uppercase">{offer.code}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                <div className="bg-card border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16" />
                  
                  <h3 className="text-2xl font-display text-white mb-8 uppercase tracking-tight">Order Summary</h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-muted-foreground">Tickets ({selectedSeats.length}x)</span>
                      <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    
                    <AnimatePresence mode="wait">
                      {selectedOffer && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex justify-between items-center py-2 border-b border-white/5 bg-primary/10 -mx-4 px-4 rounded-xl mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-primary font-bold uppercase tracking-widest text-[10px]">Offer Applied</span>
                              <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-black">{selectedOffer.code}</span>
                            </div>
                            <span className="text-primary font-bold">-{discount > 0 ? `$${discount.toFixed(2)}` : 'FREE'}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-muted-foreground">Booking Fee</span>
                      <span className="text-white font-medium">${bookingFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <span className="text-xl font-display text-white">Total Amount</span>
                      <span className="text-3xl font-display text-primary font-bold">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 mb-8 flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Secure Payment</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">Your transaction is protected by 256-bit SSL encryption.</p>
                    </div>
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full h-16 text-lg font-bold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xl shadow-primary/20 group"
                    onClick={() => {
                      alert("Booking confirmed! Redirecting to ticket...");
                      setLocation("/");
                    }}
                  >
                    PAY NOW
                    <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-[0.1em]">
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
