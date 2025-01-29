import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";
import { useState } from "react";
import { format, isWithinInterval } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DateTimeRangePicker } from "@/components/DateTimeRangePicker";

const Cars = () => {
  const { toast } = useToast();
  const [selectedDates, setSelectedDates] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const [bookingDialog, setBookingDialog] = useState<{
    isOpen: boolean;
    carId: string;
    ratePerDay: number;
    model: string;
  }>({
    isOpen: false,
    carId: "",
    ratePerDay: 0,
    model: "",
  });

  const { data: cars, isLoading: carsLoading } = useQuery({
    queryKey: ["cars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select(`
          *,
          profiles (
            full_name
          ),
          car_availability (
            start_date,
            end_date,
            is_available
          )
        `);

      if (error) throw error;
      return data;
    },
  });

  // Query for user's bookings
  const { data: userBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          cars (
            model,
            license_plate,
            provider_id,
            profiles (
              full_name
            )
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleBookingDialog = (carId: string, ratePerDay: number, model: string) => {
    if (!selectedDates.from || !selectedDates.to) {
      toast({
        title: "Error",
        description: "Please select booking dates first",
        variant: "destructive",
      });
      return;
    }

    setBookingDialog({
      isOpen: true,
      carId,
      ratePerDay,
      model,
    });
  };

  const handleBooking = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "Please login to book a car",
          variant: "destructive",
        });
        return;
      }

      if (!selectedDates.from || !selectedDates.to) {
        toast({
          title: "Error",
          description: "Please select booking dates",
          variant: "destructive",
        });
        return;
      }

      const days = Math.ceil((selectedDates.to.getTime() - selectedDates.from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const totalAmount = days * bookingDialog.ratePerDay;

      const { data, error } = await supabase
        .from("bookings")
        .insert({
          car_id: bookingDialog.carId,
          customer_id: user.id,
          start_date: selectedDates.from.toISOString(),
          end_date: selectedDates.to.toISOString(),
          total_amount: totalAmount,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setBookingDialog(prev => ({ ...prev, isOpen: false }));
      toast({
        title: "Success",
        description: "Car booked successfully! Please proceed with the payment.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isCarAvailable = (car: any) => {
    if (!selectedDates.from || !selectedDates.to || !car?.car_availability) return true;
    
    const hasUnavailabilityConflict = car.car_availability.some((availability: any) => {
      if (availability.is_available) return false;
      
      const availStart = new Date(availability.start_date);
      const availEnd = new Date(availability.end_date);
      
      return (
        (selectedDates.from <= availEnd && selectedDates.to >= availStart) ||
        (selectedDates.from >= availStart && selectedDates.from <= availEnd) ||
        (selectedDates.to >= availStart && selectedDates.to <= availEnd)
      );
    });

    return !hasUnavailabilityConflict;
  };

  if (carsLoading) {
    return (
      <div className="container py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-48 bg-gray-200" />
              <CardContent className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const availableCars = cars?.filter(car => car.car_availability && isCarAvailable(car)) || [];

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Available Cars</h1>
        
        <DateTimeRangePicker
          dateRange={selectedDates}
          onDateRangeChange={setSelectedDates}
        />
      </div>

      {/* Available Cars Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
        {availableCars.map((car) => (
          <Card key={car.id} className="overflow-hidden">
            <CardHeader className="p-0">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <Car className="h-24 w-24 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <CardTitle className="flex justify-between items-start mb-2">
                <span>{car.model} ({car.year})</span>
                <span className="text-green-600">${car.rate_per_day}/day</span>
              </CardTitle>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Provider: {car.profiles.full_name}</p>
                <p>Seats: {car.seats}</p>
                <p>License: {car.license_plate}</p>
                {car.description && <p>{car.description}</p>}
                <p className="text-green-600">
                  Available for selected dates
                </p>
              </div>
              <Button 
                className="w-full mt-4"
                onClick={() => handleBookingDialog(car.id, car.rate_per_day, car.model)}
              >
                Book Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User's Bookings Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Your Bookings</h2>
        {bookingsLoading ? (
          <p>Loading your bookings...</p>
        ) : userBookings && userBookings.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userBookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{booking.cars.model}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Provider: {booking.cars.profiles.full_name}</p>
                    <p>Dates: {format(new Date(booking.start_date), "LLL dd, y")} - {format(new Date(booking.end_date), "LLL dd, y")}</p>
                    <p>Total Amount: ${booking.total_amount}</p>
                    <p>Status: <span className="capitalize">{booking.status}</span></p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No bookings found.</p>
        )}
      </div>

      {/* Booking Confirmation Dialog */}
      <Dialog open={bookingDialog.isOpen} onOpenChange={(open) => setBookingDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription>
              Please review your booking details below
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">{bookingDialog.model}</h4>
              <p className="text-sm text-muted-foreground">
                Dates: {selectedDates.from && selectedDates.to ? (
                  `${format(selectedDates.from, "LLL dd, y")} - ${format(selectedDates.to, "LLL dd, y")}`
                ) : "No dates selected"}
              </p>
              {selectedDates.from && selectedDates.to && (
                <p className="text-sm text-muted-foreground">
                  Duration: {differenceInDays(selectedDates.to, selectedDates.from) + 1} days
                </p>
              )}
              <p className="text-sm font-medium">
                Total Amount: ${selectedDates.from && selectedDates.to ? 
                  (differenceInDays(selectedDates.to, selectedDates.from) + 1) * bookingDialog.ratePerDay : 
                  0
                }
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingDialog(prev => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button onClick={handleBooking}>
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cars;
