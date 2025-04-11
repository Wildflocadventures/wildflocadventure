
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as SonnerToaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import Index from "@/pages/Index";
import CarDetails from "@/pages/CarDetails";
import Auth from "@/pages/Auth";
import CustomerBookings from "@/pages/CustomerBookings";
import ProviderDashboard from "@/pages/ProviderDashboard";
import CustomerDetailsForm from "@/pages/CustomerDetailsForm";
import ProviderBookingsPage from "@/pages/ProviderBookingsPage";
import Activities from "@/pages/Activities";
import ActivityDetails from "@/pages/ActivityDetails";
import Features from "@/pages/Features";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import CarRentals from "@/pages/CarRentals";

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
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
          await supabase.auth.signOut();
        } else if (session?.user) {
          setSession(session);
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setUserProfile(profile);
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      
      if (event === 'SIGNED_OUT') {
        setUserProfile(null);
        queryClient.clear();
      } else if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUserProfile(profile);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!isInitialized) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <TooltipProvider>
          <div className="min-h-screen pt-16">
            <Navbar session={session} userProfile={userProfile} />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/car/:id" element={<CarDetails />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/provider/auth" element={<Auth />} />
              <Route path="/provider/dashboard" element={<ProviderDashboard />} />
              <Route path="/provider/bookings" element={<ProviderBookingsPage />} />
              <Route path="/customer/bookings" element={<CustomerBookings />} />
              <Route path="/customer/details" element={<CustomerDetailsForm />} />
              {/* Activities routes */}
              <Route path="/activities" element={<Activities />} />
              <Route path="/activity/:id" element={<ActivityDetails />} />
              <Route path="/features" element={<Features />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/car-rentals" element={<CarRentals />} />
              {/* Redirect any other paths to the main page */}
              <Route path="*" element={<Navigate replace to="/" />} />
            </Routes>
          </div>
          <Toaster />
          <SonnerToaster />
        </TooltipProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
