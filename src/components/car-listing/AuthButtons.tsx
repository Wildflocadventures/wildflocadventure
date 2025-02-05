import { Button } from "@/components/ui/button";
import { User, Users, BookOpen, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Profile } from "@/types/supabase";
import { useToast } from "@/hooks/use-toast";

interface AuthButtonsProps {
  session: any;
  userProfile: Profile | null;
  onLogout: () => Promise<void>;
}

export const AuthButtons = ({ session, userProfile, onLogout }: AuthButtonsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCustomerLogin = () => {
    navigate("/auth");
  };

  const handleProviderLogin = () => {
    navigate("/provider/auth");
  };

  const handleMyBookings = () => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please login to view your bookings",
        variant: "destructive",
      });
      return;
    }
    navigate("/customer/bookings");
  };

  const handleDashboard = () => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please login to access your dashboard",
        variant: "destructive",
      });
      return;
    }
    navigate("/provider/dashboard");
  };

  const handleLogoutClick = async () => {
    try {
      await onLogout();
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!session) {
    return (
      <div className="absolute top-4 right-4 flex gap-4">
        <Button 
          variant="outline"
          className="bg-white/90 hover:bg-white/70 transition-all"
          onClick={handleCustomerLogin}
        >
          <User className="w-4 h-4 mr-2" />
          Customer Login
        </Button>
        <Button 
          variant="outline"
          className="bg-white/90 backdrop-blur-sm hover:bg-white/70 transition-all"
          onClick={handleProviderLogin}
        >
          <Users className="w-4 h-4 mr-2" />
          Service Provider
        </Button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 flex gap-4">
      {userProfile?.role === 'customer' && (
        <Button
          variant="outline"
          className="bg-white/90 backdrop-blur-sm hover:bg-white/70 transition-all"
          onClick={handleMyBookings}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          My Bookings
        </Button>
      )}
      {userProfile?.role === 'provider' && (
        <Button
          variant="outline"
          className="bg-white/90 backdrop-blur-sm hover:bg-white/70 transition-all"
          onClick={handleDashboard}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Dashboard
        </Button>
      )}
      <Button
        variant="outline"
        className="bg-white/90 backdrop-blur-sm hover:bg-white/70 transition-all"
        onClick={handleLogoutClick}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
};