import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cars, setCars] = useState<any[]>([]);
  const [newCar, setNewCar] = useState({
    model: "",
    year: "",
    license_plate: "",
    seats: "",
    rate_per_day: "",
    description: ""
  });
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleAddCar = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("cars")
      .insert({
        provider_id: user.id,
        model: newCar.model,
        year: parseInt(newCar.year),
        license_plate: newCar.license_plate,
        seats: parseInt(newCar.seats),
        rate_per_day: parseFloat(newCar.rate_per_day),
        description: newCar.description
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Car added successfully",
      });
      setCars([...cars, data]);
      setNewCar({
        model: "",
        year: "",
        license_plate: "",
        seats: "",
        rate_per_day: "",
        description: ""
      });
    }
  };

  return (
    <div className="container py-8 relative">
      <Button 
        variant="outline" 
        className="absolute top-4 right-4"
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>

      <h1 className="text-3xl font-bold mb-8">Provider Dashboard</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Add New Car</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Car Model</Label>
              <Input
                value={newCar.model}
                onChange={(e) => setNewCar({...newCar, model: e.target.value})}
                placeholder="e.g. Toyota Camry"
              />
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Input
                type="number"
                value={newCar.year}
                onChange={(e) => setNewCar({...newCar, year: e.target.value})}
                placeholder="e.g. 2020"
              />
            </div>
            <div className="space-y-2">
              <Label>License Plate</Label>
              <Input
                value={newCar.license_plate}
                onChange={(e) => setNewCar({...newCar, license_plate: e.target.value})}
                placeholder="e.g. ABC123"
              />
            </div>
            <div className="space-y-2">
              <Label>Number of Seats</Label>
              <Input
                type="number"
                value={newCar.seats}
                onChange={(e) => setNewCar({...newCar, seats: e.target.value})}
                placeholder="e.g. 5"
              />
            </div>
            <div className="space-y-2">
              <Label>Rate per Day ($)</Label>
              <Input
                type="number"
                value={newCar.rate_per_day}
                onChange={(e) => setNewCar({...newCar, rate_per_day: e.target.value})}
                placeholder="e.g. 50"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={newCar.description}
                onChange={(e) => setNewCar({...newCar, description: e.target.value})}
                placeholder="Brief description of the car"
              />
            </div>
            <Button 
              onClick={handleAddCar}
              className="w-full"
              disabled={!newCar.model || !newCar.year || !newCar.license_plate || !newCar.seats || !newCar.rate_per_day}
            >
              Add Car
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
                  <h3 className="font-medium">{car.model} ({car.year})</h3>
                  <p className="text-sm text-gray-600">License: {car.license_plate}</p>
                  <p className="text-sm text-gray-600">Rate: ${car.rate_per_day}/day</p>
                  <p className="text-sm text-gray-600">Seats: {car.seats}</p>
                  {car.description && (
                    <p className="text-sm text-gray-600 mt-2">{car.description}</p>
                  )}
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