/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy /api/* → Express backend (freshkart-backend) on port 5000
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },

  // Allow Unsplash images used in product/category cards
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
