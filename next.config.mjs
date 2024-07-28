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
      '/': ['./public/**/*'],
    },
  },
};

export default nextConfig;
