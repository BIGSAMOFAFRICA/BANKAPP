/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Ensure webpack handles default exports correctly
    if (isServer) {
      config.externals = config.externals || [];
    }
    return config;
  },
}

module.exports = nextConfig 