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
import { SearchResults } from "@/pages/SearchResults";
import { ClaimOffer } from "@/pages/ClaimOffer";
import { BookingHistory } from "@/pages/BookingHistory";
import { UserMovies } from "@/pages/UserMovies";
import { Wishlist } from "@/pages/Wishlist";
import { Reviews } from "@/pages/Reviews";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Logout } from "@/pages/Logout";
import { ForgotPassword } from "@/pages/ForgotPassword";
import { ChangePassword } from "@/pages/ChangePassword";
import { ResetPassword } from "@/pages/ResetPassword";
import { ActivateAccount } from "@/pages/ActivateAccount";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/logout" component={Logout} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/change-password" component={ChangePassword} />
      <Route path="/activate-account" component={ActivateAccount} />
      <Route path="/movies" component={MoviesList} />
      <Route path="/movie/:id" component={MovieDetail} />
      <Route path="/checkout/:id" component={Checkout} />
      <Route path="/cinemas" component={Cinemas} />
      <Route path="/cinema/:id" component={CinemaSchedule} />
      <Route path="/offers" component={Offers} />
      <Route path="/profile" component={Profile} />
      <Route path="/settings" component={Settings} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/ticket/:id" component={TicketInfo} />
      <Route path="/search" component={SearchResults} />
      <Route path="/claim-offer/:id" component={ClaimOffer} />
      <Route path="/bookings" component={BookingHistory} />
      <Route path="/my-movies" component={UserMovies} />
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/my-reviews" component={Reviews} />
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
