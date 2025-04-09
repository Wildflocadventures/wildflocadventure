
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
import { ArrowRight, User, Mail, Lock, UserPlus } from "lucide-react";

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4 bg-gradient-to-b from-black to-gray-900">
      <div className="w-full max-w-md relative">
        {/* Background decorative elements */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>

        <Card className="border border-gray-800 bg-black/80 backdrop-blur-xl text-white shadow-2xl shadow-orange-900/10">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <img 
                src="/Wildfloc.png" 
                alt="WILDFLOC" 
                className="h-12"
                onClick={() => navigate('/')}
              />
            </div>
            <CardTitle className="text-2xl text-center font-bold text-orange-500">
              {defaultTab === "login" ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              {role === "provider" 
                ? "Access your service provider dashboard" 
                : "Start your adventure with us"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-gray-900">
                <TabsTrigger 
                  value="login"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="register"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                >
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-gray-900 border-gray-800 pl-10 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-gray-900 border-gray-800 pl-10 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white group"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  
                  {role === "provider" && (
                    <div className="text-center mt-6">
                      <Button 
                        variant="ghost" 
                        type="button" 
                        onClick={() => navigate("/auth")}
                        className="text-sm text-gray-400 hover:text-white"
                      >
                        Switch to Customer Login
                      </Button>
                    </div>
                  )}
                  
                  {role === "customer" && (
                    <div className="text-center mt-6">
                      <Button 
                        variant="ghost" 
                        type="button" 
                        onClick={() => navigate("/provider/auth")}
                        className="text-sm text-gray-400 hover:text-white"
                      >
                        Service Provider Login
                      </Button>
                    </div>
                  )}
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="bg-gray-900 border-gray-800 pl-10 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailReg" className="text-gray-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                      <Input
                        id="emailReg"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-gray-900 border-gray-800 pl-10 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordReg" className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                      <Input
                        id="passwordReg"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-gray-900 border-gray-800 pl-10 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                  
                  {!location.pathname.includes('/provider') && (
                    <div className="space-y-2">
                      <Label className="text-gray-300">Account Type</Label>
                      <RadioGroup
                        value={role}
                        onValueChange={(value) => setRole(value as "customer" | "provider")}
                        className="grid grid-cols-2 gap-4 mt-2"
                      >
                        <div className="flex items-center space-x-2 bg-gray-900 rounded-md p-3 border border-gray-800 hover:border-orange-500/50 transition-colors">
                          <RadioGroupItem value="customer" id="customer" className="border-gray-600 text-orange-500" />
                          <Label htmlFor="customer" className="cursor-pointer w-full">Customer</Label>
                        </div>
                        <div className="flex items-center space-x-2 bg-gray-900 rounded-md p-3 border border-gray-800 hover:border-orange-500/50 transition-colors">
                          <RadioGroupItem value="provider" id="provider" className="border-gray-600 text-orange-500" />
                          <Label htmlFor="provider" className="cursor-pointer w-full">Provider</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                  
                  {location.pathname.includes('/provider') && (
                    <div className="p-3 bg-blue-900/20 border border-blue-800/30 rounded-md text-sm text-blue-300 mb-2 flex items-center">
                      <UserPlus className="w-4 h-4 mr-2" />
                      You are registering as a Service Provider
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white group"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  
                  {role === "provider" && location.pathname.includes('/provider') && (
                    <div className="text-center mt-6">
                      <Button 
                        variant="ghost" 
                        type="button" 
                        onClick={() => navigate("/auth")}
                        className="text-sm text-gray-400 hover:text-white"
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
    </div>
  );
};

export default Auth;
