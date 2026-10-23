import { Asterisk } from "lucide-react";

export default function FlavourStrip() {
  return (
    <div
      aria-hidden="true"
      className="flex items-center justify-center gap-6 overflow-hidden border-y border-foodie-line px-6 py-6 text-[8px] font-medium tracking-[.16em] whitespace-nowrap text-foodie-muted sm:gap-9 lg:gap-16 lg:text-[10px]"
    >
      <span>PARTY JOLLOF</span>
      <Asterisk
        size={20}
        strokeWidth={1.1}
        className="shrink-0 text-foodie-orange"
      />
      <span>CORRECT SUYA</span>
      <Asterisk
        size={20}
        strokeWidth={1.1}
        className="shrink-0 text-foodie-orange"
      />
      <span>HOME COMFORTS</span>
      <Asterisk
        size={20}
        strokeWidth={1.1}
        className="hidden shrink-0 text-foodie-orange sm:block"
      />
      <span className="hidden sm:block">NO DULLING</span>
    </div>
  );
}
