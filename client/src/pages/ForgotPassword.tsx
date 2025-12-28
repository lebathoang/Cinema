import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";

export function ForgotPassword() {
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
              <CardTitle className="text-4xl font-display text-white uppercase tracking-tight">Reset Password</CardTitle>
              <CardDescription className="text-muted-foreground text-lg">
                We'll send you a link to get back into your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <form className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      placeholder="Email Address" 
                      className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl focus:border-primary transition-all"
                      data-testid="input-email"
                    />
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

              <div className="pt-4 flex justify-center">
                <Link href="/login">
                  <span className="text-muted-foreground hover:text-white flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors cursor-pointer">
                    <ArrowLeft className="h-4 w-4" /> Back to Login
                  </span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
