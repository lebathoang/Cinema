import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, ResetPasswordFormData } from "../schemas/resetPasswordSchema";
import { resetPassword } from "../api/resetPassword";

export function ResetPassword() {

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "";
  const token = params.get("token") || "";

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPassword({
        id,
        token,
        password: data.password,
      });

      toast.success("Password reset successfully!");
      setLocation("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="bg-card border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
            <CardHeader className="pt-12 px-8 text-center">
              <div className="mx-auto h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-4xl font-display text-white uppercase tracking-tight">New Password</CardTitle>
              <CardDescription className="text-muted-foreground text-lg">
                Create a strong password to secure your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      {...register("password")}
                      required
                      type="password"
                      placeholder="New Password"
                      className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl focus:border-primary transition-all"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm">{errors.password.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      {...register("confirmPassword")}
                      required
                      type="password"
                      placeholder="Confirm New Password"
                      className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl focus:border-primary transition-all"
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 shadow-xl shadow-primary/20 group"
                >
                  RESET PASSWORD
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
