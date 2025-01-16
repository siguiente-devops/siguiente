import type { NextConfig } from "next";

const staticWebappOrigin = process.env["SWA_ORIGIN"]

const nextConfig: NextConfig = {
    output: "standalone",
    experimental: {
        serverActions: {
            allowedOrigins: staticWebappOrigin ? [staticWebappOrigin] : undefined
        }
    }
};

export default nextConfig;
