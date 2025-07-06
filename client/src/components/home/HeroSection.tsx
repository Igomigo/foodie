"use client";

import { getUser } from "@/config/axios";
import { getLocation } from "@/sevices/location.service";
import { ChefHat, Clock, MapPin } from "lucide-react";
import React, { useEffect, useState } from "react";

interface User {
  _id: string;
  username: string;
  email: string;
  accessToken: string;
}

export default function HeroSection() {
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    try {
      const userData = getUser();
      setUserData(userData);
    } catch (error) {
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchLocation = async () => {
      setIsLoadingLocation(true);
      try {
        const location = await getLocation();
        setLocation(location);
      } catch (error) {
        setLocation("Location");
      } finally {
        setIsLoadingLocation(false);
      }
    };
    fetchLocation();
  }, []);

  return (
    <section
      aria-label="Hero Section"
      className="flex text-white items-center p-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl justify-between"
    >
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold mb-2">
          Hello, {isLoading ? "..." : userData?.username}! <span>👋</span>
        </h1>
        <p className="text-orange-100 mb-4">
          What delicious African cuisine are you craving today?
        </p>
        <div className="flex items-center text-sm gap-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{isLoadingLocation ? "..." : location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Delivery in 20-30 mins</span>
          </div>
        </div>
      </div>
      <div className="hidden md:block">
        <div className="flex items-center justify-center bg-white/20 rounded-full p-2 w-24 h-24">
          <ChefHat className="text-white w-12 h-12" />
        </div>
      </div>
    </section>
  );
}
