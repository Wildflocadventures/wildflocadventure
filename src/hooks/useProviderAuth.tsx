
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth, AuthOptions } from "@/hooks/useAuth";

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

export const useProviderAuth = (options: AuthOptions = { redirectIfNotAuthenticated: true }) => {
  const { session, userProfile, handleLogout, isLoading } = useAuth(options);
  const [providerCars, setProviderCars] = useState<Car[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile?.role === 'provider' && session?.user?.id) {
      console.log("useProviderAuth: User is a provider, fetching cars");
      fetchProviderCarsWithBookings(session.user.id);
    }
  }, [userProfile, session]);

  const fetchProviderCars = async (providerId: string) => {
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
      console.log("useProviderAuth: Refreshing provider data");
      await fetchProviderCarsWithBookings(session.user.id);
    }
  };

  const fetchProviderCarsWithBookings = async (providerId: string) => {
    try {
      console.log("useProviderAuth: Fetching cars with bookings for provider:", providerId);
      const { data: cars, error: carsError } = await supabase
        .from("cars")
        .select("id, model, license_plate, year, seats, rate_per_day, image_url, description")
        .eq("provider_id", providerId);

      if (carsError) {
        console.error("Error fetching provider cars:", carsError);
        return;
      }

      console.log("useProviderAuth: Found cars for provider:", cars?.length);
      
      if (!cars || cars.length === 0) {
        setProviderCars([]);
        return;
      }

      const carIds = cars.map(car => car.id);
      console.log("useProviderAuth: Car IDs:", carIds);

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

      console.log("useProviderAuth: Found bookings:", bookings?.length);

      // Map bookings to their respective cars
      const carsWithBookings = cars.map(car => {
        const carBookings = bookings
          ?.filter(booking => booking.car_id === car.id)
          ?.map(booking => ({
            ...booking,
            customer_name: booking.profiles?.full_name || "Unknown Customer"
          })) || [];

        console.log(`useProviderAuth: Car ${car.id} has ${carBookings.length} bookings`);
        
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
