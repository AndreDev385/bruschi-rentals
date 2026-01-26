import { useEffect, useState } from "react";
import type { Promotion, PriceRange } from "@/types";

interface PromotionsSectionProps {
  promotions: Promotion[];
  priceRange: PriceRange;
}

const PromotionsSection: React.FC<PromotionsSectionProps> = ({
  promotions,
  priceRange,
}) => {
  const [selected, setSelected] = useState("none");

  useEffect(() => {
    const priceDiv = document.getElementById("price-display");
    const priceLabel = document.getElementById("price-label");
    if (!priceDiv || !priceLabel) return;

    const originalFrom = priceRange.from;
    const originalTo = priceRange.to;

    if (selected === "none") {
      priceDiv.innerHTML = `$${originalFrom.toLocaleString()} - $${originalTo.toLocaleString()}`;
      priceLabel.textContent = "per month";
    } else {
      const promoIndex = Number.parseInt(selected);
      const promo = promotions[promoIndex];
      const minMonths = promo.contract_min_months;
      const freeMonths = promo.free_months_count;
      const discountFactor = freeMonths / minMonths;
      const newFrom = Math.round(originalFrom * (1 - discountFactor));
      const newTo = Math.round(originalTo * (1 - discountFactor));
      priceDiv.innerHTML = `<span class="text-3xl font-bold text-primary">$${newFrom.toLocaleString()} - $${newTo.toLocaleString()}</span> <span class="text-sm line-through text-muted-foreground ml-2">$${originalFrom.toLocaleString()} - $${originalTo.toLocaleString()}</span>`;
      priceLabel.textContent = "effective monthly rate";
    }
  }, [selected, promotions, priceRange]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Special Offers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="relative">
          <input
            type="radio"
            name="promotion"
            value="none"
            className="sr-only peer"
            checked={selected === "none"}
            onChange={() => setSelected("none")}
          />
          <div className="border-2 border-border rounded-lg p-4 peer-checked:border-primary peer-checked:bg-primary/5 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-lg">💰</span>
              </div>
              <div>
                <h3 className="font-semibold">Standard Pricing</h3>
                <p className="text-sm text-muted-foreground">
                  No special offers - Original rates apply - Min. 12 months
                  contracts
                </p>
              </div>
            </div>
          </div>
        </label>

        {promotions.map((promo, index) => (
          <label
            key={`${promo.contract_min_months}-${index}`}
            className="relative"
          >
            <input
              type="radio"
              name="promotion"
              value={index}
              className="sr-only peer"
              checked={selected === index.toString()}
              onChange={() => setSelected(index.toString())}
            />
            <div className="border-2 border-border rounded-lg p-4 peer-checked:border-primary peer-checked:bg-primary/5 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">🎁</span>
                </div>
                <div>
                  <h3 className="font-semibold">
                    Get {promo.free_months_count} free months
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Valid for{" "}
                    {promo.contract_max_months
                      ? `${promo.contract_min_months}-${promo.contract_max_months}`
                      : `${promo.contract_min_months}`}{" "}
                    months contracts.
                    {promo.free_month_numbers.length > 0 &&
                      `(applied in months ${promo.free_month_numbers.join(", ")})`}
                  </p>
                </div>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default PromotionsSection;
