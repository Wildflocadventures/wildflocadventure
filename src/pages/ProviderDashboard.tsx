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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cars, setCars] = useState<any[]>([]);
  const [selectedCar, setSelectedCar] = useState<string | null>(null);
  const [availabilityDates, setAvailabilityDates] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [newCar, setNewCar] = useState({
    model: "",
    year: "",
    license_plate: "",
    seats: "",
    rate_per_day: "",
    description: ""
  });

  useEffect(() => {
    const fetchCars = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/provider/auth");
        return;
      }

      const { data: cars, error } = await supabase
        .from("cars")
        .select(`
          *,
          car_availability (
            start_date,
            end_date,
            is_available
          )
        `)
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

    const { data: carData, error: carError } = await supabase
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

    if (carError) {
      toast({
        title: "Error",
        description: carError.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Car added successfully. Please set its availability.",
      });
      setCars([...cars, carData]);
      setSelectedCar(carData.id);
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

  const handleSetAvailability = async () => {
    if (!selectedCar || !availabilityDates.from || !availabilityDates.to) {
      toast({
        title: "Error",
        description: "Please select a car and availability dates",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("car_availability")
      .insert({
        car_id: selectedCar,
        start_date: availabilityDates.from.toISOString(),
        end_date: availabilityDates.to.toISOString(),
        is_available: true
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
        description: "Car availability set successfully",
      });
      // Refresh cars list
      const { data: { user } } = await supabase.auth.getUser();
      const { data: updatedCars } = await supabase
        .from("cars")
        .select(`
          *,
          car_availability (
            start_date,
            end_date,
            is_available
          )
        `)
        .eq("provider_id", user?.id);
      
      if (updatedCars) {
        setCars(updatedCars);
      }
      setSelectedCar(null);
      setAvailabilityDates({ from: undefined, to: undefined });
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
            <CardTitle>Set Car Availability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Car</Label>
              <select
                className="w-full p-2 border rounded"
                value={selectedCar || ""}
                onChange={(e) => setSelectedCar(e.target.value)}
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
              <Label>Select Availability Dates</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    {availabilityDates.from ? (
                      availabilityDates.to ? (
                        <>
                          {format(availabilityDates.from, "LLL dd, y")} -{" "}
                          {format(availabilityDates.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(availabilityDates.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick dates</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={availabilityDates.from}
                    selected={{
                      from: availabilityDates.from,
                      to: availabilityDates.to,
                    }}
                    onSelect={(range) => {
                      setAvailabilityDates({
                        from: range?.from,
                        to: range?.to,
                      });
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <Button 
              onClick={handleSetAvailability}
              className="w-full"
              disabled={!selectedCar || !availabilityDates.from || !availabilityDates.to}
            >
              Set Availability
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
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
                  <div className="mt-2">
                    <h4 className="font-medium text-sm">Availability Periods:</h4>
                    {car.car_availability && car.car_availability.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {car.car_availability.map((availability: any, index: number) => (
                          <li key={index} className="text-sm text-gray-600">
                            {format(new Date(availability.start_date), "LLL dd, y")} - {format(new Date(availability.end_date), "LLL dd, y")}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-red-500">No availability set</p>
                    )}
                  </div>
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