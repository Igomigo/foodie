import React from "react";

export default function Location({ location, loading }: { location: string, loading: boolean }) {
  return (
    <div className="md:flex items-center space-x-4 hidden">
      <div className="flex items-center space-x-2">
        <p>📍</p>
        <p className="text-gray-600 text-sm">
          {loading ? "Loading..." : location}
        </p>
      </div>
      {/* <button className="text-orange-500 font-semibold text-sm hover:bg-gray-100 rounded-md p-2 transition-colors">
        Change
      </button> */}
    </div>
  );
}
