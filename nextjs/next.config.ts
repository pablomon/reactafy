import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "staging.aguafy.com",
                pathname: "/wp-content/uploads/**",
            },
            {
                protocol: "https",
                hostname: "aguafy.com",
                pathname: "/wp-content/uploads/**",
            },
        ],
    },
};

export default nextConfig;
