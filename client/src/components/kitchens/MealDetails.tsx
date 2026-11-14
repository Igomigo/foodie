"use client";
import type { MenuItem } from "@/types/discovery";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import FoodImage from "@/components/shared/FoodImage";
import { formatPrice } from "@/lib/food-format";

export default function MealDetails({
  item,
  onClose,
  onRestoreFocus,
}: {
  item: MenuItem | null;
  onClose: () => void;
  onRestoreFocus: () => void;
}) {
  return (
    <Dialog
      open={!!item}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="max-h-[calc(100dvh-40px)] w-[calc(100vw-32px)] max-w-xl gap-0 overflow-y-auto rounded-3xl border-foodie-line bg-foodie-paper p-0 text-foodie-ink motion-reduce:animate-none"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          onRestoreFocus();
        }}
      >
        {item && (
          <>
            <div className="relative aspect-[1.8] bg-[#eeeadd]">
              <FoodImage
                src={item.imageUrl}
                alt={item.name}
                sizes="(max-width: 639px) 90vw, 560px"
              />
            </div>
            <div className="p-6 sm:p-8">
              <DialogTitle className="text-2xl leading-tight font-medium tracking-tight">
                {item.name}
              </DialogTitle>
              <DialogDescription className="mt-3 text-sm leading-relaxed text-foodie-muted">
                {item.description ||
                  "See the meal’s details and available extras below."}
              </DialogDescription>
              <p className="mt-4 text-lg font-medium text-foodie-action">
                {formatPrice(item.price)}{" "}
                <span className="text-xs font-normal text-foodie-muted">
                  base price
                </span>
              </p>
              {!item.isAvailable && (
                <p className="mt-3 text-xs font-medium text-foodie-muted">
                  Currently unavailable
                </p>
              )}
              {item.options.map((option) => (
                <section
                  key={option.optionId}
                  className="mt-6 border-t border-foodie-line pt-4"
                >
                  <h3 className="text-sm font-medium">{option.name}</h3>
                  <p className="mt-1 text-xs text-foodie-muted">
                    {option.minSelections
                      ? `Choose ${option.minSelections}${option.maxSelections > option.minSelections ? `–${option.maxSelections}` : ""}`
                      : `Optional · up to ${option.maxSelections}`}
                  </p>
                  <ul className="mt-3 space-y-3">
                    {option.choices.map((choice) => (
                      <li
                        key={choice.choiceId}
                        className="flex justify-between gap-4 text-sm"
                      >
                        <span>
                          {choice.name}
                          {!choice.isAvailable && (
                            <span className="ml-2 text-xs text-foodie-muted">
                              Unavailable
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 text-foodie-muted">
                          {choice.price
                            ? `+${formatPrice(choice.price)}`
                            : "Included"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
