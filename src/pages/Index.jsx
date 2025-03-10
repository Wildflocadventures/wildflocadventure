
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuthButtons } from "@/components/car-listing/AuthButtons";
import { HeroSection } from "@/components/car-listing/HeroSection";
import { CarListings } from "@/components/car-listing/CarListings";
import { useAuthProfile } from "@/hooks/useAuthProfile";

const Index = () => {
  // Explicitly set redirectIfNotAuthenticated to false for the home page
  const { session, userProfile, handleLogout } = useAuthProfile({ redirectIfNotAuthenticated: false });
  const [selectedDates, setSelectedDates] = useState(() => {
    const savedDates = localStorage.getItem('selectedDates');
    if (savedDates) {
      const parsed = JSON.parse(savedDates);
      return {
        from: parsed.from ? new Date(parsed.from) : undefined,
        to: parsed.to ? new Date(parsed.to) : undefined,
      };
    }
    return {
      from: undefined,
      to: undefined,
    };
  });
  
  const [location, setLocation] = useState(() => {
    return localStorage.getItem('selectedLocation') || "";
  });

  // Save dates and location to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('selectedDates', JSON.stringify(selectedDates));
  }, [selectedDates]);

  useEffect(() => {
    localStorage.setItem('selectedLocation', location);
  }, [location]);

  // Clear stored values after successful login
  useEffect(() => {
    if (session) {
      const hasStoredValues = localStorage.getItem('selectedDates') || localStorage.getItem('selectedLocation');
      if (hasStoredValues) {
        // We don't clear immediately to avoid a flash of empty content
        setTimeout(() => {
          localStorage.removeItem('selectedDates');
          localStorage.removeItem('selectedLocation');
        }, 1000);
      }
    }
  }, [session]);

  const { data: cars, isLoading: carsLoading } = useQuery({
    queryKey: ["cars", selectedDates],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select(`
          *,
          profiles (
            full_name
          ),
          car_availability (
            start_date,
            end_date,
            is_available
          ),
          bookings (
            id
          )
        `);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white relative">
      <AuthButtons 
        session={session} 
        userProfile={userProfile} 
        onLogout={handleLogout}
      />
      
      <HeroSection
        location={location}
        setLocation={setLocation}
        selectedDates={selectedDates}
        setSelectedDates={setSelectedDates}
      />

      <CarListings
        cars={cars}
        carsLoading={carsLoading}
        selectedDates={selectedDates}
      />
    </div>
  );
};

export default Index;
