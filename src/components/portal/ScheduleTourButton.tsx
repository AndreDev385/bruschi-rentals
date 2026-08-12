import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScheduleTourButton() {
  return (
    <div className="my-4">
      <a
        href="https://wa.link/32qxlm"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button size="lg" className="w-full text-base font-bold">
          <Calendar className="size-5" />
          Schedule a tour
        </Button>
      </a>
    </div>
  );
}
