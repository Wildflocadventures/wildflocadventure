
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, Mail, MapPin, Building2, Home, Heart, UserRound, Check, ArrowRight } from "lucide-react";

interface LocationState {
  bookingId: string;
}

const CustomerDetailsForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const { bookingId } = location.state as LocationState;
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    address: "",
    state: "",
    current_stay: "",
    emergency_contact: "",
    emergency_relation: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to continue",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      // First save customer details
      const { error: detailsError } = await supabase
        .from("customer_details")
        .insert({
          booking_id: bookingId,
          customer_id: user.id,
          ...formData,
        });

      if (detailsError) throw detailsError;

      // Mark payment as confirmed but don't update booking status yet
      setPaymentConfirmed(true);
      
      toast({
        title: "Payment Confirmed!",
        description: "Payment processed successfully. Please click 'Book Now' to complete your booking.",
      });
    } catch (error: any) {
      console.error("Error in customer details submission:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const finalizeBooking = async () => {
    try {
      // Update booking status to confirmed
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({ status: 'confirmed' })
        .eq('id', bookingId);

      if (bookingError) throw bookingError;

      toast({
        title: "Booking Confirmed!",
        description: "Your booking has been finalized and confirmed.",
      });

      navigate("/customer/bookings");
    } catch (error: any) {
      console.error("Error finalizing booking:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (paymentConfirmed) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <Card className="backdrop-blur-sm bg-white/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Payment Confirmed</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="bg-green-100 rounded-full p-4 mb-6">
              <Check className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Your payment has been processed successfully</h3>
            <p className="text-gray-600 mb-8 text-center">
              To finalize your booking, please click the "Book Now" button below. 
              Once confirmed, your booking will be visible to the service provider.
            </p>
            <Button 
              onClick={finalizeBooking}
              className="w-2/3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              size="lg"
            >
              Book Now <ArrowRight className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <Card className="backdrop-blur-sm bg-white/50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Customer Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 XXXXX XXXXX"
                  required
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  required
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main St"
                  required
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  State
                </Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="Your State"
                  required
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="current_stay" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Present Stay in Kashmir
                </Label>
                <Input
                  id="current_stay"
                  name="current_stay"
                  value={formData.current_stay}
                  onChange={handleInputChange}
                  placeholder="Current Location in Kashmir"
                  required
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact" className="flex items-center gap-2">
                  <UserRound className="h-4 w-4" />
                  Emergency Contact Number
                </Label>
                <Input
                  id="emergency_contact"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleInputChange}
                  placeholder="+91 XXXXX XXXXX"
                  required
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_relation" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Relation with Emergency Contact
                </Label>
                <Input
                  id="emergency_relation"
                  name="emergency_relation"
                  value={formData.emergency_relation}
                  onChange={handleInputChange}
                  placeholder="Parent/Sibling/Friend"
                  required
                  className="bg-white"
                />
              </div>
            </div>

            <Button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              Confirm Payment
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDetailsForm;
