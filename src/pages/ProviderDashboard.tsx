import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cars, setCars] = useState<any[]>([]);
  const [selectedDates, setSelectedDates] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [selectedCar, setSelectedCar] = useState<string | null>(null);

  useEffect(() => {
    const fetchCars = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/provider/auth");
        return;
      }

      const { data: cars, error } = await supabase
        .from("cars")
        .select("*")
        .eq("provider_id", user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch your cars",
          variant: "destructive",
        });
      } else {
        setCars(cars || []);
      }
    };

    fetchCars();
  }, []);

  const handleSetAvailability = async () => {
    if (!selectedCar || !selectedDates.from || !selectedDates.to) {
      toast({
        title: "Error",
        description: "Please select a car and date range",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("car_availability")
      .insert({
        car_id: selectedCar,
        start_date: selectedDates.from.toISOString(),
        end_date: selectedDates.to.toISOString(),
        is_available: true,
      });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Car availability has been set",
      });
      setSelectedDates({ from: undefined, to: undefined });
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Provider Dashboard</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Set Car Availability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Car</label>
              <select
                className="w-full p-2 border rounded"
                onChange={(e) => setSelectedCar(e.target.value)}
                value={selectedCar || ""}
              >
                <option value="">Select a car</option>
                {cars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.model} ({car.license_plate})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Available Dates</label>
              <Calendar
                mode="range"
                selected={{
                  from: selectedDates.from,
                  to: selectedDates.to,
                }}
                onSelect={(range: any) => setSelectedDates(range)}
                className="rounded-md border"
              />
            </div>

            <Button 
              onClick={handleSetAvailability}
              className="w-full"
              disabled={!selectedCar || !selectedDates.from || !selectedDates.to}
            >
              Set Availability
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Cars</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cars.map((car) => (
                <div key={car.id} className="p-4 border rounded">
                  <h3 className="font-medium">{car.model}</h3>
                  <p className="text-sm text-gray-600">License: {car.license_plate}</p>
                  <p className="text-sm text-gray-600">Rate: ${car.rate_per_day}/day</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProviderDashboard;