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
      '/src/actions': ['./pulic/**/*'],
      '/src/lib': ['./pulic/**/*'],
    },
  },
};

export default nextConfig;
