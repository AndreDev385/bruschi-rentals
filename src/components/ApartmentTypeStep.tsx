import { useState } from "react";
import { SelectButton } from "@/components/ui/select-button";
import type { FormData, Neighborhood } from "@/types";

interface ApartmentTypeStepProps {
  onComplete: (data: {
    apartmentType: "Studio" | "OneBed" | "TwoBeds" | "ThreeOrMoreBeds";
  }) => void;
  formData: FormData;
  neighborhoods?: Neighborhood[];
}

const apartmentTypes = [
  { value: "Studio" as const, label: "Studio" },
  { value: "OneBed" as const, label: "1 Bedroom" },
  { value: "TwoBeds" as const, label: "2 Bedrooms" },
  { value: "ThreeOrMoreBeds" as const, label: "3+ Bedrooms" },
];

const ApartmentTypeStep: React.FC<ApartmentTypeStepProps> = ({
  onComplete,
  formData,
}) => {
  const [selectedType, setSelectedType] = useState<string | null>(
    formData.apartmentType || null,
  );

  const handleTypeSelect = (
    type: "Studio" | "OneBed" | "TwoBeds" | "ThreeOrMoreBeds",
  ) => {
    setSelectedType(type);
    onComplete({ apartmentType: type });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-obsidian mb-2">
          What type of apartment are you looking for?
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
        {apartmentTypes.map((type) => (
          <SelectButton
            key={type.value}
            isSelected={selectedType === type.value}
            onClick={() => handleTypeSelect(type.value)}
            value={type.label}
          />
        ))}
      </div>
    </div>
  );
};

export default ApartmentTypeStep;
