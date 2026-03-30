import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { Gift, Percent, CreditCard, Users, Star, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { getOffers } from "@/api/cinemaApi";

const OFFER_STYLES = [
  { icon: Percent, color: "bg-blue-500" },
  { icon: Users, color: "bg-purple-500" },
  { icon: CreditCard, color: "bg-amber-500" },
  { icon: Gift, color: "bg-pink-500" },
];

export function Offers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const data = await getOffers();
        const publicOffers = Array.isArray(data)
          ? data.filter((offer: any) => !offer.code || !String(offer.code).trim())
          : [];

        setOffers(publicOffers);
      } catch (error) {
        console.error(error);
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const decoratedOffers = useMemo(
    () =>
      offers.map((offer, index) => ({
        ...offer,
        ...OFFER_STYLES[index % OFFER_STYLES.length],
      })),
    [offers]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <main className="pt-32 container mx-auto px-4">
        <div className="max-w-3xl mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Star className="h-4 w-4 text-primary fill-primary" />
            </div>
            <span className="text-primary font-bold text-xs uppercase tracking-[0.3em]">Exclusive Rewards</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-display text-white uppercase tracking-tight mb-6"
          >
            Special <span className="text-primary">Offers</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg leading-relaxed"
          >
            Elevate your cinema experience with our curated deals. From family bundles to student discounts, there's always a reason to celebrate at Cineplex Premiere.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {decoratedOffers.map((offer, idx) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative bg-card border border-white/10 rounded-3xl p-8 overflow-hidden hover:border-primary/50 transition-all shadow-2xl"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${offer.color} opacity-10 blur-[80px] -mr-16 -mt-16 group-hover:opacity-20 transition-opacity`} />

              <div className="flex flex-col md:flex-row gap-8 relative z-10">
                <div className={`h-20 w-20 rounded-2xl ${offer.color} bg-opacity-20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                  <offer.icon className="h-10 w-10 text-white" />
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-3xl font-display text-white mb-1 group-hover:text-primary transition-colors">
                        {offer.title}
                      </h2>
                      <div className="inline-block px-3 py-1 bg-primary text-primary-foreground text-[10px] font-black rounded-full uppercase tracking-widest">
                        {offer.discount || offer.discount_text || "Special Offer"}
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    {offer.description}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-widest font-bold">
                    <Info className="h-3 w-3" />
                    {offer.terms || offer.condition || "See offer details for terms and conditions."}
                  </div>

                  <Link href={`/claim-offer/${offer.id}`}>
                    <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 text-white w-full md:w-auto h-12 px-8 font-bold group/btn">
                      CLAIM OFFER
                      <ChevronRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {decoratedOffers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center space-y-4"
          >
            <div className="inline-flex h-20 w-20 rounded-full bg-white/5 items-center justify-center mb-4">
              <Gift className="h-10 w-10 text-muted-foreground opacity-20" />
            </div>
            <h3 className="text-2xl font-display text-white">No public offers available</h3>
            <p className="text-muted-foreground">
              Check back later for new promotions and rewards.
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 p-12 rounded-[2.5rem] bg-gradient-to-br from-secondary/50 to-background border border-primary/20 relative overflow-hidden text-center"
        >
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <div className="inline-flex h-16 w-16 bg-primary/20 rounded-full items-center justify-center mb-4">
              <Star className="h-8 w-8 text-primary fill-primary" />
            </div>
            <h2 className="text-4xl md:text-5xl font-display text-white uppercase tracking-tight">Join Premiere Club</h2>
            <p className="text-muted-foreground text-lg">
              Unlock a world of perks. Earn points with every purchase and redeem them for free tickets, snacks, and exclusive event invites.
            </p>
            <Button size="lg" className="h-16 px-12 rounded-2xl bg-primary text-primary-foreground font-black text-lg hover:bg-primary/90 shadow-2xl shadow-primary/20">
              BECOME A MEMBER
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
