import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateTimeRangePickerProps {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

export function DateTimeRangePicker({
  dateRange,
  onDateRangeChange,
}: DateTimeRangePickerProps) {
  const [startTime, setStartTime] = React.useState("10:00");
  const [endTime, setEndTime] = React.useState("10:00");

  const timeOptions = Array.from({ length: 24 * 2 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });

  const formatDateTime = (date: Date | undefined, time: string) => {
    if (!date) return "";
    return `${format(date, "LLL dd, y")} ${time}`;
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !dateRange.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {formatDateTime(dateRange.from, startTime)} -{" "}
                  {formatDateTime(dateRange.to, endTime)}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick dates</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.from}
            selected={{
              from: dateRange.from,
              to: dateRange.to,
            }}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
          />
          <div className="border-t p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Start Time</span>
              </div>
              <Select
                value={startTime}
                onValueChange={setStartTime}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">End Time</span>
              </div>
              <Select
                value={endTime}
                onValueChange={setEndTime}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}