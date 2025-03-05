import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Car, Upload, Pencil, ImagePlus, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const ProviderDashboard = () => {
  const { toast } = useToast();
  const [cars, setCars] = useState<any[]>([]);
  const [editingCar, setEditingCar] = useState<any>(null);
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
    fetchCars();
  }, []);

  const fetchCars = async () => {
    const { data: cars, error } = await supabase
      .from("cars")
      .select(`
        *,
        car_availability (
          start_date,
          end_date,
          is_available
        ),
        bookings (
          id,
          start_date,
          end_date,
          status,
          total_amount,
          customer_id,
          profiles (
            full_name
          )
        )
      `);

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

  const handleAddCar = async () => {
    const { data: carData, error: carError } = await supabase
      .from("cars")
      .insert({
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
      await fetchCars();
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

  const handleUpdateCar = async () => {
    if (!editingCar) return;

    const { error } = await supabase
      .from("cars")
      .update({
        model: editingCar.model,
        year: parseInt(editingCar.year),
        license_plate: editingCar.license_plate,
        seats: parseInt(editingCar.seats),
        rate_per_day: parseFloat(editingCar.rate_per_day),
        description: editingCar.description
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
      // First, delete all existing unavailability records for this car
      const { error: deleteError } = await supabase
        .from("car_availability")
        .delete()
        .eq("car_id", selectedCarId)
        .eq("is_available", false);

      if (deleteError) throw deleteError;

      // Then, insert the new unavailability record
      const { error: insertError } = await supabase
        .from("car_availability")
        .insert({
          car_id: selectedCarId,
          start_date: selectedDates.from.toISOString(),
          end_date: selectedDates.to.toISOString(),
          is_available: false
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Unavailability dates updated successfully",
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
          <CardHeader>
            <CardTitle>{editingCar ? 'Edit Car' : 'Add New Car'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Model</Label>
              <Input
                value={editingCar ? editingCar.model : newCar.model}
                onChange={(e) => editingCar 
                  ? setEditingCar({...editingCar, model: e.target.value})
                  : setNewCar({...newCar, model: e.target.value})}
                placeholder="e.g. Toyota Camry"
              />
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Input
                type="number"
                value={editingCar ? editingCar.year : newCar.year}
                onChange={(e) => editingCar
                  ? setEditingCar({...editingCar, year: e.target.value})
                  : setNewCar({...newCar, year: e.target.value})}
                placeholder="e.g. 2020"
              />
            </div>
            <div className="space-y-2">
              <Label>License Plate</Label>
              <Input
                value={editingCar ? editingCar.license_plate : newCar.license_plate}
                onChange={(e) => editingCar
                  ? setEditingCar({...editingCar, license_plate: e.target.value})
                  : setNewCar({...newCar, license_plate: e.target.value})}
                placeholder="e.g. ABC123"
              />
            </div>
            <div className="space-y-2">
              <Label>Number of Seats</Label>
              <Input
                type="number"
                value={editingCar ? editingCar.seats : newCar.seats}
                onChange={(e) => editingCar
                  ? setEditingCar({...editingCar, seats: e.target.value})
                  : setNewCar({...newCar, seats: e.target.value})}
                placeholder="e.g. 5"
              />
            </div>
            <div className="space-y-2">
              <Label>Rate per Day ($)</Label>
              <Input
                type="number"
                value={editingCar ? editingCar.rate_per_day : newCar.rate_per_day}
                onChange={(e) => editingCar
                  ? setEditingCar({...editingCar, rate_per_day: e.target.value})
                  : setNewCar({...newCar, rate_per_day: e.target.value})}
                placeholder="e.g. 50"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={editingCar ? editingCar.description : newCar.description}
                onChange={(e) => editingCar
                  ? setEditingCar({...editingCar, description: e.target.value})
                  : setNewCar({...newCar, description: e.target.value})}
                placeholder="Brief description of the car"
              />
            </div>
            {editingCar ? (
              <div className="flex gap-2">
                <Button 
                  onClick={handleUpdateCar}
                  className="flex-1"
                  disabled={!editingCar.model || !editingCar.year || !editingCar.license_plate || !editingCar.seats || !editingCar.rate_per_day}
                >
                  Update Car
                </Button>
                <Button 
                  onClick={() => setEditingCar(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleAddCar}
                className="w-full"
                disabled={!newCar.model || !newCar.year || !newCar.license_plate || !newCar.seats || !newCar.rate_per_day}
              >
                Add Car
              </Button>
            )}
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
                <div className="relative aspect-video mb-4 bg-gray-100 rounded-lg overflow-hidden group">
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
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Label htmlFor={`image-${car.id}`} className="cursor-pointer">
                      <div className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors">
                        <ImagePlus className="w-6 h-6" />
                        <span>Upload Image</span>
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setEditingCar(car)}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
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

                  {car.bookings && car.bookings.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        Bookings:
                      </h4>
                      <ul className="text-sm space-y-2">
                        {car.bookings.map((booking: any, index: number) => (
                          <li key={index} className="p-2 bg-blue-50 rounded-md">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">
                                  {format(new Date(booking.start_date), "MMM d, yyyy")} - {format(new Date(booking.end_date), "MMM d, yyyy")}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  Customer: {booking.profiles?.full_name || "Unknown"}
                                </p>
                              </div>
                              <Badge className={
                                booking.status === 'confirmed' ? 'bg-green-500' :
                                booking.status === 'pending' ? 'bg-yellow-500' :
                                booking.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
                              }>
                                {booking.status}
                              </Badge>
                            </div>
                            <p className="text-xs mt-1">
                              <span className="font-medium">Amount:</span> ${booking.total_amount}
                            </p>
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
