"use client";

import Image from "next/image";
import { X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import type { Dish } from "./dishes";
import BrandButton from "@/components/shared/BrandButton";
import { Eyebrow } from "./ui";

export default function DishDialog({
  dish,
  exploreHref,
  onClose,
  onRestoreFocus,
}: {
  dish: Dish | null;
  exploreHref: string;
  onClose: () => void;
  onRestoreFocus: () => void;
}) {
  return (
    <Dialog.Root
      open={Boolean(dish)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-60 bg-[#152017]/65 backdrop-blur-md motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 z-61 grid max-h-[calc(100dvh-40px)] w-[calc(100vw-32px)] max-w-[800px] -translate-x-1/2 -translate-y-1/2 overflow-x-hidden overflow-y-auto rounded-3xl bg-foodie-paper text-foodie-ink shadow-[0_30px_100px_#11271950] outline-none motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0 motion-safe:data-[state=open]:zoom-in-95 sm:grid-cols-2"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            onRestoreFocus();
          }}
        >
          {dish && (
            <>
              <div className="relative min-h-[230px] bg-[#ede8dc] sm:min-h-[430px]">
                <Image
                  src={dish.image}
                  alt={dish.alt}
                  fill
                  sizes="(max-width: 639px) 90vw, 400px"
                  className={
                    dish.contain ? "object-contain p-4" : "object-cover"
                  }
                />
              </div>
              <div className="p-7 sm:pt-14 sm:pb-10">
                <Eyebrow className="text-[9px] text-foodie-muted">
                  YOUR NEXT CRAVING?
                </Eyebrow>
                <Dialog.Title className="mt-4 text-[34px] leading-[1.08] font-medium tracking-[-1.6px]">
                  {dish.name}
                </Dialog.Title>
                <Dialog.Description className="mt-5 text-xs leading-[1.9] text-foodie-muted">
                  {dish.story}
                </Dialog.Description>
                <div className="mt-5 mb-7 flex flex-wrap gap-2">
                  {dish.notes.map((note) => (
                    <span
                      key={note}
                      className="rounded-full border border-foodie-line px-3 py-2 text-[9px] text-foodie-muted"
                    >
                      {note}
                    </span>
                  ))}
                </div>
                <BrandButton href={exploreHref}>
                  Find food like this
                </BrandButton>
                <p className="mt-4 text-[10px] leading-relaxed text-foodie-muted">
                  A little inspiration. Menus vary by kitchen.
                </p>
              </div>
            </>
          )}
          <Dialog.Close
            aria-label="Close dish details"
            className="absolute top-3 right-3 grid size-11 cursor-pointer place-items-center rounded-full bg-foodie-paper/95 text-foodie-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foodie-action"
          >
            <X size={21} aria-hidden="true" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
