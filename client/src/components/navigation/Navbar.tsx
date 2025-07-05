"use client";

import {
  ArrowLeftToLine,
  ArrowRightToLine,
  Heart,
  HelpCircle,
  Home,
  MapPin,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";

const menuItems = [
  {
    title: "Discover",
    items: [
      { title: "Home", icon: Home, url: "/", badge: null },
      {
        title: "AI Recommendations",
        icon: Sparkles,
        url: "/ai-recommendations",
        badge: "New",
      },
      { title: "Search", icon: Search, url: "/search", badge: null },
      { title: "Trending", icon: TrendingUp, url: "/trending", badge: "Hot" },
      { title: "Near Me", icon: MapPin, url: "/nearby", badge: null },
    ],
  },
  {
    title: "Your Activity",
    items: [
      { title: "Favorites", icon: Heart, url: "/favorites", badge: null },
      { title: "Orders", icon: ShoppingBag, url: "/orders", badge: "3" },
      { title: "Profile", icon: User, url: "/profile", badge: null },
    ],
  },
  {
    title: "Support",
    items: [
      { title: "Settings", icon: Settings, url: "/settings", badge: null },
      { title: "Help", icon: HelpCircle, url: "/help", badge: null },
    ],
  },
];

export default function Navbar({
  onToggle,
}: {
  onToggle: (isOpen: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [close, setClose] = useState(true);

  const handleClick = () => {
    setIsOpen(!isOpen);
    setClose(!close);
  };

  useEffect(() => {
    onToggle(isOpen);
  }, [isOpen]);

  return (
    <div className={`flex h-screen relative top-0 left-0 z-50 flex-col p-4 pt-8 border-r-1 border-r-gray-200 transition-all duration-500 bg-gray-100 ${
        isOpen ? "w-64" : "w-12"
      }`}>
      <div className="flex items-center space-x-3 mb-5">
        <div className="bg-gradient-to-r from-orange-400 to-orange-600 w-10 h-10 flex flex-shrink-0 items-center justify-center text-xl font-bold rounded-xl text-white">FO</div>
        {isOpen && (
          <div>
            <h2 className="text-xl font-bold text-gray-800">Foodie</h2>
            <p className="text-sm text-gray-500">AI-powered Food Discovery</p>
          </div>
        )}
      </div>
      <nav className="flex-1">
        <div className="flex flex-col space-y-4 py-5">
          {isOpen ? (
            <>
              
            </>
          ) : (
            <>
              <p>N</p>
              <p>L</p>
              <p>D</p>
              <p>K</p>
              <p>R</p>
              <p>J</p>
              <p>Z</p>
            </>
          )}
        </div>
        <button
          onClick={handleClick}
          className="absolute bottom-3 -right-0 text-orange-500 hover:bg-orange-500 hover:text-white rounded-full text-semibold p-2"
        >
          {close ? <ArrowLeftToLine /> : <ArrowRightToLine />}
        </button>
        <div className="mb-15 absolute bottom-0">
          <p className="text-red-400">{isOpen ? "Logout" : "L"}</p>
        </div>
      </nav>
    </div>
  );
}
