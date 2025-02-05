import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, Pencil, Trash2, ImagePlus } from "lucide-react";
import { format } from "date-fns";

interface CarListProps {
  cars: any[];
  onEdit: (car: any) => void;
  onDelete: (carId: string) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, carId: string) => void;
}

export const CarList = ({ cars, onEdit, onDelete, onImageUpload }: CarListProps) => {
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
                  onChange={(e) => onImageUpload(e, car.id)}
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
                  className="flex-1"
                  onClick={() => onEdit(car)}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => onDelete(car.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
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