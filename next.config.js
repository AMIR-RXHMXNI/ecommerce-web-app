/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
      return [
        {
          source: '/auth/confirm',
          destination: '/api/auth/confirm',
        },
      ]
    },
  }
  
  module.exports = nextConfig