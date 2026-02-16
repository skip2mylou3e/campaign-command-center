/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
  },
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/sdk', 'pdf-parse', 'mammoth'],
  },
};

export default nextConfig;
