import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { Profile } from "@/types/supabase";

export interface AuthOptions {
  redirectIfNotAuthenticated?: boolean;
}

export const useAuth = (options: AuthOptions = { redirectIfNotAuthenticated: false }) => {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("useAuth: Initializing");
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("useAuth: Got session", session?.user?.id);
      setSession(session);
      if (session?.user?.id) {
        fetchUserProfile(session.user.id);
      } else if (options.redirectIfNotAuthenticated && location.pathname !== '/') {
        console.log("useAuth: Redirecting to auth");
        navigate('/auth');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("useAuth: Auth state changed", session?.user?.id);
      setSession(session);
      if (session?.user?.id) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        if (options.redirectIfNotAuthenticated && location.pathname !== '/') {
          console.log("useAuth: Redirecting to auth on state change");
          navigate('/auth');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, options.redirectIfNotAuthenticated, location.pathname]);

  const fetchUserProfile = async (userId: string) => {
    try {
      setIsLoading(true);
      console.log("useAuth: Fetching user profile for", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }

      if (data) {
        console.log("User profile:", data);
        setUserProfile(data as Profile);
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error logging out:", error);
        toast({
          title: "Error",
          description: "Failed to log out",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Logged out successfully",
        });
        setSession(null);
        setUserProfile(null);
        navigate('/');
      }
    } catch (error) {
      console.error("Error in logout handler:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return { 
    session, 
    userProfile, 
    handleLogout,
    isLoading 
  };
};
