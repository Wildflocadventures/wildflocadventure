import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, ArrowLeft } from "lucide-react";
import { DateTimeRangePicker } from "@/components/DateTimeRangePicker";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDates, setSelectedDates] = useState({
    from: undefined,
    to: undefined,
  });

  const { data: car, isLoading, error } = useQuery({
    queryKey: ["car", id],
    queryFn: async () => {
      if (!id) throw new Error("No car ID provided");
      
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
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Car not found");
      return data;
    },
    enabled: Boolean(id),
    retry: false
  });

  const handleBooking = async () => {
    if (!selectedDates.from || !selectedDates.to) {
      toast({
        title: "Error",
        description: "Please select booking dates",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to book a car",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    const days = Math.ceil((selectedDates.to.getTime() - selectedDates.from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalAmount = days * car.rate_per_day;

    try {
      const { error: bookingError } = await supabase
        .from("bookings")
        .insert({
          car_id: id,
          customer_id: user.id,
          start_date: selectedDates.from.toISOString(),
          end_date: selectedDates.to.toISOString(),
          total_amount: totalAmount,
          status: 'pending'
        });

      if (bookingError) throw bookingError;

      toast({
        title: "Success",
        description: "Car booked successfully! Please proceed with the payment.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Car Details</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Car Not Found</h2>
          <p className="text-gray-600 mb-4">The car you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          {car.image_url ? (
            <img
              src={car.image_url}
              alt={car.model}
              className="w-full h-64 object-cover rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center shadow-inner">
              <Car className="h-24 w-24 text-gray-400" />
            </div>
          )}
        </div>

        <Card className="backdrop-blur-sm bg-white/50">
          <CardHeader>
            <CardTitle className="flex justify-between items-start">
              <span className="text-2xl font-bold text-gray-800">{car.model} ({car.year})</span>
              <span className="text-xl font-semibold text-green-600">${car.rate_per_day}/day</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="text-gray-700"><strong>Provider:</strong> {car.profiles.full_name}</p>
              <p className="text-gray-700"><strong>License Plate:</strong> {car.license_plate}</p>
              <p className="text-gray-700"><strong>Seats:</strong> {car.seats}</p>
              {car.description && (
                <p className="text-gray-700"><strong>Description:</strong> {car.description}</p>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Book this car</h3>
              <DateTimeRangePicker
                dateRange={selectedDates}
                onDateRangeChange={setSelectedDates}
              />
              <Button 
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                onClick={handleBooking}
              >
                Book Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CarDetails;