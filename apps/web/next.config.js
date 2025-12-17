
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  reactStrictMode: false,
  outputFileTracingIncludes: {
    '/api/**/*': [
      '../../packages/db/generated/prisma/**/*',
    ],
  },
};

export default nextConfig;

