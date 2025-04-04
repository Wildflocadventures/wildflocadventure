
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar } from "lucide-react";
import { DateTimeRangePicker } from "@/components/DateTimeRangePicker";
import { Card } from "@/components/ui/card";

interface SearchFormProps {
  location: string;
  setLocation: (location: string) => void;
  selectedDates: {
    from: Date | undefined;
    to: Date | undefined;
  };
  setSelectedDates: (dates: { from: Date | undefined; to: Date | undefined }) => void;
}

export const SearchForm = ({ location, setLocation, selectedDates, setSelectedDates }: SearchFormProps) => {
  return (
    <Card className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm shadow-xl p-6 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            Where
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="City, airport, address or hotel"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            When
          </label>
          <DateTimeRangePicker
            dateRange={selectedDates}
            onDateRangeChange={setSelectedDates}
          />
        </div>
      </div>
    </Card>
  );
};
