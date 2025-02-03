import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as SonnerToaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "@/pages/Index";
import CarDetails from "@/pages/CarDetails";
import Auth from "@/pages/Auth";
import ProviderAuth from "@/pages/ProviderAuth";
import ProviderDashboard from "@/pages/ProviderDashboard";
import CustomerBookings from "@/pages/CustomerBookings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
          // Clear any stale session data
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        // Clear any application state if needed
        queryClient.clear();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!isInitialized) {
    return null; // Or a loading spinner
  }

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