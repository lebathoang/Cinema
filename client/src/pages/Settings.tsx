import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { 
  User, 
  Bell, 
  Lock, 
  Shield, 
  Smartphone, 
  Moon, 
  ChevronRight,
  CreditCard,
  Eye,
  Languages
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Settings() {
  const sections = [
    {
      title: "Account",
      items: [
        { icon: User, label: "Profile Information", desc: "Manage your personal details and avatar" },
        { icon: Lock, label: "Password & Security", desc: "Change your password and enable 2FA" },
        { icon: CreditCard, label: "Payment Methods", desc: "Manage your saved cards and billing" }
      ]
    },
    {
      title: "Preferences",
      items: [
        { icon: Bell, label: "Notifications", desc: "Choose what updates you want to receive", toggle: true },
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
                    <div 
                      key={i} 
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
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
