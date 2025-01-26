import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Car, UserCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            CabConnecto - Your Trusted Car Rental Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Find the perfect car for your journey, or rent out your vehicle to earn extra income
          </p>
          
          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate("/auth")}
              className="flex items-center gap-2"
            >
              <UserCircle className="w-5 h-5" />
              Sign In / Register
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate("/cars")}
              className="flex items-center gap-2"
            >
              <Car className="w-5 h-5" />
              Browse Cars
            </Button>
          </div>
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