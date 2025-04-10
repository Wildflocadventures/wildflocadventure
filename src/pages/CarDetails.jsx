
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, ArrowLeft, Star, Fuel, Users, DoorOpen } from "lucide-react";
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
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      if (!data) throw new Error("Car not found");
      
      console.log("Car data with provider:", data);
      return data;
    },
    enabled: Boolean(id),
    retry: false
  });

  const isCarAvailable = () => {
    if (!selectedDates.from || !selectedDates.to || !car?.car_availability) return true;
    
    const hasUnavailabilityConflict = car.car_availability.some((availability) => {
      if (availability.is_available) return false;
      
      const availStart = new Date(availability.start_date);
      const availEnd = new Date(availability.end_date);
      
      return (
        (selectedDates.from <= availEnd && selectedDates.to >= availStart) ||
        (selectedDates.from >= availStart && selectedDates.from <= availEnd) ||
        (selectedDates.to >= availStart && selectedDates.to <= availEnd)
      );
    });

    return !hasUnavailabilityConflict;
  };

  const handleBooking = async () => {
    if (!selectedDates.from || !selectedDates.to) {
      toast({
        title: "Error",
        description: "Please select booking dates",
        variant: "destructive",
      });
      return;
    }

    if (!isCarAvailable()) {
      toast({
        title: "Error",
        description: "The car is not available for the selected dates",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("Auth error:", userError);
        toast({
          title: "Error",
          description: "Please login to book a car",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        console.error("Profile error:", profileError);
        toast({
          title: "Error",
          description: "Your user profile is not set up properly. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      const days = Math.ceil((selectedDates.to.getTime() - selectedDates.from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const totalAmount = days * car.rate_per_day;

      console.log("Creating booking with customer_id:", profile.id);
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          car_id: id,
          customer_id: profile.id,
          start_date: selectedDates.from.toISOString(),
          end_date: selectedDates.to.toISOString(),
          total_amount: totalAmount,
          status: 'pending'
        })
        .select()
        .single();

      if (bookingError) {
        console.error("Booking error:", bookingError);
        throw bookingError;
      }

      toast({
        title: "Success",
        description: "Please fill in your details to complete the booking.",
      });

      navigate("/customer/details", { 
        state: { bookingId: booking.id }
      });
      
    } catch (error) {
      console.error("Booking creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    console.error("Query error:", error);
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
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="relative h-[400px] rounded-xl overflow-hidden">
            {car.image_url ? (
              <img
                src={car.image_url}
                alt={car.model}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <Car className="h-32 w-32 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{car.model} ({car.year})</h1>
                <div className="flex items-center mt-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-gray-700">5.0 (10 trips)</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">₹{car.rate_per_day}</p>
                <p className="text-sm text-gray-500">per day</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Fuel className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">22 MPG</span>
              </div>
              <div className="flex items-center space-x-2">
                <DoorOpen className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">4 doors</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">{car.seats} seats</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {car.description || "No description available"}
              </p>
            </div>

            <div className="border-t pt-4">
              <h2 className="text-xl font-semibold mb-2">Host</h2>
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  {car.profiles?.full_name?.[0] || "P"}
                </div>
                <div>
                  <p className="font-medium">{car.profiles?.full_name}</p>
                  <p className="text-sm text-gray-500">Joined Nov 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-8">
          <Card className="backdrop-blur-sm bg-white/50">
            <CardHeader>
              <CardTitle>Book this car</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DateTimeRangePicker
                dateRange={selectedDates}
                onDateRangeChange={setSelectedDates}
              />
              {!isCarAvailable() && (
                <p className="text-red-600 text-sm">
                  This car is not available for the selected dates. Please choose different dates.
                </p>
              )}
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                onClick={handleBooking}
                disabled={!isCarAvailable()}
              >
                Book Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;
