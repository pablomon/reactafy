import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // URLs con barra final, igual que WordPress (/producto/x/y/): las
    // URLs que Google ya tiene indexadas no cambian. Sin barra → 308 a
    // la versión con barra. <Link> la añade solo; fetch("/api/…") no,
    // por eso las llamadas internas llevan la barra escrita.
    trailingSlash: true,

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
