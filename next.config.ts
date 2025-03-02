/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config: any) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    config.module.rules.push({
      test: /\.json$/,
      type: "json",
    });

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["@xenova/transformers"],
  },
};

module.exports = nextConfig;
