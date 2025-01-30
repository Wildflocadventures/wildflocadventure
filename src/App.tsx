import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as SonnerToaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "@/pages/Index";
import CarDetails from "@/pages/CarDetails";
import Auth from "@/pages/Auth";
import ProviderAuth from "@/pages/ProviderAuth";
import ProviderDashboard from "@/pages/ProviderDashboard";
import CustomerBookings from "@/pages/CustomerBookings";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <TooltipProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/car/:id" element={<CarDetails />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/provider/auth" element={<ProviderAuth />} />
            <Route path="/provider/dashboard" element={<ProviderDashboard />} />
            <Route path="/customer/bookings" element={<CustomerBookings />} />
          </Routes>
          <Toaster />
          <SonnerToaster />
        </TooltipProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;