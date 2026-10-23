import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // The shared location catalogue lives alongside client/ and server/.
  outputFileTracingRoot: path.resolve(__dirname, ".."),
};

export default nextConfig;
