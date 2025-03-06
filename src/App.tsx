
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
import { Profile } from "@/types/supabase";

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
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
          await supabase.auth.signOut();
        } else if (session?.user) {
          console.log("App initialization - User is logged in:", session.user.id);
          setSession(session);
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error("Error fetching profile:", profileError);
          } else if (profile) {
            console.log("App initialization - User profile loaded:", profile.role);
            setUserProfile(profile);
          }
        } else {
          console.log("App initialization - No user logged in");
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      setSession(session);
      
      if (event === 'SIGNED_OUT') {
        setUserProfile(null);
        queryClient.clear();
      } else if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile on auth change:", profileError);
        } else if (profile) {
          console.log("Auth state change - User profile loaded:", profile.role);
          setUserProfile(profile);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Create a protected route component
  const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: 'customer' | 'provider' }) => {
    if (!isInitialized) return null; // Still initializing
    
    if (!session) {
      console.log("Protected route - redirecting to auth, no session");
      return <Navigate to="/auth" />;
    }
    
    if (role && userProfile?.role !== role) {
      console.log(`Protected route - redirecting to /, wrong role: ${userProfile?.role} != ${role}`);
      return <Navigate to="/" />;
    }
    
    return <>{children}</>;
  };

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
              <Route path="/auth" element={
                session ? <Navigate to="/" /> : <Auth />
              } />
              <Route path="/provider/auth" element={
                session ? <Navigate to="/provider/dashboard" /> : <Auth />
              } />
              <Route path="/provider/dashboard" element={
                <ProtectedRoute role="provider">
                  <ProviderDashboard />
                </ProtectedRoute>
              } />
              <Route path="/provider/bookings" element={
                <ProtectedRoute role="provider">
                  <ProviderBookingsPage />
                </ProtectedRoute>
              } />
              <Route path="/customer/bookings" element={
                <ProtectedRoute role="customer">
                  <CustomerBookings />
                </ProtectedRoute>
              } />
              <Route path="/customer/details" element={
                <ProtectedRoute role="customer">
                  <CustomerDetailsForm />
                </ProtectedRoute>
              } />
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
