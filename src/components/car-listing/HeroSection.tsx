
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
    <div className="relative h-screen">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0" 
        style={{
          backgroundImage: "url('/lovable-uploads/f7c15857-c693-4797-a812-07e78f0f43ac.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.7)"
        }}
      />
      
      {/* Content Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6">
            Explore the World with Us
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
            Discover amazing destinations and create unforgettable memories with our 
            carefully crafted travel experiences.
          </p>
          
          <button
            onClick={() => {
              document.getElementById('search-form')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-md text-lg transition-colors mb-10"
          >
            Start Your Journey
          </button>
          
          <div id="search-form" className="mt-8">
            <SearchForm
              location={location}
              setLocation={setLocation}
              selectedDates={selectedDates}
              setSelectedDates={setSelectedDates}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
