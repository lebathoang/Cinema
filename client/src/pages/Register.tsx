"use client";

import { useState } from "react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, ArrowRight, Github } from "lucide-react";
import { useForm } from "react-hook-form";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { registerSchema, RegisterFormData } from "@/schemas/registerSchema";
import { registerApi } from "../api/registerApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function Register() {

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const [, setLocation] = useLocation();
  const [successModal, setSuccessModal] = useState(false);
  const [showCheckMail, setShowCheckMail] = useState(false);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerApi(data);
      setShowCheckMail(true)

      // setSuccessModal(true);
    } catch (error) {
      console.log(error);
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
              <CardTitle className="text-4xl font-display text-white uppercase tracking-tight">Join the Club</CardTitle>
              <CardDescription className="text-muted-foreground text-lg">
                Unlock premium cinema experiences.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      {...register("fullname")}
                      placeholder="Full Name"
                      className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl focus:border-primary transition-all"
                      data-testid="input-name"
                    />
                    {errors.fullname && (
                      <p className="text-red-500 text-sm">
                        {errors.fullname.message}
                      </p>
                    )}
                  </div>
                </div>
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
                  className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 shadow-xl shadow-primary/20 group mt-4"
                  data-testid="button-register"
                >
                  CREATE ACCOUNT
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>

              <p className="text-center text-muted-foreground text-sm pt-4">
                Already have an account?{" "}
                <Link href="/login">
                  <span className="text-primary font-bold hover:underline cursor-pointer">Login</span>
                </Link>
              </p>
            </CardContent>
          </Card>
          <Dialog open={successModal} onOpenChange={setSuccessModal}>
            <DialogContent className="text-center">
              <DialogHeader>
                <DialogTitle className="text-2xl text-green-500">
                  ✔ Registration Successful
                </DialogTitle>
              </DialogHeader>

              <p className="text-muted-foreground">
                Your account has been created successfully.
              </p>

              <Button
                className="mt-4 w-full"
                onClick={() => setLocation("/login")}
              >
                Go to Login
              </Button>
            </DialogContent>
          </Dialog>
          <Dialog open={showCheckMail} onOpenChange={setShowCheckMail}>
            <DialogContent className="text-center">
              <DialogTitle className="text-xl">
                📩 Check your email
              </DialogTitle>

              <p className="text-muted-foreground">
                We have sent an activation link to your email.
                Please activate your account.
              </p>
            </DialogContent>
          </Dialog>
        </motion.div>
      </main>
    </div>
  );
}
