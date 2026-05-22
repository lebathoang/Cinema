import { useEffect } from "react";
import { useLocation } from "wouter";
import { getStoredUser } from "@/lib/userStorage";

export function useRequireAuth() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = getStoredUser();
    const hasUser = Boolean(user?.id);

    if (!token || !hasUser) {
      setLocation("/login");
    }
  }, [setLocation]);
}
