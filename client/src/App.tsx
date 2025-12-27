import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Home } from "@/pages/Home";
import { MovieDetail } from "@/pages/MovieDetail";
import { Checkout } from "@/pages/Checkout";
import { MoviesList } from "@/pages/MoviesList";
import { Cinemas } from "@/pages/Cinemas";
import { CinemaSchedule } from "@/pages/CinemaSchedule";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/movies" component={MoviesList} />
      <Route path="/movie/:id" component={MovieDetail} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/cinemas" component={Cinemas} />
      <Route path="/cinema/:id" component={CinemaSchedule} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
