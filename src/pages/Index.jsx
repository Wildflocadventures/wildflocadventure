import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Car, LogIn, LogOut, Calendar, Search, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DateTimeRangePicker } from "@/components/DateTimeRangePicker";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const { toast } = useToast();
  const [selectedDates, setSelectedDates] = useState({
    from: undefined,
    to: undefined,
  });
  const [location, setLocation] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        fetchUserProfile(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.id) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setUserProfile(data);
    }
  };

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const AuthButtons = () => (
    <div className="absolute top-4 right-4 flex gap-4">
      {!session ? (
        <>
          <Button 
            variant="outline"
            className="bg-white/90 backdrop-blur-sm hover:bg-white/70 transition-all"
            onClick={() => navigate("/auth")}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Customer
          </Button>
          <Button 
            variant="outline"
            className="bg-white/90 backdrop-blur-sm hover:bg-white/70 transition-all"
            onClick={() => navigate("/provider/auth")}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Service Provider
          </Button>
        </>
      ) : (
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="bg-white/90 backdrop-blur-sm hover:bg-white/70 transition-all"
            onClick={() => navigate("/customer/bookings")}
          >
            <Calendar className="w-4 h-4 mr-2" />
            My Bookings
          </Button>
          <Button
            variant="outline"
            className="bg-white/90 backdrop-blur-sm hover:bg-white/70 transition-all"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      )}
    </div>
  );

  const isCarAvailable = (car) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white relative">
      <AuthButtons />
      
      <div className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        <div className="relative max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 text-center">
            Wildfloc Adventures
          </h1>
          
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Where</label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="City, airport, address or hotel"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <DateTimeRangePicker
                  dateRange={selectedDates}
                  onDateRangeChange={setSelectedDates}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {carsLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars?.filter(isCarAvailable).map((car) => (
              <Card 
                key={car.id} 
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                onClick={() => navigate(`/car/${car.id}`)}
              >
                <div className="relative">
                  <div className="absolute top-4 right-4 z-10">
                    <button className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors">
                      <Star className="h-5 w-5 text-yellow-500" />
                    </button>
                  </div>
                  <div className="h-48 relative overflow-hidden">
                    {car.image_url ? (
                      <img
                        src={car.image_url}
                        alt={car.model}
                        className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <Car className="h-24 w-24 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{car.model} ({car.year})</h3>
                    <span className="text-lg font-bold text-green-600">${car.rate_per_day}/day</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-yellow-500 mb-2">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-medium">5.0</span>
                    <span className="text-sm text-gray-500">
                      ({car.bookings?.length || 0} trips)
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      Host: {car.profiles.full_name}
                    </p>
                    <p className="flex items-center gap-2">
                      Seats: {car.seats}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;