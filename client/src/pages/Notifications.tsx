import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { 
  Bell, 
  Ticket, 
  Star, 
  Tag, 
  Info,
  ChevronRight,
  Clock,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Notifications() {
  const notifications = [
    {
      id: 1,
      type: "booking",
      title: "Booking Confirmed!",
      desc: "Your tickets for Nebula (IMAX) are ready. Scan your QR code at the cinema.",
      time: "2 hours ago",
      icon: CheckCircle2,
      color: "text-green-500",
      isNew: true
    },
    {
      id: 2,
      type: "offer",
      title: "Special Student Discount",
      desc: "Get 50% off this Monday with code: STUDENT50. Check out the offers page.",
      time: "5 hours ago",
      icon: Tag,
      color: "text-primary",
      isNew: true
    },
    {
      id: 3,
      type: "reminder",
      title: "Movie Starts Soon",
      desc: "Reminder: Velocity starts in 1 hour at Cineplex Grand Mall Hall 4.",
      time: "1 day ago",
      icon: Clock,
      color: "text-blue-500",
      isNew: false
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <main className="pt-32 container mx-auto px-4 max-w-3xl">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-2">
            <h1 className="text-5xl font-display text-white uppercase tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">Stay updated with your bookings and offers.</p>
          </div>
          <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 text-white font-bold">
            MARK ALL AS READ
          </Button>
        </div>

        <div className="space-y-4">
          {notifications.map((notif, idx) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-6 rounded-3xl border transition-all hover:bg-white/5 relative group ${
                notif.isNew ? "bg-white/5 border-primary/20" : "bg-card border-white/10"
              }`}
            >
              {notif.isNew && (
                <span className="absolute top-6 right-6 h-2 w-2 bg-primary rounded-full shadow-lg shadow-primary/50" />
              )}
              
              <div className="flex gap-6">
                <div className={`h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0`}>
                  <notif.icon className={`h-6 w-6 ${notif.color}`} />
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold">{notif.title}</h3>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{notif.time}</span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{notif.desc}</p>
                  
                  <div className="pt-4 flex items-center gap-4">
                    <Button variant="link" className="p-0 h-auto text-primary text-xs font-bold uppercase tracking-widest hover:no-underline group-hover:translate-x-1 transition-transform">
                      VIEW DETAILS <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
