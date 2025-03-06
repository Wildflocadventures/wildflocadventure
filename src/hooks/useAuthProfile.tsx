import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Profile } from "@/types/supabase";

export interface Booking {
  id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  status: string;
  total_amount: number;
  created_at: string;
  car_model?: string;
  customer_name?: string;
}

export interface Car {
  id: string;
  model: string;
  license_plate: string;
  year: number;
  seats: number;
  rate_per_day: number;
  description?: string;
  image_url?: string;
  car_availability?: any[];
  bookings?: Booking[];
}

export const useAuthProfile = (options = { redirectIfNotAuthenticated: true }) => {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [providerCars, setProviderCars] = useState<Car[]>([]);
  const [providerBookings, setProviderBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
        if (options.redirectIfNotAuthenticated) {
          navigate('/auth');
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.id) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setProviderCars([]);
        setProviderBookings([]);
        setIsLoading(false);
        if (options.redirectIfNotAuthenticated) {
          navigate('/auth');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, options.redirectIfNotAuthenticated]);

  // Set up a real-time subscription for new bookings
  useEffect(() => {
    if (!userProfile || userProfile.role !== 'provider') return;

    const channel = supabase
      .channel('bookings-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bookings' }, 
        (payload) => {
          console.log('Booking change received:', payload);
          fetchProviderData(userProfile.id);
        })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userProfile]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        setIsLoading(false);
        return;
      }

      if (data) {
        setUserProfile(data as Profile);
        
        // If user is a provider, fetch their cars and bookings
        if (data.role === 'provider') {
          fetchProviderData(userId);
        } else {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
      setIsLoading(false);
    }
  };

  const fetchProviderData = async (userId: string) => {
    try {
      // First get the cars belonging to the provider
      const { data: cars, error: carsError } = await supabase
        .from("cars")
        .select("id, model, license_plate")
        .eq("provider_id", userId);

      if (carsError) {
        console.error("Error fetching provider cars:", carsError);
        return;
      }

      if (!cars || cars.length === 0) {
        setProviderCars([]);
        setProviderBookings([]);
        return;
      }

      setProviderCars(cars);

      // Get the car IDs to fetch bookings
      const carIds = cars.map(car => car.id);

      // Fetch bookings for these cars
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select(`
          id, 
          car_id, 
          start_date, 
          end_date, 
          status,
          total_amount,
          created_at,
          customer_id
        `)
        .in("car_id", carIds)
        .order("created_at", { ascending: false });

      if (bookingsError) {
        console.error("Error fetching provider bookings:", bookingsError);
        return;
      }

      // Create a map of car IDs to their models for easier lookup
      const carIdToModel = cars.reduce((acc, car) => {
        acc[car.id] = car.model;
        return acc;
      }, {} as Record<string, string>);

      // Enrich bookings with car model information
      const bookingsWithCarInfo = await Promise.all(bookings.map(async booking => {
        // Get customer name if available
        let customerName = "Unknown Customer";
        if (booking.customer_id) {
          const { data: customer } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", booking.customer_id)
            .single();
          
          if (customer && customer.full_name) {
            customerName = customer.full_name;
          }
        }

        return {
          ...booking,
          car_model: carIdToModel[booking.car_id],
          customer_name: customerName
        };
      }));

      setProviderBookings(bookingsWithCarInfo);

      // Group bookings by car for the dashboard view
      const updatedCars = cars.map(car => {
        const carBookings = bookingsWithCarInfo.filter(b => b.car_id === car.id);
        return {
          ...car,
          bookings: carBookings
        };
      });

      setProviderCars(updatedCars);
    } catch (error) {
      console.error("Error in fetchProviderData:", error);
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
        setProviderBookings([]);
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

  const refreshProviderData = () => {
    if (userProfile && userProfile.role === 'provider') {
      fetchProviderData(userProfile.id);
    }
  };

  return { 
    session, 
    userProfile, 
    handleLogout, 
    isLoading, 
    providerCars, 
    providerBookings,
    refreshProviderData
  };
};
