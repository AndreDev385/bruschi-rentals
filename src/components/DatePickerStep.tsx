import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import type { FormData, Neighborhood } from "@/types";

interface DatePickerStepProps {
  onComplete: (data: { moveInDate: string }) => void;
  formData: FormData;
  neighborhoods?: Neighborhood[];
}

const DatePickerStep: React.FC<DatePickerStepProps> = ({
  onComplete,
  formData,
}) => {
  const initialDate = formData.moveInDate
    ? (() => {
        const [year, month, day] = formData.moveInDate.split("-").map(Number);
        return new Date(year, month - 1, day);
      })()
    : undefined;
  const [date, setDate] = useState<Date | undefined>(initialDate);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      onComplete({ moveInDate: selectedDate.toISOString().split("T")[0] });
    }
  };

  // Disable past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-obsidian mb-4">
          When are you move in?
        </h3>
      </div>

      <div className="max-w-md mx-auto flex flex-col items-center justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          disabled={(date) => date < today}
          className="rounded-md border shadow-m"
        />
      </div>
    </div>
  );
};

export default DatePickerStep;
