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
import { Offers } from "@/pages/Offers";
import { Profile } from "@/pages/Profile";
import { Settings } from "@/pages/Settings";
import { Notifications } from "@/pages/Notifications";
import { TicketInfo } from "@/pages/TicketInfo";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/movies" component={MoviesList} />
      <Route path="/movie/:id" component={MovieDetail} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/cinemas" component={Cinemas} />
      <Route path="/cinema/:id" component={CinemaSchedule} />
      <Route path="/offers" component={Offers} />
      <Route path="/profile" component={Profile} />
      <Route path="/settings" component={Settings} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/ticket/:id" component={TicketInfo} />
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
