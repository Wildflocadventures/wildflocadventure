import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Car, UserCircle, Truck, User, LogOut } from "lucide-react";
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

  const LogoutButton = () => (
    <Button 
      variant="outline" 
      className="absolute top-4 right-4"
      onClick={handleLogout}
    >
      <LogOut className="w-4 h-4 mr-2" />
      Logout
    </Button>
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

  if (session && userProfile) {
    if (userProfile.role === "customer") {
      return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white relative">
          <LogoutButton />
          <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome, {userProfile.full_name}
              </h1>
              <h2 className="text-2xl text-gray-600 mb-8">
                Find Your Perfect Ride
              </h2>
              
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
    }
    // Provider view
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white relative">
        <LogoutButton />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Welcome to Your Dashboard, {userProfile.full_name}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Manage your car listings and bookings
            </p>
            <Button 
              className="w-full max-w-md mx-auto"
              onClick={() => navigate("/provider/dashboard")}
            >
              Go to Provider Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in view
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Your Trusted Car Rental Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Find the perfect car for your journey, or rent out your vehicle to earn extra income
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {/* Customer Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <User className="w-6 h-6" />
                  Customer
                </CardTitle>
                <CardDescription>
                  Looking to rent a car?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Browse and book cars for your next journey
                </p>
                <div className="space-y-2">
                  <Button 
                    className="w-full"
                    onClick={() => navigate("/auth")}
                  >
                    Sign In / Register as Customer
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Service Provider Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Truck className="w-6 h-6" />
                  Service Provider
                </CardTitle>
                <CardDescription>
                  Want to rent out your cars?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Register as a service provider to list and manage your cars
                </p>
                <div className="space-y-2">
                  <Button 
                    className="w-full"
                    onClick={() => navigate("/provider/auth")}
                  >
                    Sign In / Register as Provider
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Section */}
          <div className="mt-20 grid md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Wide Selection"
              description="Choose from a variety of cars to match your needs and budget"
              icon={<Car className="w-8 h-8 text-blue-500" />}
            />
            <FeatureCard 
              title="Easy Booking"
              description="Simple and secure booking process with instant confirmation"
              icon={<Car className="w-8 h-8 text-blue-500" />}
            />
            <FeatureCard 
              title="Flexible Rentals"
              description="Rent cars by the day, week, or month with competitive rates"
              icon={<Car className="w-8 h-8 text-blue-500" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ title, description, icon }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default Index;