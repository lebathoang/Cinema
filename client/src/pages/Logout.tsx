import { useEffect } from "react";
import { useLocation } from "wouter";
import { clearStoredUser } from "@/lib/userStorage";

export function Logout() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    localStorage.removeItem("token");
    clearStoredUser();

    setTimeout(() => {
      setLocation("/login");
    }, 1000);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-2xl font-display text-white uppercase tracking-tight">Signing you out...</h2>
        <p className="text-muted-foreground">See you at the movies!</p>
      </div>
    </div>
  );
}
