import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Allow client components to import from app directory
  },
}

export default nextConfig
