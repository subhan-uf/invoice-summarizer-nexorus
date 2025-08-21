// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Build succeeds even if there are ESLint errors
    ignoreDuringBuilds: true,
  },
};
module.exports = nextConfig;
