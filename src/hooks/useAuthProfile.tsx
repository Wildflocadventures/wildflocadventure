
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const useAuthProfile = () => {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.info("useAuth: Initializing");
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.info("useAuth: Got session", session);
      setSession(session);
      if (session?.user?.id) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.info("useAuth: Auth state changed", session);
      setSession(session);
      if (session?.user?.id) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        setLoading(false);
        return;
      }

      if (data) {
        console.log("User profile:", data);
        setUserProfile(data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
      setLoading(false);
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

  return { session, userProfile, loading, handleLogout };
};
