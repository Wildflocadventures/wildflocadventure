
import React from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Car, Pencil, ImagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Car as CarType, Booking } from "@/hooks/useAuthProfile";

interface CarsListProps {
  cars: CarType[];
  setEditingCar: (car: CarType) => void;
  refreshProviderData: () => void;
  isLoading: boolean;
}

export const CarsList = ({ cars, setEditingCar, refreshProviderData, isLoading }: CarsListProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

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

      refreshProviderData();

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

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <p>Loading your cars...</p>
      </div>
    );
  }

  if (!cars || cars.length === 0) {
    return (
      <Card className="col-span-full">
        <CardContent className="p-6 text-center">
          <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Cars Added Yet</h3>
          <p className="text-gray-500 mb-4">Start by adding your first car using the form above.</p>
        </CardContent>
      </Card>
    );
  }

  return (
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

              {/* Display bookings for this car */}
              {car.bookings && car.bookings.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-medium text-sm mb-2">Bookings:</h4>
                  <div className="space-y-3">
                    {car.bookings.slice(0, 3).map((booking: Booking) => (
                      <div key={booking.id} className="bg-gray-50 p-2 rounded text-xs">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{booking.customer_name}</span>
                          {getStatusBadge(booking.status)}
                        </div>
                        <div className="flex justify-between items-center">
                          <span>
                            {format(new Date(booking.start_date), "MMM d")} - {format(new Date(booking.end_date), "MMM d, yyyy")}
                          </span>
                          <span className="font-medium">${booking.total_amount}</span>
                        </div>
                      </div>
                    ))}
                    {car.bookings.length > 3 && (
                      <Button 
                        variant="link" 
                        className="text-xs w-full" 
                        onClick={() => navigate('/provider/bookings')}
                      >
                        View all {car.bookings.length} bookings
                      </Button>
                    )}
                  </div>
                </div>
              )}

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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
