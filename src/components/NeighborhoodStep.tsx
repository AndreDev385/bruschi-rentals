import { useState } from "react";
import { NeighborhoodGrid } from "@/components/ui/neighborhood-grid";
import type { Neighborhood, FormData } from "@/types";

interface NeighborhoodStepProps {
  onComplete: (data: {
    neighborhoodId: string;
    neighborhoodName: string;
  }) => void;
  formData: FormData;
  neighborhoods?: Neighborhood[];
}

const NeighborhoodStep: React.FC<NeighborhoodStepProps> = ({
  onComplete,
  formData,
  neighborhoods,
}) => {
  const initialSelected =
    neighborhoods?.find((n) => n.id === formData.neighborhoodId) || null;
  const [selectedNeighborhood, setSelectedNeighborhood] =
    useState<Neighborhood | null>(initialSelected);

  const handleNeighborhoodSelect = (neighborhood: Neighborhood) => {
    setSelectedNeighborhood(neighborhood);
    onComplete({
      neighborhoodId: neighborhood.id,
      neighborhoodName: neighborhood.name,
    });
  };

  if (!neighborhoods || neighborhoods.length === 0) {
    return (
      <p className="text-red-500 text-center">No neighborhoods available.</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-obsidian mb-4">
          Where are you moving?
        </h3>
      </div>

      <NeighborhoodGrid
        neighborhoods={neighborhoods}
        selectedId={selectedNeighborhood?.id}
        onSelect={handleNeighborhoodSelect}
      />
    </div>
  );
};

export default NeighborhoodStep;
