import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ProviderAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const handleProviderSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) {
      toast({
        title: "Error",
        description: authError.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Update the profile to be a provider
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        role: 'provider',
        phone: phone 
      })
      .eq('id', authData.user?.id);

    if (profileError) {
      toast({
        title: "Error",
        description: profileError.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Please check your email to confirm your account",
      });
      navigate("/provider/dashboard");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Service Provider Registration</CardTitle>
          <CardDescription className="text-center">
            Register as a car service provider
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProviderSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Business/Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Your business name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
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
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Register as Provider"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderAuth;