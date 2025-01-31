import { Card } from "@/components/ui/card";
import { Car, Star, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CarCardProps {
  car: any;
}

export const CarCard = ({ car }: CarCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      key={car.id} 
      className="group cursor-pointer hover:shadow-xl transition-all duration-300"
      onClick={() => navigate(`/car/${car.id}`)}
    >
      <div className="relative">
        <div className="absolute top-4 right-4 z-10">
          <button className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors">
            <Heart className="h-5 w-5 text-gray-600 hover:text-red-500" />
          </button>
        </div>
        <div className="h-48 relative overflow-hidden rounded-t-lg">
          {car.image_url ? (
            <img
              src={car.image_url}
              alt={car.model}
              className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <Car className="h-24 w-24 text-gray-400" />
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold">{car.model} ({car.year})</h3>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium">5.0</span>
              <span className="text-sm text-gray-500">
                ({car.bookings?.length || 0} trips)
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-green-600">${car.rate_per_day}</span>
            <p className="text-sm text-gray-500">per day</p>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          <p className="flex items-center gap-2">
            Host: {car.profiles?.full_name}
          </p>
          <p className="flex items-center gap-2">
            Seats: {car.seats}
          </p>
        </div>
      </div>
    </Card>
  );
};