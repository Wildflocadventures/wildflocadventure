
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export interface Car {
  id: string;
  model: string;
  license_plate: string;
  year: number;
  seats: number;
  rate_per_day: number;
  image_url?: string;
  description?: string;
  bookings?: any[];
}

export const useAuthProfile = (options = { redirectIfNotAuthenticated: true }) => {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [providerCars, setProviderCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("useAuthProfile: Initializing");
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("useAuthProfile: Got session", session?.user?.id);
      setSession(session);
      if (session?.user?.id) {
        fetchUserProfile(session.user.id);
      } else if (options.redirectIfNotAuthenticated) {
        console.log("useAuthProfile: Redirecting to auth");
        navigate('/auth');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("useAuthProfile: Auth state changed", session?.user?.id);
      setSession(session);
      if (session?.user?.id) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        if (options.redirectIfNotAuthenticated) {
          console.log("useAuthProfile: Redirecting to auth on state change");
          navigate('/auth');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, options.redirectIfNotAuthenticated]);

  const fetchUserProfile = async (userId) => {
    try {
      setIsLoading(true);
      console.log("useAuthProfile: Fetching user profile for", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }

      if (data) {
        console.log("User profile:", data);
        setUserProfile(data);
        
        // If the user is a provider, fetch their cars
        if (data.role === 'provider') {
          console.log("useAuthProfile: User is a provider, fetching cars");
          fetchProviderCarsWithBookings(userId);
        }
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProviderCars = async (providerId) => {
    try {
      console.log("Fetching cars for provider:", providerId);
      const { data, error } = await supabase
        .from("cars")
        .select("id, model, license_plate, year, seats, rate_per_day, image_url, description")
        .eq("provider_id", providerId);

      if (error) {
        console.error("Error fetching provider cars:", error);
        toast({
          title: "Error",
          description: "Failed to fetch your cars",
          variant: "destructive",
        });
        return;
      }

      console.log("Provider cars:", data);
      setProviderCars(data as Car[]);
    } catch (error) {
      console.error("Error in fetchProviderCars:", error);
    }
  };

  const refreshProviderData = async () => {
    if (session?.user && userProfile?.role === 'provider') {
      console.log("useAuthProfile: Refreshing provider data");
      await fetchProviderCarsWithBookings(session.user.id);
    }
  };

  const fetchProviderCarsWithBookings = async (providerId) => {
    try {
      console.log("useAuthProfile: Fetching cars with bookings for provider:", providerId);
      const { data: cars, error: carsError } = await supabase
        .from("cars")
        .select("id, model, license_plate, year, seats, rate_per_day, image_url, description")
        .eq("provider_id", providerId);

      if (carsError) {
        console.error("Error fetching provider cars:", carsError);
        return;
      }

      console.log("useAuthProfile: Found cars for provider:", cars?.length);
      
      if (!cars || cars.length === 0) {
        setProviderCars([]);
        return;
      }

      const carIds = cars.map(car => car.id);
      console.log("useAuthProfile: Car IDs:", carIds);

      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select(`
          id, car_id, customer_id, start_date, end_date, status, total_amount, created_at,
          profiles:customer_id (full_name)
        `)
        .in("car_id", carIds);

      if (bookingsError) {
        console.error("Error fetching bookings:", bookingsError);
        return;
      }

      console.log("useAuthProfile: Found bookings:", bookings?.length);

      // Map bookings to their respective cars
      const carsWithBookings = cars.map(car => {
        const carBookings = bookings
          ?.filter(booking => booking.car_id === car.id)
          ?.map(booking => ({
            ...booking,
            customer_name: booking.profiles?.full_name || "Unknown Customer"
          })) || [];

        console.log(`useAuthProfile: Car ${car.id} has ${carBookings.length} bookings`);
        
        return {
          ...car,
          bookings: carBookings
        } as Car;
      });

      setProviderCars(carsWithBookings);
    } catch (error) {
      console.error("Error in fetchProviderCarsWithBookings:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error logging out:", error);
        toast({
          title: "Error",
          description: "Failed to log out",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Logged out successfully",
        });
        setSession(null);
        setUserProfile(null);
        setProviderCars([]);
        navigate('/');
      }
    } catch (error) {
      console.error("Error in logout handler:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return { 
    session, 
    userProfile, 
    handleLogout, 
    providerCars, 
    refreshProviderData,
    fetchProviderCarsWithBookings,
    isLoading 
  };
};
