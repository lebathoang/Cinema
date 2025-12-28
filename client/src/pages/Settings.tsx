import { Navbar } from "@/components/layout/Navbar";
import { 
  User, 
  Bell, 
  Lock, 
  Shield, 
  Smartphone, 
  Moon, 
  ChevronRight,
  CreditCard,
  Languages,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

export function Settings() {
  const sections = [
    {
      title: "Account",
      items: [
        { icon: User, label: "Profile Information", desc: "Manage your personal details and avatar" },
        { icon: Lock, label: "Password & Security", desc: "Change your password and enable 2FA", href: "/change-password" },
        { icon: CreditCard, label: "Payment Methods", desc: "Manage your saved cards and billing" }
      ]
    },
    {
      title: "Preferences",
      items: [
        { icon: Bell, label: "Notifications", desc: "Choose what updates you want to receive", toggle: true, checked: false },
        { icon: Moon, label: "Dark Mode", desc: "Keep the cinephile aesthetic", toggle: true, checked: true },
        { icon: Languages, label: "Language", desc: "English (US)" }
      ]
    },
    {
      title: "Privacy & Legal",
      items: [
        { icon: Shield, label: "Privacy Policy", desc: "How we handle your data" },
        { icon: Smartphone, label: "Connected Devices", desc: "Manage where you're signed in" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <main className="pt-32 container mx-auto px-4 max-w-4xl">
        <div className="space-y-2 mb-12">
          <h1 className="text-5xl font-display text-white uppercase tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and security.</p>
        </div>

        <div className="space-y-8">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-4">
              <h2 className="text-xs font-bold text-primary uppercase tracking-[0.2em] px-4">{section.title}</h2>
              <Card className="bg-card border-white/10 rounded-3xl overflow-hidden">
                <CardContent className="p-0">
                  {section.items.map((item, i) => (
                    <div key={i}>
                      {item.href ? (
                        <Link href={item.href}>
                          <div 
                            className={`flex items-center justify-between p-6 hover:bg-white/5 transition-colors cursor-pointer ${
                              i !== section.items.length - 1 ? "border-b border-white/5" : ""
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                                <item.icon className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="text-white font-medium">{item.label}</p>
                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-white/20" />
                          </div>
                        </Link>
                      ) : (
                        <div 
                          className={`flex items-center justify-between p-6 hover:bg-white/5 transition-colors ${
                            i !== section.items.length - 1 ? "border-b border-white/5" : ""
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                              <item.icon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{item.label}</p>
                              <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                          </div>
                          {item.toggle ? (
                            <Switch checked={item.checked} />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-white/20" />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
          
          <div className="pt-8">
            <Link href="/logout">
              <Button variant="ghost" className="w-full justify-start h-16 rounded-[2rem] text-red-500 hover:text-red-400 hover:bg-red-500/10 gap-4 px-8 group">
                <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <LogOut className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold uppercase tracking-widest text-xs">Sign Out</p>
                  <p className="text-[10px] opacity-70 uppercase tracking-tighter">End your current session</p>
                </div>
                <ChevronRight className="ml-auto h-5 w-5 opacity-20 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
