import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import type { SwiperRef } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Maximize, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";

interface MediaGalleryProps {
  apartmentVideos: string[];
  buildingVideos: string[];
  apartmentImages: string[];
  buildingImages: string[];
}

interface MediaItem {
  type: "video" | "image";
  url: string;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({
  apartmentVideos,
  buildingVideos,
  apartmentImages,
  buildingImages,
}) => {
  const media: MediaItem[] = [
    ...apartmentVideos.map((url) => ({ type: "video" as const, url })),
    ...buildingVideos.map((url) => ({ type: "video" as const, url })),
    ...apartmentImages.map((url) => ({ type: "image" as const, url })),
    ...buildingImages.map((url) => ({ type: "image" as const, url })),
  ];

  console.log({ media });

  const swiperRef = useRef<SwiperRef>(null);
  const modalSwiperRef = useRef<SwiperRef>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  if (media.length === 0) return null;

  return (
    <>
      <div className="relative">
        <Swiper
          ref={swiperRef}
          navigation={false}
          pagination={{ clickable: true }}
          modules={[Autoplay, Pagination]}
          onSlideChange={(swiper) => setCurrentSlideIndex(swiper.activeIndex)}
          className="w-full aspect-video md:aspect-[16/9] rounded-none overflow-hidden bg-black"
        >
          {media.map((item, index) => (
            <SwiperSlide
              key={`${item.type}-${item.url}-${index}`}
              className="flex items-center justify-center"
            >
              {item.type === "video" ? (
                <video
                  src={item.url}
                  controls
                  muted
                  autoPlay
                  loop
                  className="w-full h-full object-contain"
                  preload="metadata"
                />
              ) : (
                <img
                  src={item.url}
                  loading="lazy"
                  className="w-full h-full object-contain"
                  alt={`Media ${index + 1}`}
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>
        {/* Custom Navigation Buttons */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => swiperRef.current?.swiper.slidePrev()}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => swiperRef.current?.swiper.slideNext()}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white"
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        {/* Expand Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsModalOpen(true)}
          className="absolute top-2 right-2 z-10 text-white"
          aria-label="Expand gallery"
        >
          <Maximize className="w-5 h-5" />
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="p-0 bg-black border-none rounded-none"
          aria-roledescription="Show media"
          aria-describedby="Aparment media"
          aria-description="Aparment media"
          style={{
            height: "100vh",
            maxWidth: "100vw",
          }}
          showCloseButton={false}
        >
          <DialogTitle />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsModalOpen(false)}
            className="absolute top-2 right-2 z-20 text-white"
            aria-label="Close gallery"
          >
            <X className="w-5 h-5" />
          </Button>
          {/* Custom Navigation Buttons */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => modalSwiperRef.current?.swiper.slidePrev()}
            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => modalSwiperRef.current?.swiper.slideNext()}
            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white"
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Swiper
            ref={modalSwiperRef}
            initialSlide={currentSlideIndex}
            autoplay={false}
            navigation={false}
            pagination={{ clickable: true }}
            modules={[Pagination]}
            className="w-full h-full"
          >
            {media.map((item, index) => (
              <SwiperSlide
                key={`${item.type}-${item.url}-${index}`}
                className="flex items-center justify-center"
              >
                {item.type === "video" ? (
                  <video
                    src={item.url}
                    controls
                    muted
                    autoPlay
                    loop
                    className="w-full h-full object-contain"
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={item.url}
                    loading="lazy"
                    className="w-full h-full object-contain"
                    alt={`Media ${index + 1}`}
                  />
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MediaGallery;
