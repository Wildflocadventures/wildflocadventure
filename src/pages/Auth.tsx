
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"customer" | "provider">(() => {
    // Set default role based on URL
    return location.pathname.includes('/provider') ? "provider" : "customer";
  });
  const [defaultTab, setDefaultTab] = useState("login");

  useEffect(() => {
    // Check if we're on a provider-specific route
    const isProviderRoute = location.pathname.includes('/provider');
    setRole(isProviderRoute ? "provider" : "customer");
    
    // Set default tab if specified in query params
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'register') {
      setDefaultTab('register');
    }
  }, [location]);

  const validateForm = (isSignUp = false) => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }
    if (isSignUp && !fullName) {
      toast({
        title: "Error",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return false;
    }
    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSignUp = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!validateForm(true)) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) {
        console.error("Signup error:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Please check your email to confirm your account",
      });
      
      // Redirect based on role
      if (role === "provider") {
        navigate("/provider/dashboard");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        toast({
          title: "Error",
          description: "Invalid email or password",
          variant: "destructive",
        });
        return;
      }

      // Get user profile to determine role
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      toast({
        title: "Success",
        description: "Successfully signed in",
      });
      
      // Redirect based on user role
      if (profileData?.role === "provider") {
        navigate("/provider/dashboard");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPageTitle = () => {
    if (location.pathname.includes('/provider')) {
      return "Service Provider Portal";
    }
    return "Wildfloc Adventures";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-600 to-indigo-700 p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-none">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome to {getPageTitle()}</CardTitle>
          <CardDescription className="text-center">
            {role === "provider" 
              ? "Sign in or register as a service provider" 
              : "Sign in to your account or create a new one"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={defaultTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
                
                {role === "provider" && (
                  <div className="text-center mt-4">
                    <Button 
                      variant="outline" 
                      type="button" 
                      onClick={() => navigate("/auth")}
                      className="text-sm"
                    >
                      Switch to Customer Login
                    </Button>
                  </div>
                )}
                
                {role === "customer" && (
                  <div className="text-center mt-4">
                    <Button 
                      variant="outline" 
                      type="button" 
                      onClick={() => navigate("/provider/auth")}
                      className="text-sm"
                    >
                      Service Provider Login
                    </Button>
                  </div>
                )}
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailReg">Email</Label>
                  <Input
                    id="emailReg"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordReg">Password</Label>
                  <Input
                    id="passwordReg"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white"
                  />
                </div>
                
                {!location.pathname.includes('/provider') && (
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <RadioGroup
                      value={role}
                      onValueChange={(value) => setRole(value as "customer" | "provider")}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="customer" id="customer" />
                        <Label htmlFor="customer">Customer</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="provider" id="provider" />
                        <Label htmlFor="provider">Service Provider</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
                
                {location.pathname.includes('/provider') && (
                  <div className="p-3 bg-blue-50 rounded-md text-sm text-blue-700 mb-2">
                    You are registering as a Service Provider
                  </div>
                )}
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
                
                {role === "provider" && location.pathname.includes('/provider') && (
                  <div className="text-center mt-4">
                    <Button 
                      variant="outline" 
                      type="button" 
                      onClick={() => navigate("/auth")}
                      className="text-sm"
                    >
                      Switch to Customer Registration
                    </Button>
                  </div>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
