import { TrendingUp, Clock, Star, Zap } from "lucide-react";
import React from "react";

export default function QuickStatsSection() {
  return (
    <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div className="flex flex-col justify-center items-center border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-300">
        <TrendingUp className="w-8 h-8 text-orange-500 mb-2" />
        <h2 className="text-2xl font-bold">150+</h2>
        <p className="text-sm text-gray-600">Restaurants</p>
      </div>
      <div className="flex flex-col justify-center items-center border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-300">
        <Star className="w-8 h-8 text-yellow-500 mb-2" />
        <h2 className="text-2xl font-bold">4.8</h2>
        <p className="text-sm text-gray-600">Avg Rating</p>
      </div>
      <div className="flex flex-col justify-center items-center border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-300">
        <Clock className="w-8 h-8 text-blue-500 mb-2" />
        <h2 className="text-2xl font-bold">25</h2>
        <p className="text-sm text-gray-600">Min Delivery</p>
      </div>
      <div className="flex flex-col justify-center items-center border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-300">
        <Zap className="w-8 h-8 text-green-500 mb-2" />
        <h2 className="text-2xl font-bold">AI</h2>
        <p className="text-sm text-gray-600">Powered</p>
      </div>
    </section>
  );
}
