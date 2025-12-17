
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  reactStrictMode: false,
  outputFileTracingIncludes: {
    '/api/**/*': [
      path.join(__dirname, '../../packages/db/generated/prisma/*.node'),
      path.join(__dirname, '../../packages/db/generated/prisma/**/*'),
    ],
  },
};

export default nextConfig;
