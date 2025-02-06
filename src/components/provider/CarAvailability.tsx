
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CarAvailabilityProps {
  cars: any[];
  onSuccess: () => void;
}

export const CarAvailability = ({ cars, onSuccess }: CarAvailabilityProps) => {
  const { toast } = useToast();
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

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

      onSuccess();
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
  );
};
