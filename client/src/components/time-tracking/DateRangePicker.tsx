import { addDays, format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  className?: string;
}

export function DateRangePicker({ 
  dateRange, 
  onDateRangeChange,
  className 
}: DateRangePickerProps) {
  const today = new Date();
  
  // Preset date ranges
  const presets = [
    { label: 'Today', dateRange: { from: today, to: today } },
    { label: 'Yesterday', dateRange: { from: addDays(today, -1), to: addDays(today, -1) } },
    { label: 'Last 7 days', dateRange: { from: addDays(today, -6), to: today } },
    { label: 'Last 30 days', dateRange: { from: addDays(today, -29), to: today } },
    { label: 'This month', dateRange: { 
      from: new Date(today.getFullYear(), today.getMonth(), 1), 
      to: new Date(today.getFullYear(), today.getMonth() + 1, 0) 
    }},
    { label: 'Last month', dateRange: { 
      from: new Date(today.getFullYear(), today.getMonth() - 1, 1), 
      to: new Date(today.getFullYear(), today.getMonth(), 0) 
    }},
  ];

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col sm:flex-row">
            <div className="border-b sm:border-r sm:border-b-0 p-2 space-y-2">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  className="justify-start w-full"
                  onClick={() => onDateRangeChange(preset.dateRange)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={onDateRangeChange}
              numberOfMonths={2}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}