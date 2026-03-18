import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordFormData } from "../schemas/forgotPasswordSchema";
import { forgotPassword } from "../api/forgotPasswordApi";

export function ForgotPassword() {

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword(data);
      setSubmitted(true);
      toast.success("Recovery link sent to your email!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
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
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16" />

            <CardHeader className="pt-12 px-8 text-center">
              <div className="mx-auto h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Send className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-4xl font-display text-white uppercase tracking-tight">Recovery</CardTitle>
              <CardDescription className="text-muted-foreground text-lg">
                {submitted
                  ? "Check your inbox for instructions."
                  : "We'll send you a link to get back into your account."}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {!submitted ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        {...register("email")}
                        required
                        type="email"
                        placeholder="Email Address"
                        className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl focus:border-primary transition-all"
                        data-testid="input-email"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm">{errors.email.message}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 shadow-xl shadow-primary/20"
                    data-testid="button-reset"
                  >
                    SEND RESET LINK
                  </Button>
                </form>
              ) : (
                <div className="text-center p-6 bg-primary/5 rounded-2xl border border-primary/20">
                  <p className="text-sm text-white/80 leading-relaxed">
                    If an account exists for that email, you will receive a password reset link shortly.
                  </p>
                </div>
              )}

              <Link href="/reset-password">
                <Button
                  type="button"
                  variant="link"
                  className="w-full mt-4 text-[10px] text-primary/50 hover:text-primary uppercase tracking-[0.2em] font-bold"
                >
                  Simulate: Click Reset Link
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
