"use client";

import Navbar from "./Navbar";

export default function Sidebar() {
  return (
    // Sidebar for desktop
    <div className="">
      <div className="hidden md:block">
        <Navbar />
      </div>
    </div>
  );
}
