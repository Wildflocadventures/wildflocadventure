import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CarFormProps {
  editingCar: any;
  onSubmit: (carData: any) => void;
  onCancel?: () => void;
}

export const CarForm = ({ editingCar, onSubmit, onCancel }: CarFormProps) => {
  const [carData, setCarData] = useState(
    editingCar || {
      model: "",
      year: "",
      license_plate: "",
      seats: "",
      rate_per_day: "",
      description: ""
    }
  );

  const handleSubmit = () => {
    onSubmit(carData);
  };

  return (
    <>
      <CardHeader>
        <CardTitle>{editingCar ? 'Edit Car' : 'Add New Car'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Model</Label>
          <Input
            value={carData.model}
            onChange={(e) => setCarData({...carData, model: e.target.value})}
            placeholder="e.g. Toyota Camry"
          />
        </div>
        <div className="space-y-2">
          <Label>Year</Label>
          <Input
            type="number"
            value={carData.year}
            onChange={(e) => setCarData({...carData, year: e.target.value})}
            placeholder="e.g. 2020"
          />
        </div>
        <div className="space-y-2">
          <Label>License Plate</Label>
          <Input
            value={carData.license_plate}
            onChange={(e) => setCarData({...carData, license_plate: e.target.value})}
            placeholder="e.g. ABC123"
          />
        </div>
        <div className="space-y-2">
          <Label>Number of Seats</Label>
          <Input
            type="number"
            value={carData.seats}
            onChange={(e) => setCarData({...carData, seats: e.target.value})}
            placeholder="e.g. 5"
          />
        </div>
        <div className="space-y-2">
          <Label>Rate per Day ($)</Label>
          <Input
            type="number"
            value={carData.rate_per_day}
            onChange={(e) => setCarData({...carData, rate_per_day: e.target.value})}
            placeholder="e.g. 50"
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Input
            value={carData.description}
            onChange={(e) => setCarData({...carData, description: e.target.value})}
            placeholder="Brief description of the car"
          />
        </div>
        {editingCar ? (
          <div className="flex gap-2">
            <Button 
              onClick={handleSubmit}
              className="flex-1"
              disabled={!carData.model || !carData.year || !carData.license_plate || !carData.seats || !carData.rate_per_day}
            >
              Update Car
            </Button>
            <Button 
              onClick={onCancel}
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
            disabled={!carData.model || !carData.year || !carData.license_plate || !carData.seats || !carData.rate_per_day}
          >
            Add Car
          </Button>
        )}
      </CardContent>
    </>
  );
};