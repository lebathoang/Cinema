"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { activateSchema, ActivateFormData } from "@/schemas/activateSchema";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import axios from "axios";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

export function ActivateAccount() {

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActivateFormData>({
    resolver: zodResolver(activateSchema),
  });

  const [success, setSuccess] = useState(false);
  const [, setLocation] = useLocation();

  const onSubmit = async (data: ActivateFormData) => {
    const token = new URLSearchParams(window.location.search).get("token");
    console.log(token);

    try {
      await axios.post(
        `http://localhost:5000/api/auth/activate-account`,
        { token }
      );

      setSuccess(true);
    } catch (error: any) {
      alert(error.response?.data?.message || "Activation failed");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="bg-card border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <CardHeader className="pt-12 px-8 text-center">
              <CardTitle className="text-4xl font-display text-white uppercase tracking-tight">Welcome Back</CardTitle>
              <CardDescription className="text-muted-foreground text-lg">
                Your cinematic journey continues here.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      {...register("email")}
                      placeholder="Email Address"
                      className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl focus:border-primary transition-all"
                      data-testid="input-email"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      {...register("password")}
                      type="password"
                      placeholder="Password"
                      className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl focus:border-primary transition-all"
                      data-testid="input-password"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 shadow-xl shadow-primary/20 group"
                  data-testid="button-login"
                >
                  ACTIVE
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Dialog open={success} onOpenChange={setSuccess}>
        <DialogContent className="text-center">
          <DialogTitle className="text-green-500 text-2xl">
            ✔ Account Activated
          </DialogTitle>

          <p>Your account has been activated successfully.</p>

          <Button
            className="mt-4 w-full"
            onClick={() => setLocation("/login")}
          >
            Go to Login
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}