/** @type {import('next').NextConfig} */
const requestedDistDir = process.env.NEXT_DIST_DIR;
const safeDistDir =
  requestedDistDir && requestedDistDir !== ".next-runtime"
    ? requestedDistDir
    : process.env.NODE_ENV === "development"
      ? ".next-dev"
      : ".next-build";

const nextConfig = {
  distDir: safeDistDir,
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    if (dev) {
      if (!config.watchOptions) {
        config.watchOptions = {};
      }
      
      const existingIgnored = config.watchOptions.ignored;
      let ignored = [];
      
      if (Array.isArray(existingIgnored)) {
        ignored = existingIgnored;
      } else if (existingIgnored) {
        ignored = [existingIgnored];
      }

      config.watchOptions.ignored = [
        ...ignored,
        "**/.wwebjs_auth/**",
        "**/.wwebjs_cache/**"
      ].filter(Boolean); // Ensure no empty/null values
    }

    return config;
  }
};

module.exports = nextConfig;
