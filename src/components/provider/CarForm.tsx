
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CarFormProps {
  onSuccess: () => void;
  editingCar?: any;
  onCancelEdit?: () => void;
}

export const CarForm = ({ onSuccess, editingCar, onCancelEdit }: CarFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState(
    editingCar || {
      model: "",
      year: "",
      license_plate: "",
      seats: "",
      rate_per_day: "",
      description: ""
    }
  );

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const carData = {
        model: formData.model,
        year: parseInt(formData.year),
        license_plate: formData.license_plate,
        seats: parseInt(formData.seats),
        rate_per_day: parseFloat(formData.rate_per_day),
        description: formData.description,
        provider_id: user.id
      };

      if (editingCar) {
        const { error } = await supabase
          .from("cars")
          .update(carData)
          .eq("id", editingCar.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Car updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("cars")
          .insert(carData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Car added successfully",
        });

        setFormData({
          model: "",
          year: "",
          license_plate: "",
          seats: "",
          rate_per_day: "",
          description: ""
        });
      }

      onSuccess();
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
        <CardTitle>{editingCar ? 'Edit Car' : 'Add New Car'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Model</Label>
          <Input
            value={formData.model}
            onChange={(e) => setFormData({...formData, model: e.target.value})}
            placeholder="e.g. Toyota Camry"
          />
        </div>
        <div className="space-y-2">
          <Label>Year</Label>
          <Input
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({...formData, year: e.target.value})}
            placeholder="e.g. 2020"
          />
        </div>
        <div className="space-y-2">
          <Label>License Plate</Label>
          <Input
            value={formData.license_plate}
            onChange={(e) => setFormData({...formData, license_plate: e.target.value})}
            placeholder="e.g. ABC123"
          />
        </div>
        <div className="space-y-2">
          <Label>Number of Seats</Label>
          <Input
            type="number"
            value={formData.seats}
            onChange={(e) => setFormData({...formData, seats: e.target.value})}
            placeholder="e.g. 5"
          />
        </div>
        <div className="space-y-2">
          <Label>Rate per Day ($)</Label>
          <Input
            type="number"
            value={formData.rate_per_day}
            onChange={(e) => setFormData({...formData, rate_per_day: e.target.value})}
            placeholder="e.g. 50"
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Input
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Brief description of the car"
          />
        </div>
        {editingCar ? (
          <div className="flex gap-2">
            <Button 
              onClick={handleSubmit}
              className="flex-1"
              disabled={!formData.model || !formData.year || !formData.license_plate || !formData.seats || !formData.rate_per_day}
            >
              Update Car
            </Button>
            <Button 
              onClick={onCancelEdit}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button 
            onClick={handleSubmit}
            className="w-full"
            disabled={!formData.model || !formData.year || !formData.license_plate || !formData.seats || !formData.rate_per_day}
          >
            Add Car
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
