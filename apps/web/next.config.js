
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  reactStrictMode: false,
  serverExternalPackages: ['@prisma/client', '@bloom/db'],
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

export default nextConfig;
