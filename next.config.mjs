/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: '**.aliExpress.com', pathname: '/**' },
      { protocol: 'https', hostname: '**.alicdn.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'img.icons8.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cf.cjdropshipping.com', pathname: '/**' },
      { protocol: 'https', hostname: 'oss-cf.cjdropshipping.com', pathname: '/**' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    serverComponentsExternalPackages: ['prisma', 'bcryptjs'],
  },
};

export default nextConfig;
