import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Car, Upload } from "lucide-react";
import { format } from "date-fns";

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
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);

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
        description: "Car added successfully",
      });
      setCars([...cars, carData]);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, carId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${carId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('car_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('car_images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('cars')
        .update({ image_url: publicUrl })
        .eq('id', carId);

      if (updateError) throw updateError;

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

      toast({
        title: "Success",
        description: "Car image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSetUnavailability = async () => {
    if (!selectedCarId || !selectedDates.from || !selectedDates.to) {
      toast({
        title: "Error",
        description: "Please select a car and date range",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("car_availability")
        .insert({
          car_id: selectedCarId,
          start_date: selectedDates.from.toISOString(),
          end_date: selectedDates.to.toISOString(),
          is_available: false
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Unavailability dates set successfully",
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

      setSelectedCarId(null);
      setSelectedDates({ from: undefined, to: undefined });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Provider Dashboard</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Add New Car</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Model</Label>
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
            <CardTitle>Set Car Unavailability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Car</Label>
              <select
                className="w-full p-2 border rounded"
                value={selectedCarId || ""}
                onChange={(e) => setSelectedCarId(e.target.value)}
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
              <Label>Select Unavailable Dates</Label>
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
              onClick={handleSetUnavailability}
              className="w-full"
              disabled={!selectedCarId || !selectedDates.from || !selectedDates.to}
            >
              Set Unavailability
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Cars</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <Card key={car.id}>
              <CardContent className="p-6">
                <div className="aspect-video mb-4 bg-gray-100 rounded-lg overflow-hidden">
                  {car.image_url ? (
                    <img
                      src={car.image_url}
                      alt={car.model}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">{car.model}</h3>
                    <p className="text-sm text-gray-500">
                      {car.year} • {car.license_plate}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Rate:</span> ${car.rate_per_day}/day
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Seats:</span> {car.seats}
                    </p>
                    {car.description && (
                      <p className="text-sm text-gray-600">{car.description}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor={`image-${car.id}`} className="cursor-pointer">
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Upload className="w-4 h-4" />
                        Upload Image
                      </div>
                    </Label>
                    <Input
                      id={`image-${car.id}`}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, car.id)}
                    />
                  </div>
                  {car.car_availability && car.car_availability.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Unavailable Dates:</h4>
                      <ul className="text-sm text-red-600 space-y-1">
                        {car.car_availability
                          .filter((availability: any) => !availability.is_available)
                          .map((availability: any, index: number) => (
                          <li key={index}>
                            {format(new Date(availability.start_date), "MMM d, yyyy")} - {format(new Date(availability.end_date), "MMM d, yyyy")}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;