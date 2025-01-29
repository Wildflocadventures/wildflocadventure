import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Edit2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cars, setCars] = useState<any[]>([]);
  const [selectedCar, setSelectedCar] = useState<string | null>(null);
  const [editingCar, setEditingCar] = useState<any>(null);
  const [unavailabilityDates, setUnavailabilityDates] = useState<{
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
        description: "Car added successfully. Please set its unavailability dates.",
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
      .eq('id', editingCar.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update car details",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Car details updated successfully",
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
      setEditingCar(null);
    }
  };

  const handleSetUnavailability = async () => {
    if (!selectedCar || !unavailabilityDates.from || !unavailabilityDates.to) {
      toast({
        title: "Error",
        description: "Please select a car and unavailability dates",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("car_availability")
      .insert({
        car_id: selectedCar,
        start_date: unavailabilityDates.from.toISOString(),
        end_date: unavailabilityDates.to.toISOString(),
        is_available: false
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
        description: "Car unavailability dates set successfully",
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
      setUnavailabilityDates({ from: undefined, to: undefined });
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

      if (uploadError) {
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
        });
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('car_images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('cars')
        .update({ image_url: publicUrl })
        .eq('id', carId);

      if (updateError) {
        toast({
          title: "Error",
          description: "Failed to update car image",
          variant: "destructive",
        });
        return;
      }

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
            <CardTitle>Set Car Unavailability</CardTitle>
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
              <Label>Select Dates When Car is NOT Available</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    {unavailabilityDates.from ? (
                      unavailabilityDates.to ? (
                        <>
                          {format(unavailabilityDates.from, "LLL dd, y")} -{" "}
                          {format(unavailabilityDates.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(unavailabilityDates.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick unavailability dates</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={unavailabilityDates.from}
                    selected={{
                      from: unavailabilityDates.from,
                      to: unavailabilityDates.to,
                    }}
                    onSelect={(range) => {
                      setUnavailabilityDates({
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
              onClick={handleSetUnavailability}
              className="w-full"
              disabled={!selectedCar || !unavailabilityDates.from || !unavailabilityDates.to}
            >
              Set Unavailability
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
                <div key={car.id} className="p-4 border rounded relative">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => setEditingCar(car)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Car Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Car Model</Label>
                          <Input
                            value={editingCar?.model || ''}
                            onChange={(e) => setEditingCar({...editingCar, model: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Year</Label>
                          <Input
                            type="number"
                            value={editingCar?.year || ''}
                            onChange={(e) => setEditingCar({...editingCar, year: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>License Plate</Label>
                          <Input
                            value={editingCar?.license_plate || ''}
                            onChange={(e) => setEditingCar({...editingCar, license_plate: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Number of Seats</Label>
                          <Input
                            type="number"
                            value={editingCar?.seats || ''}
                            onChange={(e) => setEditingCar({...editingCar, seats: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Rate per Day ($)</Label>
                          <Input
                            type="number"
                            value={editingCar?.rate_per_day || ''}
                            onChange={(e) => setEditingCar({...editingCar, rate_per_day: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={editingCar?.description || ''}
                            onChange={(e) => setEditingCar({...editingCar, description: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Car Image</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, car.id)}
                          />
                        </div>
                        <Button 
                          onClick={handleUpdateCar}
                          className="w-full"
                        >
                          Update Car
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="flex gap-4">
                    {car.image_url ? (
                      <img 
                        src={car.image_url} 
                        alt={car.model}
                        className="w-32 h-32 object-cover rounded"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gray-100 flex items-center justify-center rounded">
                        <Car className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{car.model} ({car.year})</h3>
                      <p className="text-sm text-gray-600">License: {car.license_plate}</p>
                      <p className="text-sm text-gray-600">Rate: ${car.rate_per_day}/day</p>
                      <p className="text-sm text-gray-600">Seats: {car.seats}</p>
                      {car.description && (
                        <p className="text-sm text-gray-600 mt-2">{car.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-2">
                    <h4 className="font-medium text-sm">Unavailable Periods:</h4>
                    {car.car_availability && car.car_availability.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {car.car_availability
                          .filter((availability: any) => !availability.is_available)
                          .map((availability: any, index: number) => (
                          <li key={index} className="text-sm text-red-600">
                            {format(new Date(availability.start_date), "LLL dd, y")} - {format(new Date(availability.end_date), "LLL dd, y")}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-green-500">No unavailability periods set</p>
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
