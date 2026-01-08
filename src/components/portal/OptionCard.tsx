import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { actions } from "astro:actions";
import type { ClientOptionRead } from "@/types";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface OptionCardProps {
  option: ClientOptionRead;
}

const formatApartmentType = (type: string) => {
  switch (type) {
    case "Studio":
      return "Studio";
    case "OneBed":
      return "1 Bedroom";
    case "TwoBeds":
      return "2 Bedrooms";
    case "ThreeOrMoreBeds":
      return "3+ Bedrooms";
    default:
      return type;
  }
};

const OptionCard = ({ option }: OptionCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState<boolean[]>(() =>
    new Array(option.building_images.length).fill(false),
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
      prev === 0 ? option.building_images.length - 1 : prev - 1,
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === option.building_images.length - 1 ? 0 : prev + 1,
    );
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const result = await actions.toggleFavorite({ optionId: option.id });
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

  const currentImage = option.building_images[currentImageIndex];

  return (
    <a href={`/portal/${option.id}`} data-astro-prefetch="load">
      <Card className="overflow-hidden hover:shadow-m transition-shadow group cursor-pointer">
        {/* Image Carousel */}
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {option.building_images.length > 0 ? (
            <>
              {!imageLoaded[currentImageIndex] && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
              )}
              <img
                ref={imgRef}
                src={currentImage}
                alt={option.building_name}
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
                    newLoaded[currentImageIndex] = true; // Show even on error to avoid gray
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
          {option.building_images.length > 1 && (
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

          {/* Favorite Button */}
          <Button
            type="button"
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 bg-background/80 hover:bg-background p-2 rounded-full transition-colors"
            aria-label={
              isFavorited ? "Remove from favorites" : "Add to favorites"
            }
            variant="ghost"
          >
            <Heart
              className={cn(
                "h-5 w-5",
                isFavorited ? "fill-primary text-primary" : "text-foreground",
              )}
            />
          </Button>

          {/* Favorite Badge */}
          {isFavorited && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-primary text-white">Favorite</Badge>
            </div>
          )}

          {/* Image Dots */}
          {option.building_images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {option.building_images.map((image, index) => (
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
              <h3 className="font-semibold text-lg leading-tight line-clamp-1">
                {option.building_name}
              </h3>
              <span className="font-bold text-primary text-lg whitespace-nowrap">
                ${option.price_range.from.toLocaleString()} - $
                {option.price_range.to.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1">{option.neighborhood_name}</span>
            </div>
          </div>

          {/* Apartment Type */}
          <div className="text-sm text-muted-foreground">
            {formatApartmentType(option.apartment_type)}
          </div>

          {/* Amenities Preview */}
          {option.building_amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {option.building_amenities.slice(0, 3).map((amenity) => (
                <Badge key={amenity} variant="secondary" className="text-xs">
                  {amenity}
                </Badge>
              ))}
              {option.building_amenities.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{option.building_amenities.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </Card>
    </a>
  );
};

export default OptionCard;
