import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Car, UserCircle, Truck, User, LogOut } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        fetchUserProfile(session.user.id);
      }
    });

    // Listen for auth changes
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

  useEffect(() => {
    // Redirect customers directly to cars page
    if (userProfile?.role === 'customer') {
      navigate('/cars');
    }
  }, [userProfile, navigate]);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setUserProfile(data);
    }
  };

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

  if (session && userProfile) {
    // Show different content based on user role
    if (userProfile.role === "provider") {
      return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white relative">
          <LogoutButton />
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                Welcome to Wildfloc, {userProfile.full_name}
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
    // Customer view will redirect to /cars
    return null;
  }

  // Not logged in view
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Wildfloc - Your Trusted Car Rental Platform
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
const FeatureCard = ({ 
  title, 
  description, 
  icon 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
}) => {
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