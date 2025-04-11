
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Car, ArrowLeft, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthProfile } from "@/hooks/useAuthProfile";

const ProviderBookingsPage = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  // Use the hook to ensure we're authenticated
  const { session, userProfile } = useAuthProfile({ redirectIfNotAuthenticated: true });

  useEffect(() => {
    if (session?.user) {
      console.log("ProviderBookingsPage: User session found, fetching bookings");
      fetchBookings();

      // Set up an interval to refresh bookings every 30 seconds
      const refreshInterval = setInterval(() => {
        fetchBookings(false); // Refresh quietly without loading state
      }, 30000);

      return () => clearInterval(refreshInterval);
    }
  }, [session]);

  const fetchBookings = async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      console.log("ProviderBookingsPage: Fetching bookings");
      
      if (!session?.user) {
        console.log("ProviderBookingsPage: No authenticated user found");
        return;
      }
      
      const userId = session.user.id;
      console.log("ProviderBookingsPage: User ID:", userId);
      
      // First get all cars belonging to this provider
      const { data: cars, error: carsError } = await supabase
        .from("cars")
        .select("id, model, provider_id")
        .eq("provider_id", userId);

      if (carsError) {
        console.error("ProviderBookingsPage: Error fetching cars:", carsError);
        throw carsError;
      }

      console.log("ProviderBookingsPage: Found cars:", cars?.length);

      if (!cars || cars.length === 0) {
        console.log("ProviderBookingsPage: No cars found for this provider");
        setBookings([]);
        return;
      }

      // Create a map of car IDs to their models for easier lookup
      const carIdToModel = cars.reduce((acc, car) => {
        acc[car.id] = car.model;
        return acc;
      }, {} as Record<string, string>);

      const carIds = cars.map(car => car.id);
      console.log("ProviderBookingsPage: Car IDs:", carIds);

      // Get bookings for these cars with explicit inclusion of all statuses
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select(`
          id,
          car_id,
          customer_id,
          start_date,
          end_date,
          status,
          total_amount,
          created_at,
          profiles:customer_id(full_name)
        `)
        .in("car_id", carIds)
        .order('created_at', { ascending: false });

      if (bookingsError) {
        console.error("ProviderBookingsPage: Error fetching bookings:", bookingsError);
        throw bookingsError;
      }

      console.log("ProviderBookingsPage: Raw bookings data:", bookingsData);
      
      // Check for confirmed bookings specifically
      const confirmedBookings = bookingsData?.filter(booking => booking.status === 'confirmed') || [];
      console.log("ProviderBookingsPage: Confirmed bookings:", confirmedBookings.length);

      // Add car model information to each booking
      const bookingsWithCarModel = bookingsData?.map(booking => ({
        ...booking,
        car_model: carIdToModel[booking.car_id],
        customer_name: booking.profiles?.full_name || "Unknown Customer"
      })) || [];

      console.log("ProviderBookingsPage: Processed bookings with models:", bookingsWithCarModel);
      setBookings(bookingsWithCarModel);
      
      if (!showLoadingState && bookingsWithCarModel.length > 0) {
        toast({
          title: "Updated",
          description: `Refreshed bookings: ${bookingsWithCarModel.length} total, ${confirmedBookings.length} confirmed`,
        });
      }
    } catch (error: any) {
      console.error("Error fetching provider bookings:", error);
      toast({
        title: "Error",
        description: "Could not load bookings. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Function to manually refresh bookings
  const refreshBookings = () => {
    fetchBookings(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Car Bookings Dashboard</h1>
        <div className="flex gap-2">
          <Button 
            onClick={refreshBookings}
            className="flex items-center gap-2"
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isLoading ? "Loading..." : isRefreshing ? "Refreshing..." : "Refresh Bookings"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/provider/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center text-center h-40">
            <CalendarDays className="h-10 w-10 text-gray-400 mb-4" />
            <p className="text-gray-500">No bookings yet for your cars</p>
            <p className="text-gray-400 mt-2">When customers book your cars, they will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  {booking.car_model}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Booking Dates</span>
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
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-gray-500" />
                      {format(new Date(booking.start_date), "MMM d, yyyy")} - {format(new Date(booking.end_date), "MMM d, yyyy")}
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Customer: {booking.customer_name}
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Total Amount</span>
                      <span className="font-medium">${booking.total_amount}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderBookingsPage;
