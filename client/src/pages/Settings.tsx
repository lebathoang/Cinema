import { Navbar } from "@/components/layout/Navbar";
import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "wouter";
import type { LucideIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileApi } from "@/api/authApi";
import { profileSchema, type ProfileFormData } from "@/schemas/profileSchema";
import { getStoredUser, setStoredUser, type StoredUser } from "@/lib/userStorage";

type SettingsItem = {
  icon: LucideIcon;
  label: string;
  desc: string;
  href?: string;
  toggle?: boolean;
  checked?: boolean;
};

export function Settings() {
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [currentUser, setCurrentUser] = useState<StoredUser>(() => getStoredUser());
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullname: currentUser.fullname || "",
      age: currentUser.age || undefined,
      phone: currentUser.phone || "",
      avatar: currentUser.avatar || "",
      address: currentUser.address || "",
    },
  });

  useEffect(() => {
    if (isProfileDialogOpen) {
      reset({
        fullname: currentUser.fullname || "",
        age: currentUser.age || undefined,
        phone: currentUser.phone || "",
        avatar: currentUser.avatar || "",
        address: currentUser.address || "",
      });
      setUpdateError("");
      setUpdateSuccess("");
    }
  }, [currentUser, isProfileDialogOpen, reset]);

  const handleOpenProfileDialog = () => {
    setIsProfileDialogOpen(true);
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!currentUser?.id) {
      setUpdateError("User information is missing. Please login again.");
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateError("");
      setUpdateSuccess("");

      const result = await updateProfileApi(currentUser.id, data);
      const updatedUser = { ...currentUser, ...result.user };

      setStoredUser(updatedUser);
      setCurrentUser(updatedUser);
      setUpdateSuccess("Profile updated successfully.");
      setTimeout(() => setIsProfileDialogOpen(false), 800);
    } catch (error: any) {
      setUpdateError(error.message || "Unable to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  const sections: Array<{ title: string; items: SettingsItem[] }> = [
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
                          onClick={item.label === "Profile Information" ? handleOpenProfileDialog : undefined}
                          className={`flex items-center justify-between p-6 hover:bg-white/5 transition-colors ${
                            item.label === "Profile Information" ? "cursor-pointer" : ""
                          } ${
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
                            <Switch checked={!!item.checked} />
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

        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
          <DialogContent className="max-w-2xl border-white/10 bg-card text-white rounded-[2rem] p-0 overflow-hidden">
            <DialogHeader className="px-8 pt-8">
              <DialogTitle className="text-3xl font-display uppercase tracking-tight">
                Profile Information
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Update your personal information and save it to your account.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-white/80">Full Name</label>
                  <Input
                    {...register("fullname")}
                    placeholder="Enter full name"
                    className="h-12 rounded-2xl border-white/10 bg-white/5"
                  />
                  {errors.fullname && <p className="text-sm text-red-500">{errors.fullname.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/80">Age</label>
                  <Input
                    type="number"
                    {...register("age")}
                    placeholder="Enter age"
                    className="h-12 rounded-2xl border-white/10 bg-white/5"
                  />
                  {errors.age && <p className="text-sm text-red-500">{errors.age.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-white/80">Phone</label>
                  <Input
                    {...register("phone")}
                    placeholder="Enter phone number"
                    className="h-12 rounded-2xl border-white/10 bg-white/5"
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/80">Avatar URL</label>
                  <Input
                    {...register("avatar")}
                    placeholder="https://example.com/avatar.jpg"
                    className="h-12 rounded-2xl border-white/10 bg-white/5"
                  />
                  {errors.avatar && <p className="text-sm text-red-500">{errors.avatar.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/80">Address</label>
                <Textarea
                  {...register("address")}
                  placeholder="Enter address"
                  className="min-h-28 rounded-2xl border-white/10 bg-white/5"
                />
                {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
              </div>

              {updateError && <p className="text-sm text-red-500">{updateError}</p>}
              {updateSuccess && <p className="text-sm text-green-500">{updateSuccess}</p>}

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsProfileDialogOpen(false)}
                  className="rounded-2xl border-white/10 text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isUpdating ? "Updating..." : "Update"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
