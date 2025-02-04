import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProviderAuthForm } from "@/components/auth/ProviderAuthForm";

const ProviderAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async ({
    email,
    password,
    fullName,
    phone,
  }: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
  }) => {
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone,
              role: 'provider'
            }
          }
        });

        if (signUpError) throw signUpError;

        toast({
          title: "Success",
          description: "Please check your email to verify your account",
        });
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', signInData.user.id)
          .single();

        if (profile?.role !== 'provider') {
          await supabase.auth.signOut();
          throw new Error("This account is not registered as a provider");
        }

        toast({
          title: "Success",
          description: "Successfully signed in",
        });
        navigate("/provider/dashboard");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      let errorMessage = "An unexpected error occurred";
      
      if (error.message === "User already registered") {
        errorMessage = "This email is already registered. Please sign in instead.";
        setIsSignUp(false);
      } else if (error.message === "Invalid login credentials") {
        errorMessage = "Invalid email or password";
      } else if (error.message === "This account is not registered as a provider") {
        errorMessage = "This account is not registered as a provider";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {isSignUp ? "Create Provider Account" : "Provider Login"}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp
              ? "Sign up as a service provider"
              : "Sign in to your provider account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProviderAuthForm
            isSignUp={isSignUp}
            isLoading={isLoading}
            onSubmit={handleAuth}
            onToggleMode={() => setIsSignUp(!isSignUp)}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderAuth;