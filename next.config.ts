import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      { source: "/characters", destination: "/marketplace", permanent: true },
      { source: "/characters/new", destination: "/dashboard/characters/new", permanent: true },
      { source: "/characters/:id", destination: "/marketplace/:id", permanent: true },
      { source: "/studio", destination: "/demo", permanent: true },
    ];
  },
};

export default nextConfig;
