import React from "react";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import { Button } from "../ui/button";
import { Clock, MapPin, Plus, Star } from "lucide-react";
import { Badge } from "../ui/badge";

interface FoodCardProps {
  name: string;
  restaurant: string;
  image: string;
  price: number;
  rating: number;
  deliveryTime: string;
  distance: string;
  tags: string[];
  isPopular?: boolean;
}

export default function FoodCard({
  name,
  restaurant,
  image,
  price,
  rating,
  deliveryTime,
  distance,
  tags,
  isPopular,
}: FoodCardProps) {
  return (
    <Card className="hover:shadow-xl pt-0 group shadow-none cursor-pointer hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <div className="relative">
        <Image
          src={image || "/images/food-placeholder.png"}
          alt={name || "Food Image"}
          width={300}
          height={200}
          className="w-full h-48 group-hover:scale-105 transition-transform duration-300 object-cover bg-gray-200"
        />
        {isPopular && (
          <div className="absolute top-3 left-3 bg-orange-500 hover:bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
            🔥 Popular
          </div>
        )}
        <Button
          size={"icon"}
          className="absolute top-3 right-3 bg-white/90 hover:bg-white hover:shadow-md text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <CardContent className="px-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{name}</h3>
            <p className="text-orange-500 font-bold">₦{price}</p>
          </div>
          <p className="text-sm text-gray-500">{restaurant}</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm text-gray-500">{rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">{deliveryTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">{distance}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {tags.map((tag) => (
              <Badge
                variant={"secondary"}
                className="font-semibold"
                key={tag}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
