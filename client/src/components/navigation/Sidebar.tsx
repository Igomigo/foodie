"use client";

import Navbar from "./Navbar";

export default function Sidebar({
  onToggle,
}: {
  onToggle: (isOpen: boolean) => void;
}) {
  return (
    // Sidebar for desktop
    <div className="">
      <div className="hidden md:block">
        <Navbar onToggle={onToggle} />
      </div>
    </div>
  );
}
