import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import {
  User,
  Settings,
  CreditCard,
  Ticket,
  Heart,
  Bell,
  LogOut,
  ChevronRight,
  Star,
  Clock,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { getStoredBookings } from "@/lib/bookingStore";

export function Profile() {
  const [location] = useLocation();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setLocation("/");

    // reload để navbar render lại trạng thái
    window.location.reload();
  };
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const avatar =
  user.avatar ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname)}&background=random&color=fff&size=200`;

  const recentBookings = getStoredBookings().slice(0, 2).map((booking) => {
    const showtime = booking.showtime ? new Date(booking.showtime) : null;

    return {
      id: booking.id,
      movie: booking.movieTitle,
      cinema: booking.cinema,
      date: showtime && !Number.isNaN(showtime.getTime())
        ? showtime.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
        : "TBA",
      time: showtime && !Number.isNaN(showtime.getTime())
        ? showtime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
        : "TBA",
      seats: booking.seats.join(", "),
      status: booking.status === "paid" ? "Upcoming" : "Pending",
    };
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <main className="pt-32 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-card border-white/10 rounded-[2rem] overflow-hidden">
              <CardContent className="p-8 text-center">
                <div className="relative inline-block mb-6">
                  <div className="h-32 w-32 rounded-full border-4 border-primary/20 p-1">
                    <img
                      src={avatar}
                      alt={user.fullname}
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-0 right-0 h-8 w-8 bg-primary rounded-full flex items-center justify-center border-4 border-card text-primary-foreground">
                    <Star className="h-4 w-4 fill-primary-foreground" />
                  </div>
                </div>

                <h1 className="text-3xl font-display text-white mb-1 uppercase tracking-tight">{user.fullname}</h1>
                <p className="text-muted-foreground text-sm mb-6">{user.email}</p>

                <div className="flex items-center justify-center gap-4 py-4 border-y border-white/5 mb-8">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Status</p>
                    <p className="text-white font-bold">{user.membership}</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Points</p>
                    <p className="text-white font-bold">{user.points}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { icon: User, label: "Personal Info", active: location === "/profile", path: "/profile" },
                    { icon: CreditCard, label: "Payment Methods", path: "/profile" },
                    { icon: Bell, label: "Notifications", path: "/notifications" },
                    { icon: Settings, label: "Settings", active: location === "/settings", path: "/settings" },
                  ].map((item, i) => (
                    <Link key={i} href={item.path}>
                      <button
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all mb-2 ${item.active
                            ? "bg-primary text-primary-foreground font-bold"
                            : "text-muted-foreground hover:bg-white/5"
                          }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all mt-4"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="text-sm font-bold">Sign Out</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Total Movies", value: "24", icon: Ticket, path: "/my-movies" },
                { label: "Wishlist", value: "12", icon: Heart, path: "/wishlist" },
                { label: "Reviews", value: "8", icon: Star, path: "/my-reviews" },
              ].map((stat, i) => (
                <Link key={i} href={stat.path}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-card border border-white/10 rounded-[2rem] p-8 flex flex-col items-center text-center group hover:border-primary/50 transition-all cursor-pointer"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold mb-1">{stat.label}</p>
                    <p className="text-3xl font-display text-white">{stat.value}</p>
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* Recent Bookings */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-display text-white uppercase tracking-tight">Recent Bookings</h2>
                <Link href="/bookings">
                  <Button variant="link" className="text-primary font-bold">View All</Button>
                </Link>
              </div>

              <div className="space-y-4">
                {recentBookings.map((booking, i) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="bg-card/50 border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-8 group hover:border-white/10 transition-all"
                  >
                    <div className="h-20 w-20 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors duration-500">
                      <Ticket className="h-10 w-10 text-primary group-hover:text-primary-foreground" />
                    </div>

                    <div className="flex-1 space-y-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-3">
                        <h3 className="text-xl font-display text-white uppercase tracking-tight">{booking.movie}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${booking.status === "Upcoming" ? "bg-green-500/20 text-green-500 border border-green-500/20" : "bg-white/10 text-muted-foreground border border-white/10"
                          }`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm">{booking.cinema}</p>
                      <div className="flex items-center justify-center md:justify-start gap-4 pt-2 text-xs text-white/40">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {booking.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {booking.time}</span>
                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {booking.seats}</span>
                      </div>
                    </div>

                    <Link href={`/ticket/${booking.id}`}>
                      <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 text-white gap-2 font-bold h-12 px-6">
                        TICKET INFO
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
