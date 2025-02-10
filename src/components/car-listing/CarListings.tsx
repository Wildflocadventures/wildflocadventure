
import { format } from "date-fns";
import { CarCard } from "@/components/car-listing/CarCard";

interface CarListingsProps {
  cars: any[];
  carsLoading: boolean;
  selectedDates: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

export const CarListings = ({ cars, carsLoading, selectedDates }: CarListingsProps) => {
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

  const formatDateRange = () => {
    if (selectedDates.from && selectedDates.to) {
      return `${format(selectedDates.from, 'MMM d')} - ${format(selectedDates.to, 'MMM d')}`;
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Available Services</h2>
        {formatDateRange() && (
          <span className="text-gray-600">{formatDateRange()}</span>
        )}
      </div>
      
      {carsLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars?.filter(isCarAvailable).map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
};
