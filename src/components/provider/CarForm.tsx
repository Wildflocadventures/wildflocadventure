
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Car } from "@/hooks/useAuthProfile";

interface CarFormProps {
  userProfileId: string;
  editingCar: Car | null;
  setEditingCar: (car: Car | null) => void;
  refreshProviderData: () => void;
}

export const CarForm = ({ userProfileId, editingCar, setEditingCar, refreshProviderData }: CarFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCar, setNewCar] = useState({
    model: "",
    year: "",
    license_plate: "",
    seats: "",
    rate_per_day: "",
    description: ""
  });

  const handleAddCar = async () => {
    setIsSubmitting(true);
    try {
      const { data: carData, error: carError } = await supabase
        .from("cars")
        .insert({
          model: newCar.model,
          year: parseInt(newCar.year),
          license_plate: newCar.license_plate,
          seats: parseInt(newCar.seats),
          rate_per_day: parseFloat(newCar.rate_per_day),
          description: newCar.description,
          provider_id: userProfileId
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
        refreshProviderData();
        setNewCar({
          model: "",
          year: "",
          license_plate: "",
          seats: "",
          rate_per_day: "",
          description: ""
        });
      }
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

  const handleUpdateCar = async () => {
    if (!editingCar) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("cars")
        .update({
          model: editingCar.model,
          year: parseInt(editingCar.year.toString()),
          license_plate: editingCar.license_plate,
          seats: parseInt(editingCar.seats.toString()),
          rate_per_day: parseFloat(editingCar.rate_per_day.toString()),
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
        refreshProviderData();
        setEditingCar(null);
      }
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
              disabled={isSubmitting || !editingCar.model || !editingCar.year || !editingCar.license_plate || !editingCar.seats || !editingCar.rate_per_day}
            >
              {isSubmitting ? "Updating..." : "Update Car"}
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
            disabled={isSubmitting || !newCar.model || !newCar.year || !newCar.license_plate || !newCar.seats || !newCar.rate_per_day}
          >
            {isSubmitting ? "Adding..." : "Add Car"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
