import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-3">
      <h1 className="text-4xl font-bold">Flavour Compass</h1>
      <p className="text-lg">Find the best food in your area</p>
      <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg">Click to get started</button>
    </div>
  );
}
