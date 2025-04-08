
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, MapPin, Star, Info, Phone } from "lucide-react";

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
          <a href="#" className="text-white hover:text-gray-300 font-medium flex items-center">
            <Home className="w-4 h-4 mr-1" />
            Home
          </a>
          <a href="#" className="text-white hover:text-gray-300 font-medium flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            Activities
          </a>
          <a href="#" className="text-white hover:text-gray-300 font-medium flex items-center">
            <Star className="w-4 h-4 mr-1" />
            Features
          </a>
          <a href="#" className="text-white hover:text-gray-300 font-medium flex items-center">
            <Info className="w-4 h-4 mr-1" />
            About
          </a>
          <a href="#" className="text-white hover:text-gray-300 font-medium flex items-center">
            <Phone className="w-4 h-4 mr-1" />
            Contact
          </a>
        </div>
        
        <div className="flex space-x-3">
          {!session ? (
            <>
              <Button 
                variant="outline" 
                className="border-red-600 text-white hover:bg-red-600"
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
              className="border-red-600 text-white hover:bg-red-600"
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
