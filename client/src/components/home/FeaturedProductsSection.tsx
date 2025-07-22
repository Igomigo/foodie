import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import FoodCard from "./FoodCard";

const featuredDishes = [
  {
    id: "1",
    name: "Jollof Rice with Grilled Chicken",
    restaurant: "Mama's Kitchen",
    image: "/images/big-fish-white-rice.jpeg",
    price: 2500,
    rating: 4.8,
    deliveryTime: "25-30 min",
    distance: "1.2 km",
    tags: ["Popular", "Spicy"],
    isPopular: true,
  },
  {
    id: "2",
    name: "Amala with Ewedu & Gbegiri",
    restaurant: "Yoruba Delights",
    image: "/images/eba-and-egusi-soup.jpeg",
    price: 2000,
    rating: 4.6,
    deliveryTime: "20-25 min",
    distance: "0.8 km",
    tags: ["Traditional", "Healthy"],
  },
  {
    id: "3",
    name: "Pepper Soup with Catfish",
    restaurant: "Spice Garden",
    image: "/images/Ofada Rice and Sauce.jpeg",
    price: 3000,
    rating: 4.9,
    deliveryTime: "30-35 min",
    distance: "2.1 km",
    tags: ["Spicy", "Protein-rich"],
  },
  {
    id: "4",
    name: "Egusi Soup with Pounded Yam",
    restaurant: "Heritage Foods",
    image: "/images/eba-and-egusi-soup.jpeg",
    price: 2800,
    rating: 4.7,
    deliveryTime: "25-30 min",
    distance: "1.5 km",
    tags: ["Traditional", "Filling"],
  },
];

export default function FeaturedProductsSection() {
  return (
    <section>
      <Card className="shadow-none">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            <TrendingUp className="text-orange-500 w-6 h-6" />
            Featured
          </CardTitle>
          <Button variant={"ghost"} size={"sm"} className="text-orange-500">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="Popular" className="w-full">
            <TabsList className="w-full h-12 p-2">
              <TabsTrigger value="Popular" className="text-gray-600 font-semibold focus:text-black">Popular</TabsTrigger>
              <TabsTrigger value="Nearby" className="text-gray-600 font-semibold focus:text-black">Nearby</TabsTrigger>
              <TabsTrigger value="AI Picks" className="text-gray-600 font-semibold focus:text-black">AI Picks</TabsTrigger>
            </TabsList>
            <TabsContent value="Popular" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredDishes.map(dish => (
                  <FoodCard
                    key={dish.id}
                    {...dish}
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="Nearby">Nearby</TabsContent>
            <TabsContent value="AI Picks">AI Picks</TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
}
