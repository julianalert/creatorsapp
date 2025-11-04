/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.instagram.com',
      },
      {
        protocol: 'https',
        hostname: '*.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: '*.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'instagram.f*.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'instagram.f*.fna.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'scontent-*.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: 'scontent*.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'video.f*.fbcdn.net',
      },
    ],
  },
}

module.exports = nextConfig
