"use client";

import { useRef } from "react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import LocationForm from "@/components/location/LocationForm";
import { useProfile } from "@/components/app/ProfileContext";

export default function LocationDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useProfile();
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
        className="max-h-[90svh] w-[calc(100%-2rem)] max-w-[520px] overflow-y-auto rounded-3xl border-foodie-line bg-foodie-paper p-6 text-foodie-ink sm:p-8"
      >
        <DialogTitle className="pr-10 text-2xl font-medium tracking-tight">
          Your corner of the map.
        </DialogTitle>
        <DialogDescription className="mb-2 text-xs leading-relaxed text-foodie-muted">
          Help us look closer to home. This is your discovery area; delivery
          details come when you order.
        </DialogDescription>
        {user && (
          <LocationForm
            key={`${user.userId}-${open}`}
            onSaved={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
