
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuthButtons } from "@/components/car-listing/AuthButtons";
import { HeroSection } from "@/components/car-listing/HeroSection";
import { CarListings } from "@/components/car-listing/CarListings";
import { useAuthProfile } from "@/hooks/useAuthProfile";

const Index = () => {
  const { session, userProfile, handleLogout } = useAuthProfile();
  const [selectedDates, setSelectedDates] = useState({
    from: undefined,
    to: undefined,
  });
  const [location, setLocation] = useState("");

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
