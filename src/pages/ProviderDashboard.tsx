
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CarForm } from "@/components/provider/CarForm";
import { CarAvailability } from "@/components/provider/CarAvailability";
import { CarList } from "@/components/provider/CarList";

const ProviderDashboard = () => {
  const { toast } = useToast();
  const [cars, setCars] = useState<any[]>([]);
  const [editingCar, setEditingCar] = useState<any>(null);

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

  const handleDeleteCar = async (carId: string) => {
    try {
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

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Provider Dashboard</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <CarForm 
          onSuccess={fetchCars}
          editingCar={editingCar}
          onCancelEdit={() => setEditingCar(null)}
        />
        <CarAvailability cars={cars} onSuccess={fetchCars} />
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
