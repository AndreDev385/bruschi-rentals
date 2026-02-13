import { actions } from "astro:actions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CondoOptionRead } from "@/types";
import {
  Bath,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface CondoOptionCardProps {
  option: CondoOptionRead;
}

const formatPrice = (cents: number) => {
  return `$${(cents / 100).toLocaleString()}`;
};

const formatBaths = (full: number, half: number) => {
  if (half === 0) return `${full}`;
  return `${full}.${half === 5 ? "5" : half}`;
};

const CondoOptionCard = ({ option }: CondoOptionCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState<boolean[]>(() =>
    new Array(option.images.length).fill(false),
  );
  const [isFavorited, setIsFavorited] = useState(option.favorited);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setImageLoaded((prev) => {
        const newLoaded = [...prev];
        newLoaded[currentImageIndex] = true;
        return newLoaded;
      });
    }
  }, [currentImageIndex]);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? option.images.length - 1 : prev - 1,
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === option.images.length - 1 ? 0 : prev + 1,
    );
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const result = await actions.toggleCondoFavorite({
        condoOptionId: option.id,
      });
      if (result.data) {
        setIsFavorited(result.data.favorited);
        toast.success(
          result.data.favorited
            ? "Added to favorites"
            : "Removed from favorites",
        );
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
      toast.error("Failed to update favorite status. Please try again.");
    }
  };

  const currentImage = option.images[currentImageIndex];
  const address =
    `${option.street_number} ${option.compass_point} ${option.street_name} ${option.unit_number}`.trim();

  return (
    <a href={`/portal/condo/${option.id}`} data-astro-prefetch="load">
      <Card className="overflow-hidden hover:shadow-m transition-shadow group cursor-pointer">
        {/* Image Carousel */}
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {option.images.length > 0 ? (
            <>
              {!imageLoaded[currentImageIndex] && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
              )}
              <img
                ref={imgRef}
                src={currentImage}
                alt={address}
                className={cn(
                  "w-full h-full object-cover transition-opacity duration-300",
                  imageLoaded[currentImageIndex] ? "opacity-100" : "opacity-0",
                )}
                onLoad={() =>
                  setImageLoaded((prev) => {
                    const newLoaded = [...prev];
                    newLoaded[currentImageIndex] = true;
                    return newLoaded;
                  })
                }
                onError={() =>
                  setImageLoaded((prev) => {
                    const newLoaded = [...prev];
                    newLoaded[currentImageIndex] = true;
                    return newLoaded;
                  })
                }
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-4xl">🏢</span>
            </div>
          )}

          {/* Image Navigation */}
          {option.images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* New Badge */}
          {!option.seen && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground pointer-events-none">
              New
            </Badge>
          )}

          {/* Favorite Button */}
          <Button
            type="button"
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 bg-background/80 hover:bg-background p-1 rounded-full transition-colors"
            aria-label={
              isFavorited ? "Remove from favorites" : "Add to favorites"
            }
            size="icon"
            variant="ghost"
          >
            <Star
              className={cn(
                "size-5",
                isFavorited
                  ? "fill-favorite text-favorite"
                  : "text-muted-foreground",
              )}
            />
          </Button>

          {/* Image Dots */}
          {option.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {option.images.map((image, index) => (
                <div
                  key={image}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    index === currentImageIndex
                      ? "w-6 bg-background"
                      : "w-1.5 bg-background/60",
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Price and Title */}
          <div className="space-y-2">
            <div className="flex flex-col">
              <span className="font-bold text-primary text-xl whitespace-nowrap">
                {formatPrice(option.list_price)}
              </span>
              <h3 className="font-semibold text-lg leading-tight line-clamp-1">
                {address}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="size-5 flex-shrink-0" />
              <span className="line-clamp-1">{option.city}</span>
            </div>
          </div>

          {/* Beds and Baths */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <BedDouble className="size-4" />
              <span>
                {option.beds} {option.beds === 1 ? "Bed" : "Beds"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="size-4" />
              <span>
                {formatBaths(option.full_baths, option.half_baths)} Baths
              </span>
            </div>
            <div className="text-muted-foreground">
              {option.sqft ? option.sqft : "N/A"} sqft
            </div>
          </div>

          {/* Amenities Preview */}
          {option.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {option.amenities.slice(0, 3).map((amenity) => (
                <Badge key={amenity} variant="secondary" className="text-xs">
                  {amenity}
                </Badge>
              ))}
              {option.amenities.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{option.amenities.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* MLS Number */}
          <div className="text-xs text-muted-foreground">
            MLS #: {option.mls_number}
          </div>
        </div>
      </Card>
    </a>
  );
};

export default CondoOptionCard;
