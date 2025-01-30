import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Car, LogIn, LogOut } from "lucide-react";
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const AuthButtons = () => (
    <div className="absolute top-4 right-4 flex gap-2">
      {session ? (
        <>
          <span className="text-sm text-gray-600 mr-2">
            Welcome, {userProfile?.full_name}
          </span>
          <Button 
            variant="outline" 
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </>
      ) : (
        <>
          <Button 
            variant="outline"
            onClick={() => navigate("/auth")}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Customer Login
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate("/provider/auth")}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Provider Login
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
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Ride
          </h1>
          
          <div className="w-full max-w-2xl mx-auto mb-12">
            <DateTimeRangePicker
              dateRange={selectedDates}
              onDateRangeChange={setSelectedDates}
            />
          </div>

          {carsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars?.filter(isCarAvailable).map((car) => (
                <Card 
                  key={car.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/car/${car.id}`)}
                >
                  <CardHeader className="p-0">
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      {car.image_url ? (
                        <img
                          src={car.image_url}
                          alt={car.model}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Car className="h-24 w-24 text-gray-400" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="flex justify-between items-start mb-2">
                      <span>{car.model} ({car.year})</span>
                      <span className="text-green-600">${car.rate_per_day}/day</span>
                    </CardTitle>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>Provider: {car.profiles.full_name}</p>
                      <p>Seats: {car.seats}</p>
                      <p className="text-green-600">
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
    </div>
  );
};

export default Index;