
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HeroSection } from "@/components/car-listing/HeroSection";
import { CarListings } from "@/components/car-listing/CarListings";
import { useAuthProfile } from "@/hooks/useAuthProfile";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home, MapPin, Star, Info, Phone, LogIn, UserPlus } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">WILDFLOC</h1>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <a href="#" className="text-white hover:text-gray-300 font-medium flex items-center">
              <Home className="w-4 h-4 mr-1" />
              Home
            </a>
            <a href="#" className="text-white hover:text-gray-300 font-medium flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              Activities
            </a>
            <a href="#" className="text-white hover:text-gray-300 font-medium flex items-center">
              <Star className="w-4 h-4 mr-1" />
              Features
            </a>
            <a href="#" className="text-white hover:text-gray-300 font-medium flex items-center">
              <Info className="w-4 h-4 mr-1" />
              About
            </a>
            <a href="#" className="text-white hover:text-gray-300 font-medium flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              Contact
            </a>
          </div>
          
          <div className="flex space-x-3">
            {!session ? (
              <>
                <Button 
                  variant="outline" 
                  className="border-red-600 text-white hover:bg-red-600"
                  onClick={() => navigate('/auth')}
                >
                  <LogIn className="w-4 h-4 mr-1" />
                  Login
                </Button>
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => navigate('/auth?tab=register')}
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Sign Up
                </Button>
              </>
            ) : (
              // Use the existing AuthButtons component's functionality here
              <Button
                variant="outline"
                className="border-red-600 text-white hover:bg-red-600"
                onClick={handleLogout}
              >
                Logout
              </Button>
            )}
          </div>
        </div>
      </nav>
      
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
