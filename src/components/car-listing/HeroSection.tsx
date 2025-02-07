
import { SearchForm } from "@/components/car-listing/SearchForm";

interface HeroSectionProps {
  location: string;
  setLocation: (location: string) => void;
  selectedDates: {
    from: Date | undefined;
    to: Date | undefined;
  };
  setSelectedDates: (dates: { from: Date | undefined; to: Date | undefined }) => void;
}

export const HeroSection = ({
  location,
  setLocation,
  selectedDates,
  setSelectedDates,
}: HeroSectionProps) => {
  return (
    <div className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      <div className="relative max-w-7xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 text-center">
          Wildfloc Adventures
        </h1>
        
        <SearchForm
          location={location}
          setLocation={setLocation}
          selectedDates={selectedDates}
          setSelectedDates={setSelectedDates}
        />
      </div>
    </div>
  );
};
