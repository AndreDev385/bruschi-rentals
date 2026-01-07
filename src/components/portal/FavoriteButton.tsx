import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { actions } from "astro:actions";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  optionId: string;
  initialFavorited: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  optionId,
  initialFavorited,
}) => {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await actions.toggleFavorite({ optionId });
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
        <Heart
          className={cn(
            "size-6",
            isFavorited ? "fill-primary text-primary" : "text-foreground",
          )}
        />
      )}
    </Button>
  );
};

export default FavoriteButton;
