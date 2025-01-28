import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Car, Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const Cars = () => {
  const { toast } = useToast();
  const [selectedDates, setSelectedDates] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const { data: cars, isLoading } = useQuery({
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

  const handleBooking = async (carId: string, ratePerDay: number) => {
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

      const days = differenceInDays(selectedDates.to, selectedDates.from) + 1;
      const totalAmount = days * ratePerDay;

      const { data, error } = await supabase
        .from("bookings")
        .insert({
          car_id: carId,
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

      toast({
        title: "Success",
        description: "Car booked successfully!",
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
    if (!selectedDates.from || !selectedDates.to) return true;
    
    return car.car_availability?.some((availability: any) => {
      const availStart = new Date(availability.start_date);
      const availEnd = new Date(availability.end_date);
      return (
        availability.is_available &&
        availStart <= selectedDates.from! &&
        availEnd >= selectedDates.to!
      );
    });
  };

  if (isLoading) {
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

  // Filter out cars with no availability set
  const availableCars = cars?.filter(car => car.car_availability && car.car_availability.length > 0) || [];

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Available Cars</h1>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDates.from ? (
                selectedDates.to ? (
                  <>
                    {format(selectedDates.from, "LLL dd, y")} -{" "}
                    {format(selectedDates.to, "LLL dd, y")}
                  </>
                ) : (
                  format(selectedDates.from, "LLL dd, y")
                )
              ) : (
                <span>Pick dates</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={selectedDates.from}
              selected={{
                from: selectedDates.from,
                to: selectedDates.to,
              }}
              onSelect={(range) => {
                setSelectedDates({
                  from: range?.from,
                  to: range?.to,
                });
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {availableCars.map((car) => {
          const available = isCarAvailable(car);
          return (
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
                  <p className={available ? "text-green-600" : "text-red-600"}>
                    {available ? "Available" : "Not available"} for selected dates
                  </p>
                </div>
                <Button 
                  className="w-full mt-4"
                  onClick={() => handleBooking(car.id, car.rate_per_day)}
                  disabled={!available}
                >
                  {available ? "Book Now" : "Not Available"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Cars;