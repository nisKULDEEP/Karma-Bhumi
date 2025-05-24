import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  value: {
    startDate: Date;
    endDate: Date;
  };
  onChange: (value: { startDate: Date; endDate: Date }) => void;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<"start" | "end">("start");

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;

    const newRange = { ...value };

    if (selectedRange === "start") {
      newRange.startDate = date;
      // If start date is after end date, reset end date
      if (date > value.endDate) {
        newRange.endDate = date;
      }
      setSelectedRange("end");
    } else {
      newRange.endDate = date;
      // If end date is before start date, reset start date
      if (date < value.startDate) {
        newRange.startDate = date;
      }
      setSelectedRange("start");
      setIsOpen(false);
    }

    onChange(newRange);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal w-full sm:w-auto",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>
            {format(value.startDate, "MMM d, yyyy")} - {format(value.endDate, "MMM d, yyyy")}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedRange === "start" ? value.startDate : value.endDate}
          onSelect={handleSelect}
          initialFocus
        />
        <div className="flex items-center justify-between p-3 border-t border-border">
          <div className="text-sm">
            <span className="font-medium">
              {selectedRange === "start" ? "Select start date" : "Select end date"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedRange(selectedRange === "start" ? "end" : "start");
            }}
          >
            {selectedRange === "start" ? "Pick end date" : "Pick start date"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};