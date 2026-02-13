import { actions } from "astro:actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FavoriteButtonProps {
  optionId: string;
  initialFavorited: boolean;
  actionType?: "option" | "condo";
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  optionId,
  initialFavorited,
  actionType = "option",
}) => {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (actionType === "condo") {
        await actions.toggleCondoFavorite({ condoOptionId: optionId });
      } else {
        await actions.toggleFavorite({ optionId });
      }
      setIsFavorited(!isFavorited);
      toast.success(
        !isFavorited ? "Added to favorites" : "Removed from favorites",
      );
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      toast.error("Failed to update favorite status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleToggle} disabled={loading}>
      {loading ? (
        <Loader2 className="size-6 animate-spin" />
      ) : (
        <Star
          className={cn(
            "size-6",
            isFavorited ? "fill-favorite text-favorite" : "text-foreground",
          )}
        />
      )}
    </Button>
  );
};

export default FavoriteButton;
