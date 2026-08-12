/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Netlify's Next.js runtime handles the adapter layer automatically;
  // no custom `output` mode is required here.
  eslint: {
    // Linting is run explicitly via `npm run lint` / CI, not blocking local dev builds.
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
