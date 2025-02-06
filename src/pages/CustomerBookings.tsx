
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Calendar, Car, DollarSign } from "lucide-react";
import { format } from "date-fns";

const CustomerBookings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        cars (
          model,
          year,
          rate_per_day,
          license_plate,
          image_url,
          seats,
          profiles (
            full_name
          )
        )
      `)
      .eq("customer_id", user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your bookings",
        variant: "destructive",
      });
    } else {
      setBookings(data || []);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      navigate('/');
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <Button 
            variant="outline"
            onClick={handleLogout}
            className="bg-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid gap-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="p-6 bg-white">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                  {booking.cars.image_url ? (
                    <img
                      src={booking.cars.image_url}
                      alt={booking.cars.model}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Car className="h-20 w-20 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {booking.cars.model} ({booking.cars.year})
                      </h3>
                      <p className="text-sm text-gray-500">
                        Host: {booking.cars.profiles?.full_name || 'Unknown Host'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-green-600">
                        <DollarSign className="h-5 w-5" />
                        <span className="text-xl font-bold">{booking.total_amount}</span>
                      </div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Start Date</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{format(new Date(booking.start_date), "LLL dd, y")}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">End Date</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{format(new Date(booking.end_date), "LLL dd, y")}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm">
                      License Plate: <span className="font-medium">{booking.cars.license_plate}</span>
                    </p>
                    <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                      {booking.status}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          {bookings.length === 0 && (
            <Card className="p-12 text-center bg-white">
              <Car className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Bookings Found</h3>
              <p className="text-gray-500">You haven't made any bookings yet.</p>
              <Button 
                className="mt-6"
                onClick={() => navigate('/')}
              >
                Browse Cars
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerBookings;
