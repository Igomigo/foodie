import React, { useState, useEffect } from "react";
import Search from "../Search";
import MobileMenu from "./MobileMenu";
import { Menu, Bell, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { getLocation } from "../../sevices/location.service";
import Location from "../Location";

interface TopbarProps {
  sidebarOpen: boolean;
}

export default function Topbar({ sidebarOpen }: TopbarProps) {
  const [location, setLocation] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);

  useEffect(() => {
    // Get user's current location from ipapi.co
    const fetchLocation = async () => {
      try {
        const location = await getLocation();
        setLocation(location);
      } catch (error) {
        setLocation("Location");
      } finally {
        setLoadingLocation(false);
      }
    };
    fetchLocation();
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
        {/** Location */}
        <Location location={location} loading={loadingLocation} />
      </div>

      {/** Right Side */}
      <div className="flex items-center space-x-6 md:space-x-3">
        {/** Notifications and Cart */}
        <nav className="flex items-center space-x-6 md:space-x-3">
          <Link
            href="/notifications"
            className="hover:bg-gray-100 rounded-md md:p-3 transition-colors"
          >
            <Bell size={18} className="text-gray-700" />
          </Link>
          <Link
            href="/cart"
            className="hover:bg-gray-100 rounded-md md:p-3 transition-colors"
          >
            <ShoppingCart size={18} className="text-gray-700" />
          </Link>
        </nav>
        {/** Profile */}
        <div className="relative hover:bg-gray-100 border border-gray-200 rounded-full p-3 transition-colors">
          <User size={20} className="text-gray-700" />
        </div>
      </div>
    </div>
  );
}
