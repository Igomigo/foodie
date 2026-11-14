import type { Kitchen, MenuItem } from "@/types/discovery";

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
export function formatPrice(kobo: number) {
  return naira.format(kobo / 100);
}
export function formatDistance(metres: number | null) {
  if (metres === null) return null;
  return metres < 100
    ? "Less than 100 m away"
    : metres < 1000
      ? `About ${metres} m away`
      : `About ${(metres / 1000).toFixed(1)} km away`;
}
export function kitchenStatus(kitchen: Kitchen) {
  return !kitchen.isOpen
    ? "Closed now"
    : kitchen.isAcceptingOrders
      ? "Open now"
      : "Orders paused";
}

// Required paid choices are part of the minimum meal price; extras stay optional.
export function minimumMealPrice(item: MenuItem) {
  return (
    item.price +
    item.options.reduce((total, option) => {
      const prices = option.choices
        .filter((choice) => choice.isAvailable)
        .map((choice) => choice.price)
        .sort((a, b) => a - b);
      return (
        total +
        prices
          .slice(0, option.minSelections)
          .reduce((sum, price) => sum + price, 0)
      );
    }, 0)
  );
}
