/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'c.tenor.com',
      },
    ],
  },
  experimental: {
    outputFileTracingIncludes: {
      '/': ['./pulic/**/*'],
    },
  },
};

export default nextConfig;
