import React, { useState, useEffect, useRef } from "react";
import Search from "../Search";
import MobileMenu from "./MobileMenu";
import {
  Menu,
  Bell,
  ShoppingCart,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";

interface TopbarProps {
  sidebarOpen: boolean;
}

export default function Topbar({ sidebarOpen }: TopbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`flex justify-between items-center fixed top-0 z-40 px-6 md:px-8 py-4 border-b-1 border-b-gray-200 bg-white transition-all duration-500 ${
        sidebarOpen ? "md:left-64" : "md:left-12"
      } left-0 right-0`}
    >
      {/** Left Side */}
      <div className="flex items-center space-x-2">
        {/** Mobile Menu */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 bg-orange-500 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          >
            <Menu size={24} className="text-white" />
          </button>
        </div>
        <div className="block md:hidden w-full">
          <MobileMenu isOpen={isOpen} handleClose={() => setIsOpen(false)} />
        </div>
        {/** Search */}
        <Search />
      </div>

      {/** Right Side */}
      <div className="flex items-center space-x-6 md:space-x-3">
        {/** Notifications and Cart */}
        <nav className="flex items-center space-x-6 md:space-x-3">
          <Link
            href="/notifications"
            className="hover:bg-gray-100 rounded-md md:p-3 transition-colors"
          >
            <Bell size={20} className="text-gray-700" />
          </Link>
          <Link
            href="/cart"
            className="hover:bg-gray-100 rounded-md md:p-3 transition-colors"
          >
            <ShoppingCart size={20} className="text-gray-700" />
          </Link>
        </nav>
        {/** Profile */}
        <div
          ref={dropdownRef}
          className="relative hover:bg-gray-100 border border-gray-200 rounded-full p-3 transition-colors"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className="flex items-center space-x-2">
            <User size={20} className="text-gray-700" />
            <div>
              {dropdownOpen ? (
                <ChevronUp size={20} className="text-gray-700" />
              ) : (
                <ChevronDown size={20} className="text-gray-700" />
              )}
            </div>
          </div>
          {dropdownOpen && (
            <div className="absolute top-12 right-0 w-48 bg-white rounded-md shadow-md">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700">Profile</h3>
                <p className="text-sm text-gray-500">John Doe</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
