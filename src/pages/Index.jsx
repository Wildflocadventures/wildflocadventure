
import { useState, useEffect } from "react";
import { useAuthProfile } from "@/hooks/useAuthProfile";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/car-listing/HeroSection";
import { ServiceSection } from "@/components/travel-services/ServiceSection";

const Index = () => {
  // Explicitly set redirectIfNotAuthenticated to false for the home page
  const { session, userProfile } = useAuthProfile({ redirectIfNotAuthenticated: false });
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

  return (
    <div className="min-h-screen bg-black">
      <Navbar session={session} userProfile={userProfile} />
      
      <HeroSection
        location={location}
        setLocation={setLocation}
        selectedDates={selectedDates}
        setSelectedDates={setSelectedDates}
      />

      <ServiceSection />
    </div>
  );
};

export default Index;
