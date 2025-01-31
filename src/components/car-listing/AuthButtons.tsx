import { Button } from "@/components/ui/button";
import { User, Users, Calendar, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Profile } from "@/types/supabase";

interface AuthButtonsProps {
  session: any;
  userProfile: Profile | null;
  onLogout: () => Promise<void>;
}

export const AuthButtons = ({ session, userProfile, onLogout }: AuthButtonsProps) => {
  const navigate = useNavigate();

  if (!session) {
    return (
      <div className="absolute top-4 right-4 flex gap-4">
        <Button 
          variant="outline"
          className="bg-white/90 backdrop-blur-sm hover:bg-white/70 transition-all"
          onClick={() => navigate("/auth")}
        >
          <User className="w-4 h-4 mr-2" />
          Customer Login
        </Button>
        <Button 
          variant="outline"
          className="bg-white/90 backdrop-blur-sm hover:bg-white/70 transition-all"
          onClick={() => navigate("/provider/auth")}
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
          onClick={() => navigate("/customer/bookings")}
        >
          <Calendar className="w-4 h-4 mr-2" />
          My Bookings
        </Button>
      )}
      {userProfile?.role === 'provider' && (
        <Button
          variant="outline"
          className="bg-white/90 backdrop-blur-sm hover:bg-white/70 transition-all"
          onClick={() => navigate("/provider/dashboard")}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Dashboard
        </Button>
      )}
      <Button
        variant="outline"
        className="bg-white/90 backdrop-blur-sm hover:bg-white/70 transition-all"
        onClick={onLogout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
};