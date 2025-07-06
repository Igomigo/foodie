"use client";

import {
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
import Link from "next/link";
import React from "react";

const menuItems = [
  {
    title: "Discover",
    items: [
      { title: "Home", icon: Home, url: "/home", badge: null },
      {
        title: "AI Recommendations",
        icon: Sparkles,
        url: "/ai-recommendations",
        badge: null,
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
      { title: "Orders", icon: ShoppingBag, url: "/orders", badge: null },
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

export default function Navbar() {
  return (
    <div className="flex h-screen space-y-5 relative top-0 left-0 z-50 flex-col pt-8 border-r-1 border-r-gray-200 transition-all duration-500 bg-gray-100 w-64">
      <div className="flex items-center space-x-3 px-6">
        <div className="bg-gradient-to-r from-orange-400 to-orange-600 w-10 h-10 flex flex-shrink-0 items-center justify-center text-xl font-bold rounded-xl text-white">
          FO
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-800">Foodie</h2>
          <p className="text-xs text-gray-500">AI-Powered Food Discovery</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto w-full scrollbar">
        <div className="flex flex-col space-y-10 py-5">
          <>
            {menuItems.map((item) => (
              <div key={item.title}>
                <div className="flex flex-col space-y-2 px-2">
                  <p className="text-xs pl-2 text-gray-500 font-semibold">
                    {item.title}
                  </p>
                  {item.items.map((item) => (
                    <Link
                      key={item.title}
                      href={item.url}
                      className="flex py-1 px-2 items-center justify-between space-x-2 text-gray-800 group hover:bg-orange-50 rounded-md hover:text-orange-600 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-2">
                        <item.icon className="w-5 h-5" />
                        <p className="text-sm">{item.title}</p>
                      </div>
                      {item.badge && (
                        <div
                          className={`text-white rounded-full px-3 py-1 text-xs ${
                            item.badge === "Hot" ? "bg-red-500" : "bg-gray-500"
                          }`}
                        >
                          {item.badge}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </>
        </div>
      </nav>
      <div className="p-2 pb-4 flex flex-col">
        <div className="p-3 bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-lg space-y-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6" />
            <h3 className="text-lg font-semibold">AI Premium</h3>
          </div>
          <p className="text-xs">
            Unlock advanced AI recommendations and exclusive deals
          </p>
          <button className="bg-white hover:bg-orange-50 text-orange-500 rounded-lg px-4 py-2 w-full">
            <p className="text-sm font-semibold">Upgrade Now</p>
          </button>
        </div>
      </div>
    </div>
  );
}
