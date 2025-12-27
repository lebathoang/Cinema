import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { useParams, Link } from "wouter";
import { 
  Gift, 
  Percent, 
  CreditCard, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Copy, 
  Calendar,
  Ticket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const offers = {
  "1": {
    title: "Student Monday",
    discount: "50% OFF",
    icon: Percent,
    color: "bg-blue-500",
    code: "STUDENT50",
    expiry: "Dec 31, 2025"
  },
  "2": {
    title: "Family Bundle",
    discount: "SAVE $20",
    icon: Users,
    color: "bg-purple-500",
    code: "FAMILY20",
    expiry: "Dec 31, 2025"
  },
  "3": {
    title: "Bank Card Promo",
    discount: "B1G1 FREE",
    icon: CreditCard,
    color: "bg-amber-500",
    code: "BANKPREMIERE",
    expiry: "Dec 31, 2025"
  },
  "4": {
    title: "Birthday Special",
    discount: "FREE TICKET",
    icon: Gift,
    color: "bg-pink-500",
    code: "BDAYWISH",
    expiry: "Dec 31, 2025"
  }
};

export function ClaimOffer() {
  const { id } = useParams();
  const offer = offers[id as keyof typeof offers] || offers["1"];
  const [isClaimed, setIsClaimed] = useState(false);

  const handleCopy = () => {
    if (offer && offer.code) {
      navigator.clipboard.writeText(offer.code);
      toast.success("Promo code copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <main className="pt-32 container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
        >
          {/* Header Accent */}
          <div className={`h-4 ${offer.color} w-full`} />
          
          <div className="p-12 text-center space-y-8">
            <div className={`h-24 w-24 rounded-[2rem] ${offer.color} bg-opacity-20 flex items-center justify-center mx-auto shadow-inner`}>
              <offer.icon className="h-12 w-12 text-white" />
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-display text-white uppercase tracking-tight">
                {isClaimed ? "Offer Claimed!" : "Claim Your Offer"}
              </h1>
              <p className="text-muted-foreground text-lg">
                {offer.title} • <span className="text-primary font-bold">{offer.discount}</span>
              </p>
            </div>

            {!isClaimed ? (
              <div className="space-y-6">
                <div className="bg-white/5 border border-dashed border-white/20 rounded-2xl p-8 space-y-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Your Promo Code</p>
                  <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5">
                    <span className="text-2xl font-mono font-bold text-white tracking-widest">{offer.code}</span>
                    <Button variant="ghost" size="icon" onClick={handleCopy} className="text-primary hover:text-primary hover:bg-primary/10">
                      <Copy className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-left">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-2">
                      <Calendar className="h-3 w-3" /> Expiry
                    </p>
                    <p className="text-white font-bold text-sm">{offer.expiry}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-left">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3" /> Status
                    </p>
                    <p className="text-green-500 font-bold text-sm">Active</p>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    setIsClaimed(true);
                    toast.success("Offer successfully added to your account!");
                  }}
                  className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg hover:bg-primary/90 shadow-xl shadow-primary/20"
                >
                  ACTIVATE OFFER NOW
                </Button>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8 py-4"
              >
                <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto border border-green-500/20">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  The <span className="text-white font-bold">{offer.title}</span> has been successfully activated. 
                  You can now use this discount on your next ticket booking.
                </p>
                <div className="flex flex-col gap-3">
                  <Link href="/movies">
                    <Button className="w-full h-14 rounded-2xl bg-white text-black font-bold hover:bg-white/90 gap-2">
                      BROWSE MOVIES <Ticket className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/offers">
                    <Button variant="ghost" className="w-full h-14 rounded-2xl text-white font-bold">
                      BACK TO OFFERS
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
