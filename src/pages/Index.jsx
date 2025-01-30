import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Car, LogIn } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DateTimeRangePicker } from "@/components/DateTimeRangePicker";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const { toast } = useToast();
  const [selectedDates, setSelectedDates] = useState({
    from: undefined,
    to: undefined,
  });

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
          )
        `);

      if (error) throw error;
      return data;
    },
  });

  const AuthButtons = () => (
    <div className="absolute top-4 right-4 flex gap-4">
      {!session && (
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
      
      {/* Hero Section */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            Wildfloc Adventures
          </h1>
          <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto">
            Discover your next adventure with our premium car rental service
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto mb-12">
          <DateTimeRangePicker
            dateRange={selectedDates}
            onDateRangeChange={setSelectedDates}
          />
        </div>

        {carsLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-48 bg-gray-200" />
                <CardContent className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars?.filter(isCarAvailable).map((car) => (
              <Card 
                key={car.id} 
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden bg-white/80 backdrop-blur-sm"
                onClick={() => navigate(`/car/${car.id}`)}
              >
                <CardHeader className="p-0">
                  <div className="h-48 bg-gray-100 relative overflow-hidden group-hover:shadow-inner transition-all">
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
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="flex justify-between items-start mb-3">
                    <span className="text-xl font-bold text-gray-900">{car.model} ({car.year})</span>
                    <span className="text-lg font-semibold text-green-600">${car.rate_per_day}/day</span>
                  </CardTitle>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Provider:</span> 
                      {car.profiles.full_name}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Seats:</span> 
                      {car.seats}
                    </p>
                    <p className="text-green-600 font-medium mt-3">
                      Available for selected dates
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;