
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CarListings } from "@/components/car-listing/CarListings";
import { PageLayout } from "@/components/layout/PageLayout";

const CarRentals = () => {
  const [selectedDates, setSelectedDates] = useState({
    from: undefined,
    to: undefined,
  });

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
    <PageLayout>
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold mb-8 text-center text-orange-500">Car Rentals</h1>
        <p className="text-xl text-center text-gray-300 mb-16 max-w-3xl mx-auto">
          Explore our fleet of high-quality vehicles available for rent. Find the perfect car for your journey, whether it's a weekend getaway or a business trip.
        </p>
        
        <CarListings
          cars={cars}
          carsLoading={carsLoading}
          selectedDates={selectedDates}
        />
      </div>
    </PageLayout>
  );
};

export default CarRentals;
