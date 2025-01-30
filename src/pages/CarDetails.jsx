import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Star, ArrowLeft } from "lucide-react";
import { DateTimeRangePicker } from "@/components/DateTimeRangePicker";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDates, setSelectedDates] = useState({
    from: undefined,
    to: undefined,
  });

  const { data: car, isLoading } = useQuery({
    queryKey: ["car", id],
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
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
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
      const { error } = await supabase
        .from("bookings")
        .insert({
          car_id: id,
          customer_id: user.id,
          start_date: selectedDates.from.toISOString(),
          end_date: selectedDates.to.toISOString(),
          total_amount: totalAmount,
          status: 'pending'
        });

      if (error) throw error;

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

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-200 rounded-lg" />
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
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
              className="w-full h-64 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <Car className="h-24 w-24 text-gray-400" />
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-start">
              <span>{car.model} ({car.year})</span>
              <span className="text-green-600">${car.rate_per_day}/day</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p><strong>Provider:</strong> {car.profiles.full_name}</p>
              <p><strong>License Plate:</strong> {car.license_plate}</p>
              <p><strong>Seats:</strong> {car.seats}</p>
              {car.description && (
                <p><strong>Description:</strong> {car.description}</p>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Book this car</h3>
              <DateTimeRangePicker
                dateRange={selectedDates}
                onDateRangeChange={setSelectedDates}
              />
              <Button 
                className="w-full mt-4"
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