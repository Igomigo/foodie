"use client";

import { useRef } from "react";
import { assistantName } from "@/data/assistant";

import { Sparkles, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import BrandButton from "@/components/shared/BrandButton";

export default function AIChatModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const opener = useRef<HTMLElement | null>(null);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={() => {
          opener.current = document.activeElement as HTMLElement | null;
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          opener.current?.focus({ preventScroll: true });
        }}
        className="w-[calc(100%-2rem)] max-w-[470px] overflow-hidden rounded-[30px] border-foodie-line bg-foodie-paper p-0 text-foodie-ink"
      >
        <div className="bg-foodie-forest px-8 pt-10 pb-9 text-foodie-paper">
          <span className="mb-6 grid size-12 place-items-center rounded-2xl border border-foodie-sage/25 text-foodie-sage">
            <Sparkles size={24} strokeWidth={1.4} aria-hidden="true" />
          </span>
          <p className="mb-3 text-[9px] tracking-[.18em] text-foodie-sage uppercase">
            Your food person, coming soon
          </p>
          <DialogTitle className="text-4xl leading-[1.06] font-medium tracking-[-.055em]">
            Ask {assistantName}.
            <br />
            <em className="font-foodie-display font-normal text-foodie-sage">
              Let’s talk food.
            </em>
          </DialogTitle>
        </div>
        <div className="px-8 pt-2 pb-8">
          <DialogDescription className="text-xs leading-[1.9] text-foodie-muted">
            {assistantName} is coming next: a little help finding food around
            you, with your taste and budget in mind.
          </DialogDescription>
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-foodie-sage/30 px-4 py-3 text-[11px] text-foodie-forest">
            <ArrowUpRight size={16} aria-hidden="true" />
            Personal recommendations are not available yet.
          </div>
          <BrandButton
            className="mt-6 w-full"
            onClick={() => {
              onOpenChange(false);
              router.push("/home#cravings");
            }}
          >
            Explore food for now
          </BrandButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
