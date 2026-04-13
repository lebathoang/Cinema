import { useState } from "react";
import axios from "axios";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Github } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "../schemas/loginSchema";
import { loginApi } from "@/api/authApi";
import { setStoredUser } from "@/lib/userStorage";

export function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const [, setLocation] = useLocation();
  const [error, setError] = useState("");

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await loginApi(data);

      localStorage.setItem("token", result.token);
      setStoredUser(result.user);

      setLocation("/");

    } catch (error: any) {
      console.log(error);

      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Có lỗi xảy ra");
      } else {
        setError("Có lỗi xảy ra, vui lòng thử lại");
      }
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
                      type="password"
                      {...register("password")}
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
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
                <div className="flex justify-end">
                  <Link href="/forgot-password">
                    <span className="text-xs font-bold text-primary uppercase tracking-widest cursor-pointer hover:underline">Forgot Password?</span>
                  </Link>
                </div>
                <Button
                  type="submit"
                  className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 shadow-xl shadow-primary/20 group"
                  data-testid="button-login"
                >
                  LOGIN
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-bold">
                  <span className="bg-card px-4 text-muted-foreground">Or Continue With</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-12 rounded-xl border-white/10 hover:bg-white/5 text-white gap-2">
                  <Github className="h-5 w-5" /> GitHub
                </Button>
                <Button variant="outline" className="h-12 rounded-xl border-white/10 hover:bg-white/5 text-white gap-2">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                  </svg>
                  Google
                </Button>
              </div>

              <p className="text-center text-muted-foreground text-sm pt-4">
                New to Cineplex?{" "}
                <Link href="/register">
                  <span className="text-primary font-bold hover:underline cursor-pointer">Register Now</span>
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
