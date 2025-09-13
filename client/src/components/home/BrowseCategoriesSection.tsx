import React from "react";

const categories = [
  {
    icon: "🍚",
    category: "Rice Dishes",
    count: "150 Items",
  },
  {
    icon: "🍲",
    category: "Soups",
    count: "32 Items",
  },
  {
    icon: "🔥",
    category: "Grilled",
    count: "120 Items",
  },
  {
    icon: "🥣",
    category: "Swallow",
    count: "24 Items",
  },
  {
    icon: "🍔",
    category: "Snacks",
    count: "100 Items",
  },
  {
    icon: "🍹",
    category: "Drinks",
    count: "45 Items",
  },
];

export default function BrowseCategoriesSection() {
  return (
    <section className="border border-gray-200 rounded-lg p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold">Browse by Categories</h2>
          <p className="text-xs bg-gray-100 font-semibold rounded-full px-2 py-1">
            popular
          </p>
        </div>
        {/** For Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((category, index) => (
            <button
              key={index}
              className="flex flex-col items-center border border-gray-200 rounded-lg p-4 group hover:bg-orange-50 hover:border-ornage-200 transition-all duration-300"
            >
              <div className="text-2xl group-hover:scale-110 transition-transform mb-2">
                {category.icon}
              </div>
              <h3 className="font-medium">{category.category}</h3>
              <p className="text-xs text-gray-500">{category.count}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
