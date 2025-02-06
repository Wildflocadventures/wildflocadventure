
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CarForm } from "@/components/provider/CarForm";
import { CarList } from "@/components/provider/CarList";

const ProviderDashboard = () => {
  const { toast } = useToast();
  const [cars, setCars] = useState<any[]>([]);
  const [editingCar, setEditingCar] = useState<any>(null);
  const [selectedDates, setSelectedDates] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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
      .eq('provider_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch cars",
        variant: "destructive",
      });
    } else {
      setCars(cars || []);
    }
  };

  const handleAddCar = async (carData: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Parse numeric values before sending to Supabase
    const parsedCarData = {
      model: carData.model,
      year: parseInt(carData.year),
      license_plate: carData.license_plate,
      seats: parseInt(carData.seats),
      rate_per_day: parseFloat(carData.rate_per_day),
      description: carData.description,
      provider_id: user.id
    };

    const { error } = await supabase
      .from("cars")
      .insert(parsedCarData);

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
      await fetchCars();
    }
  };

  const handleUpdateCar = async (carData: any) => {
    const { error } = await supabase
      .from("cars")
      .update({
        model: carData.model,
        year: parseInt(carData.year),
        license_plate: carData.license_plate,
        seats: parseInt(carData.seats),
        rate_per_day: parseFloat(carData.rate_per_day),
        description: carData.description
      })
      .eq("id", editingCar.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update car",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Car updated successfully",
      });
      await fetchCars();
      setEditingCar(null);
    }
  };

  const handleDeleteCar = async (carId: string) => {
    try {
      // First, delete related car_availability records
      const { error: availabilityError } = await supabase
        .from("car_availability")
        .delete()
        .eq("car_id", carId);

      if (availabilityError) throw availabilityError;

      // Then, delete bookings related to the car
      const { error: bookingsError } = await supabase
        .from("bookings")
        .delete()
        .eq("car_id", carId);

      if (bookingsError) throw bookingsError;

      // Finally, delete the car
      const { error: carError } = await supabase
        .from("cars")
        .delete()
        .eq("id", carId);

      if (carError) throw carError;

      toast({
        title: "Success",
        description: "Car deleted successfully",
      });
      
      setCars(cars.filter(car => car.id !== carId));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete car",
        variant: "destructive",
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

      await fetchCars();

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

      await fetchCars();
      
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
          <CarForm
            editingCar={editingCar}
            onSubmit={editingCar ? handleUpdateCar : handleAddCar}
            onCancel={() => setEditingCar(null)}
          />
        </Card>

        <Card>
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-bold">Set Car Unavailability</h2>
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
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Cars</h2>
        <CarList
          cars={cars}
          onEdit={setEditingCar}
          onDelete={handleDeleteCar}
          onImageUpload={handleImageUpload}
        />
      </div>
    </div>
  );
};

export default ProviderDashboard;
