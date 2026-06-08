/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'image.pollinations.ai' },
      { protocol: 'https', hostname: 'www.nutriwellmart.com' },
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: '5.imimg.com' },
      { protocol: 'https', hostname: 'tiimg.tistatic.com' },
      { protocol: 'https', hostname: 'assets.clevelandclinic.org' },
      { protocol: 'https', hostname: 'irp.cdn-website.com' },
      { protocol: 'https', hostname: 'vedicnutraceuticals.com' },
      { protocol: 'https', hostname: 'globalhubexports.com' },
      { protocol: 'https', hostname: 'food.fnr.sndimg.com' },
      { protocol: 'https', hostname: 'admin.saptham.com' },
    ],
  },

  experimental: {
    webpackBuildWorker: false,
  },

  // Force browsers to revalidate cached CSS/JS
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;