
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Car } from "@/hooks/useAuthProfile";

interface UnavailabilityFormProps {
  providerCars: Car[];
  refreshProviderData: () => void;
}

export const UnavailabilityForm = ({ providerCars, refreshProviderData }: UnavailabilityFormProps) => {
  const { toast } = useToast();
  const [selectedDates, setSelectedDates] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSetUnavailability = async () => {
    if (!selectedCarId || !selectedDates.from || !selectedDates.to) {
      toast({
        title: "Error",
        description: "Please select a car and date range",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // First clear any existing unavailability records
      const { error: deleteError } = await supabase
        .from("car_availability")
        .delete()
        .eq("car_id", selectedCarId)
        .eq("is_available", false);

      if (deleteError) throw deleteError;

      // Now insert the new unavailability record
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

      refreshProviderData();
      
      setSelectedCarId(null);
      setSelectedDates({ from: undefined, to: undefined });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
            {providerCars && providerCars.length > 0 ? (
              providerCars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.model} ({car.license_plate})
                </option>
              ))
            ) : (
              <option disabled>No cars available</option>
            )}
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
          disabled={isSubmitting || !selectedCarId || !selectedDates.from || !selectedDates.to}
        >
          {isSubmitting ? "Setting..." : "Set Unavailability"}
        </Button>
      </CardContent>
    </Card>
  );
};
