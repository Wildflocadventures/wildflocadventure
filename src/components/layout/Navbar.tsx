
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, MapPin, Star, Info, Phone, Car } from "lucide-react";

interface NavbarProps {
  session: any;
  userProfile: any;
}

export const Navbar = ({ session, userProfile }: NavbarProps) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/auth");
  };

  const handleSignup = () => {
    navigate("/auth?tab=register");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src="/Wildfloc.png" 
            alt="WILDFLOC" 
            className="h-10 cursor-pointer"
            onClick={() => navigate('/')}
          />
        </div>
        
        <div className="hidden md:flex space-x-8">
          <a 
            onClick={() => navigate('/')} 
            className="text-white hover:text-gray-300 font-medium flex items-center cursor-pointer"
          >
            <Home className="w-4 h-4 mr-1" />
            Home
          </a>
          <a 
            onClick={() => navigate('/car-rentals')} 
            className="text-white hover:text-gray-300 font-medium flex items-center cursor-pointer"
          >
            <Car className="w-4 h-4 mr-1" />
            Car Rentals
          </a>
          <a 
            onClick={() => navigate('/activities')} 
            className="text-white hover:text-gray-300 font-medium flex items-center cursor-pointer"
          >
            <MapPin className="w-4 h-4 mr-1" />
            Activities
          </a>
          <a 
            onClick={() => navigate('/features')} 
            className="text-white hover:text-gray-300 font-medium flex items-center cursor-pointer"
          >
            <Star className="w-4 h-4 mr-1" />
            Features
          </a>
          <a 
            onClick={() => navigate('/about')} 
            className="text-white hover:text-gray-300 font-medium flex items-center cursor-pointer"
          >
            <Info className="w-4 h-4 mr-1" />
            About
          </a>
          <a 
            onClick={() => navigate('/contact')} 
            className="text-white hover:text-gray-300 font-medium flex items-center cursor-pointer"
          >
            <Phone className="w-4 h-4 mr-1" />
            Contact
          </a>
        </div>
        
        <div className="flex space-x-3">
          {!session ? (
            <>
              <Button 
                variant="outline" 
                className="border-red-600 text-white bg-red-600/30 hover:bg-red-600"
                onClick={handleLogin}
              >
                Login
              </Button>
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleSignup}
              >
                Sign Up
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              className="border-red-600 text-white bg-red-600/30 hover:bg-red-600"
              onClick={() => navigate('/customer/bookings')}
            >
              My Bookings
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};
