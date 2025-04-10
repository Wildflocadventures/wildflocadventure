
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, LogOut, Car, List, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from './logomaa.png';

interface NavbarProps {
  session: any;
  userProfile: any;
}

export const Navbar = ({ session, userProfile }: NavbarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = () => {
    navigate("/auth");
  };

  const handleProviderDashboard = () => {
    navigate("/provider/dashboard");
  };

  const handleSignup = () => {
    navigate("/auth");
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      navigate('/');
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
            <img src={logo} alt="Logo" className="h-12 w-auto mr-4" />
          </div>
          
          <div className="flex gap-4">
            {!session ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleLogin}
                  className="flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Customer Login
                </Button>
                <Button
                  variant="outline"
                  onClick={handleProviderDashboard}
                  className="flex items-center gap-2"
                >
                  <Car className="w-4 h-4" />
                  Provider Dashboard
                </Button>
                <Button
                  onClick={handleSignup}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                {userProfile?.role === 'provider' ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleProviderDashboard}
                      className="flex items-center gap-2"
                    >
                      <Car className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => navigate('/customer/bookings')}
                    className="flex items-center gap-2"
                  >
                    <List className="w-4 h-4" />
                    My Bookings
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
