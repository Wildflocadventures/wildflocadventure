
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Car, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export const ProviderBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      console.log("ProviderBookings: Fetching bookings");
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("ProviderBookings: No authenticated user found");
        setIsLoading(false);
        return;
      }
      
      console.log("ProviderBookings: User ID:", user.id);

      // First get the cars belonging to the provider
      const { data: cars, error: carsError } = await supabase
        .from("cars")
        .select("id, model")
        .eq("provider_id", user.id);

      if (carsError) {
        console.error("ProviderBookings: Error fetching cars:", carsError);
        throw carsError;
      }

      console.log("ProviderBookings: Found cars:", cars?.length);

      if (!cars || cars.length === 0) {
        console.log("ProviderBookings: No cars found for this provider");
        setIsLoading(false);
        setBookings([]);
        return;
      }

      // Create a map of car IDs to their models for easier lookup
      const carIdToModel = cars.reduce((acc, car) => {
        acc[car.id] = car.model;
        return acc;
      }, {} as Record<string, string>);

      const carIds = cars.map(car => car.id);
      console.log("ProviderBookings: Car IDs:", carIds);

      // Get bookings for these cars
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select(`
          id,
          car_id,
          start_date,
          end_date,
          status,
          customer_id,
          profiles:customer_id(full_name)
        `)
        .in("car_id", carIds)
        .order("start_date", { ascending: false });

      if (bookingsError) {
        console.error("ProviderBookings: Error fetching bookings:", bookingsError);
        throw bookingsError;
      }

      console.log("ProviderBookings: Fetched bookings:", bookingsData);

      // Add car model information to each booking
      const bookingsWithCarModel = bookingsData?.map(booking => ({
        ...booking,
        car_model: carIdToModel[booking.car_id],
        customer_name: booking.profiles?.full_name || "Unknown Customer"
      })) || [];

      setBookings(bookingsWithCarModel);
    } catch (error: any) {
      console.error("Error fetching provider bookings:", error);
      toast({
        title: "Error",
        description: "Could not load bookings. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchBookings();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Bookings</CardTitle>
          <Button size="sm" variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="pt-1 flex flex-col items-center justify-center text-center h-40">
          <CalendarDays className="h-10 w-10 text-gray-400 mb-4" />
          <p className="text-gray-500">No bookings yet for your cars</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Recent Bookings</h2>
        <Button size="sm" variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      {bookings.map((booking) => (
        <Card key={booking.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center p-4">
              <div className="flex-1">
                <div className="flex items-center">
                  <Car className="h-5 w-5 text-gray-500 mr-2" />
                  <p className="font-medium text-gray-900">{booking.car_model}</p>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {format(new Date(booking.start_date), "MMM d, yyyy")} - {format(new Date(booking.end_date), "MMM d, yyyy")}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Customer: {booking.customer_name}
                </div>
              </div>
              <div className="flex-shrink-0">
                <span 
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    booking.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : booking.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
