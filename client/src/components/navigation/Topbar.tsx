import React, { useState } from "react";
import Search from "../Search";
import MobileMenu from "./MobileMenu";
import { Menu, Bell, ShoppingCart } from "lucide-react";

interface TopbarProps {
  sidebarOpen: boolean;
}

export default function Topbar({ sidebarOpen }: TopbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`flex justify-between items-center fixed top-0 z-40 px-6 py-4 border-b-1 border-b-gray-200 bg-white transition-all duration-500 ${
        sidebarOpen ? "md:left-64" : "md:left-12"
      } left-0 right-0`}
    >
      <div className="flex items-center gap-4">
        {/** Mobile Menu */}
        <div className="fixed top-4 left-4 z-50 md:hidden">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
        </div>
        <div className="block md:hidden w-full">
          <MobileMenu isOpen={isOpen} handleClose={() => setIsOpen(false)} />
        </div>
        <Search />
      </div>

      <div className="flex items-center space-x-6">
        <nav className="flex items-center space-x-6">
          <div><Bell size={22} className="text-gray-700" /></div>
          <div><ShoppingCart size={22} className="text-gray-700" /></div>
        </nav>
        <div>profile</div>
      </div>
    </div>
  );
}
